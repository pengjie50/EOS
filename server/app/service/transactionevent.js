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
        params.event_time = "2023-03-01 08:03:11"

        var flow = await ctx.model.Flow.findOne({ where: { id: params.flow_id } })
        params.flow_pid = flow.pid

        var events = await ctx.model.Transactionevent.findAll({ where: {transaction_id: params.transaction_id  }, order: [["event_time", "asc"]] })


        if (events.length > 0) {
            var last = events[events.length - 1].event_time

            var r = Math.random(); 
            if (r==0) {
                r=1
            }

            params.event_time = new Date((new Date(last)).getTime() + 3600 * 1000 * 2 * r)

            
        }

       

        if (params.flow_id == 'e63c92e0-d748-11ed-b978-63067b0b1a2b') {
            await ctx.model.Transaction.update({ start_of_transaction: params.event_time }, { where: { id: params.transaction_id } });

        } else {


            var transaction = await ctx.model.Transaction.findOne({ where: { id: params.transaction_id } })
            var last = events[events.length - 1].event_time
            var total_duration = (new Date(params.event_time)).getTime() / 1000 - (new Date(transaction.start_of_transaction)).getTime() / 1000

            console.log((new Date(transaction.start_of_transaction)).getTime())
            await ctx.model.Transaction.update({ total_duration: total_duration }, { where: { id: params.transaction_id } });
        }


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

            var transaction = await ctx.model.Transaction.findOne({ where: { id: params.transaction_id } })
            await ctx.model.Transaction.update({ flow_id: "", end_of_transaction: new Date(), status: 1 }, { where: { id: params.transaction_id } });
        } else {
            await ctx.model.Transaction.update({ flow_id: params.flow_pid }, { where: { id: params.transaction_id } });
        }


        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }
       
        
    }
    
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Transactionevent.findByPk(params.id);

        if (!user) {
            ctx.status = 404;
            ctx.body = { success: false, errorCode: 1000 };
            return;
        }

        const res = await user.update(params);
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

