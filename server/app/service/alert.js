/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');
const where = require('../middleware/where');
const Sequelize = require('sequelize');

class AlertService extends Service {
    
    async findOne(params){
        const ctx = this.ctx;
        var res=await ctx.model.Alert.findByPk(params.id);
        ctx.body ={success:true,data:res} 
    }
    async list(params) {
        const {ctx,app} = this;
        
        let obj={}  

        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }
        if(params.order){
            obj.order = params.order
        }
        if(params.page && params.limit){
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
      
           
        var t_where = {}
        for (var i in obj.where) {
            if (i.indexOf("t.")>-1) {
                if (!t_where) {
                    t_where = {}
                }
                t_where[i.replace("t.", "")] = obj.where[i]

                delete obj.where[i]
            }
            
        }



        var Op = app.Sequelize.Op

        if (ctx.user.role_type == 'Super') {

            if (obj.where.organization_id) {
                obj.where.company_id = obj.where.organization_id
            } 

        } else if (ctx.user.role_type == 'Trader') {
            if (obj.where.organization_id) {
                obj.where.company_id = obj.where.organization_id
            } else {
         
                obj.where.company_id = {
                    [app.Sequelize.Op['in']]: [...ctx.user.accessible_organization, ctx.user.company_id]
                }
             
            }


        } else if (ctx.user.role_type == 'Terminal') {
            if (obj.where.tab[app.Sequelize.Op.like] == '%Trader%') {
                if (obj.where.organization_id) {
                    obj.where.company_id = obj.where.organization_id
                } else {
                    obj.where.company_id = {
                        [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                    }
                }

            }

        }



      
        delete obj.where.tab
        delete obj.where.organization_id

        
        obj.include = [{
            as: 't',
            model: ctx.model.Transaction,
            where: t_where
        }, {
                as: 'ar',
                model: ctx.model.AlertruleTransaction
                
            }]
        var showNoRead=false
        if (obj.where && obj.where.showNoRead) {
            showNoRead = true
            delete obj.where.showNoRead
        }
        obj.raw = true
       
        const list = await ctx.model.Alert.findAndCountAll(obj)


      
        
        ctx.status = 200;
        
        


        if (showNoRead) {
            var noReadArr = await ctx.model.query("select *  FROM alert where id not in (select alert_id from alert_user_read where user_id='" + ctx.user.user_id + "')", { type: Sequelize.QueryTypes.SELECT })
            var m = new Map()
            noReadArr.forEach((nr) => {
                m.set(nr.id, true)
            })
            var readArr = []
            list.rows.forEach((a) => {
                if (m.get(a.id)) {
                    readArr.push({ user_id: ctx.user.user_id, alert_id: a.id })
                }


            })

            if (readArr.length > 0) {
                await ctx.model.AlertUserRead.bulkCreate(readArr);
            }
            ctx.body = {
                success: true,
                total: noReadArr.length,
                data: noReadArr

            };
        } else {
            ctx.body = {
                success: true,
                total: list.count,
                data: list.rows

            }; 
        }
       
        
    }
    async getUserUnreadAlertCount(params) {
        const { ctx, sequelize,app } = this;

        var obj = { where: {}, raw :true }
        if (ctx.user.role_type == 'Trader') {

            obj.where.trader_id = ctx.user.company_id
            obj.where.terminal_id = {
                [app.Sequelize.Op['in']]: ctx.user.accessible_organization
            }
        } else if (ctx.user.role_type == 'Terminal') {
            obj.where.terminal_id = ctx.user.company_id
            obj.where.trader_id = {
                [app.Sequelize.Op['in']]: ctx.user.accessible_organization
            }
        }
        var tarr =await ctx.model.Transaction.findAll(obj);
       var tids=  tarr.map((a) => {
            return a.id
        })
        var count = await ctx.model.query("select count(*) as count FROM alert where id not in (select alert_id from alert_user_read where user_id='" + ctx.user.user_id + "') and transaction_id in ('" + tids.join("','")+"')", { type: Sequelize.QueryTypes.SELECT })
        return count[0]['count']
    }
    
    async add(params) {

     
 
        const {ctx} = this;
        
        const res = await ctx.model.Alert.create(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
       
    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.Alert.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;
        
    }
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Alert.findByPk(params.id);

        if (!user) {
          ctx.status = 404;
            ctx.body = { success: false, errorCode:1000};
          return;
        }

        const res = await user.update(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success:false,errorCode:1000};
        }
       
    }
    
}

module.exports = AlertService;

