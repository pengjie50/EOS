/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class ReportService extends Service {
    
    async findOne(params){
        const ctx = this.ctx;
        var res=await ctx.model.Report.findByPk(params.id);
        ctx.body = { success: true,data:res} 
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
        obj.attributes = [[ctx.model.col('u.username'), 'username'], [ctx.model.col('c.name'),'company_name'],'report.*']
        obj.include=[{
            as:'c',
            model: ctx.model.Company
          
        }, {
                as: 'u',
                model: ctx.model.User

            }]
        obj.raw=true
        const list = await ctx.model.Report.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows,
            

        }; 
        
    }



    async summary(params) {
        const { ctx,app } = this;
        var transaction_filter_num=0
        var transaction_total_num=0
        let obj = {}

        if (params.where) {
            obj.where = params.where
        }
        if (params.order) {
            obj.order = params.order
        }
        if (params.page && params.limit) {
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }


        if (obj.where && (obj.where.flow_id || obj.where.flow_id_to)) {
            var w = {}
            if (obj.where.flow_id) {
                w.flow_id = obj.where.flow_id
            }

            if (obj.where.flow_id_to) {
                w.flow_id_to = obj.where.flow_id_to
            }
            const alert = await ctx.model.Alert.findAll({ where: w })
            var ids = alert.map((a) => {
                return a.transaction_id
            })
            delete obj.where.flow_id
            delete obj.where.flow_id_to
            obj.where.id = ids
        }

        var Op = app.Sequelize.Op
        if (obj.where.organization_id) {
            if (ctx.user.role_type == 'Super') {
                obj.where[Op['or']] = [{ terminal_id: obj.where.organization_id }, { trader_id: obj.where.organization_id }]
            } else if (ctx.user.role_type == 'Trader') {

                obj.where.terminal_id = obj.where.organization_id
            } else if (ctx.user.role_type == 'Terminal') {
                obj.where.trader_id = obj.where.organization_id
            }
            delete obj.where.organization_id
        } else {
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
        }
       
        obj.raw= true

        const transactions = await ctx.model.Transaction.findAll(obj)

        transaction_filter_num = transactions.length
        transaction_total_num = await ctx.model.Transaction.count()

        var transactionsMap = {}

        var transaction_ids = transactions.map((a) => {
            transactionsMap[a.id]=a
            return a.id
        })


        var alerts = await ctx.model.Alert.findAll({ where: { transaction_id: transaction_ids },raw: true })
       var alertsMap = {}
        alerts.forEach((a) => {

            var k = a.transaction_id + a.flow_id + a.flow_id_to + a.type

            if (!alertsMap.hasOwnProperty(k)) {
                
                alertsMap[k]=0
            } 

            alertsMap[k]++


        })



        var Transactionevent = await ctx.model.Transactionevent.findAll({ where: { transaction_id: transaction_ids }, order: [['event_time', 'asc'], ['transaction_id', 'asc']] })
        var TransactioneventMap = {}
        Transactionevent.forEach((a) => {

            if (!TransactioneventMap[a.transaction_id]) {
                TransactioneventMap[a.transaction_id]=[]
            }
            TransactioneventMap[a.transaction_id].push(a)

        })
        var list=[]
        for (var i in TransactioneventMap) {
            var transactionevents = TransactioneventMap[i]

            transactionevents.forEach((a,index) => {
                var next = transactionevents[index+1]
                if (next) {
                    var c = { ...transactionsMap[i] }
                    delete c.flow_id
                    console.log("xxxxxxxxxxxxxxxxx", transactionsMap[i])
                    c.id = a.id
                    c.flow_pid = a.flow_pid
                    c.flow_id = a.flow_id
                    c.flow_id_to = next.flow_id
                    c.event_time = a.event_time
                    c.duration = ((new Date(next.event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000
                    
                        c.amber_alert_num = alertsMap[i + c.flow_id + c.flow_id_to + 0] || 0
                    c.red_alert_num = alertsMap[i + c.flow_id + c.flow_id_to + 1] || 0
                    list.push(c)
                }


            })


        }


        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.length,
            data: list,
            transaction_filter_num: transaction_filter_num,
            transaction_total_num: transaction_total_num
        };

    }
    
    async add(params) {

     
 
        const {ctx} = this;
       
        params.company_id = ctx.user.company_id
        const res = await ctx.model.Report.create(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
        

        
        
    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.Report.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;
        
    }
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Report.findByPk(params.id);

        if (!user) {
          ctx.status = 404;
            ctx.body = { success: false, errorCode:1000};
          return;
        }

        const res = await user.update(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
       
    }
    
}

module.exports = ReportService;

