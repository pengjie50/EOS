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
        const {ctx} = this;
        
        let obj={}  

        if(params.where){
           obj.where = params.where
        }
        if(params.order){
            obj.order = params.order
        }
        if(params.page && params.limit){
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
        if (!ctx.user.isAdmin) {
            if (obj.where) {
                obj.where.user_id = ctx.user.user_id
            } else {
                obj.where = { user_id: ctx.user.user_id }
            }
        }
        
        obj.include = [{
            as: 't',
            model: ctx.model.Transaction,
            where: params.where && params.where['t.terminal_id'] ? { terminal_id: params.where['t.terminal_id'] } :null
        }]

        obj.raw = true

        const list = await ctx.model.Alert.findAndCountAll(obj)
        console.log(list.rows)
        ctx.status = 200;
        
         var noReadArr = await ctx.model.query("select id  FROM alert where id not in (select alert_id from alert_user_read where user_id='" + ctx.user.user_id + "')", { type: Sequelize.QueryTypes.SELECT })
        var m = new Map()
        noReadArr.forEach((nr) => {
            m.set(nr.id,true)
        })
        var readArr=[]
        var noReadArr = list.rows.forEach((a) => {
            if (m.get(a.id)) {
                readArr.push({ user_id: ctx.user.user_id, alert_id: a.id }) 
            }

           
        })

        if (readArr.length>0) {
            await ctx.model.AlertUserRead.bulkCreate(readArr);
        }
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        }; 
        
    }
    async getUserUnreadAlertCount(params) {
        const { ctx, sequelize } = this;
   
        var count = await ctx.model.query("select count(*) as count FROM alert where id not in (select alert_id from alert_user_read where user_id='" + ctx.user.user_id + "')", { type: Sequelize.QueryTypes.SELECT })
        return count[0]['count']
    }
    async getUserUnreadAlert(params) {
        const { ctx, sequelize } = this;

        var count = await ctx.model.query("select count(*) as count FROM alert where id not in (select alert_id from alert_user_read where user_id='" + ctx.user.user_id + "')", { type: Sequelize.QueryTypes.SELECT })
        return count[0]['count']
    }
    async add(params) {

     
 
        const {ctx} = this;
        params.id=uuid.v1()//.replace(/-/g,"");
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

