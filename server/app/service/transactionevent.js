/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class TransactioneventService extends Service {
    
    async getById(params){
        const {ctx} = this;
        try {
            if (!params.id) {
                params.id=ctx.role.role_id
                
            }
            const role = await ctx.model.Transactionevent.findOne({
                where: {
                    id: params.id
                },
            });
            return role
        } catch (e) {
            throw new Error(e)
        }
    }
    async list(params) {
        const { ctx } = this;

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

        const list = await ctx.model.Transactionevent.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        }; 
        
    }

    async add(params) {

        
        const { ctx } = this;
        params.user_id = ctx.user.user_id//.replace(/-/g,"");
        params.event_time = new Date()

        var flow = await ctx.model.Flow.findOne({ where: { id: params.flow_id } })
        params.flow_pid = flow.pid

        var events = await ctx.model.Transactionevent.findAll({ where: { flow_pid: flow.pid }, order:[["event_time","asc"]] })
        if (events && events.length > 0) {
            var duration=  params.event_time.getTime() / 1000- (new Date(events[0].event_time)).getTime() / 1000
            var alertrule = await  ctx.model.Alertrule.findOne({ where: { flow_id: flow.pid } })
            if (alertrule) {
                if (duration > alertrule.hours * 3600 + alertrule.mins * 60) {
                    //±¨¾¯

                    await ctx.model.Alert.create({
                        id: uuid.v1(),flow_id: flow.pid, transaction_id: params.transaction_id })

                }
            }

        }
        const res = await ctx.model.Transactionevent.create(params);

        
        if (params.flow_id == '66ba5680-d912-11ed-a7e5-47842df0d9cc') {
            await ctx.model.Transaction.update({ flow_id: "", end_of_transaction: new Date(), status: 1, total_duration: 0 }, { where: { id: params.transaction_id } });
        } else {
            await ctx.model.Transaction.update({ flow_id: params.flow_pid }, { where: { id: params.transaction_id } });
        }


        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }
       
        
    }
    

    async del(params) {

        
        const {ctx} = this;
      
        const res = await ctx.model.Transactionevent.destroy({ where: { permission_id: params.permission_ids.split(','),role_id:params.role_id } });
        
        if(res){
            ctx.body= {code:0}
        }else{
            ctx.body= {code:1000}
        }

        
        
    }
}

module.exports = TransactioneventService;

