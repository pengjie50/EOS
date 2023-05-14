/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class TransactionService extends Service {
    
    async findOne(params){
        const ctx = this.ctx;
        var res=await ctx.model.Transaction.findByPk(params.id);
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
               return  a.transaction_id
            })
            delete obj.where.flow_id
            delete obj.where.flow_id_to
            obj.where.id=ids
        }
        


        
        const list = await ctx.model.Transaction.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        }; 
        
    }

    async statistics(params) {

        const { ctx } = this;

        let obj = {
            where: {}
        }
        if (params.where) {
            obj.where = params.where
        }
       
        var data={
            average_total_duration_per_transaction: {
                all_time: 0,
                month_12: 0,
                day_30: 0
            },

            no_of_transaction: {
                total: 0,
                completed: 0,
                open: 0
            },

            threshold_reached: {
                no: {},
                percentage: {},
                avg_duration: {}
            }

        }
        
        data.no_of_transaction.total = await ctx.model.Transaction.count(obj)
        obj.where.status=1
        data.no_of_transaction.completed = await ctx.model.Transaction.count(obj)
        obj.where.status = 0
        data.no_of_transaction.open = await ctx.model.Transaction.count(obj)

        obj.where.status = 1


        var transactions = await ctx.model.Transaction.findAll( obj)

        var transaction_ids= transactions.map((a) => {
            return a.id
        })
        var alerts=await ctx.model.Alert.findAll({ transaction_id: transaction_ids })
        
        alerts.forEach((a) => {
           

           
            if (a.alertrule_type != 1) {
               
                
                if (!data.threshold_reached.no[a.flow_id]) {
                    data.threshold_reached.no[a.flow_id] = {}
                }
                
                data.threshold_reached.no[a.flow_id][a.transaction_id] = true
                console.log("1111111111111111", a.alertrule_type)
            } else {
                if (!data.threshold_reached.no.b2e) {


                    data.threshold_reached.no.b2e = { }
                }
                data.threshold_reached.no.b2e[a.transaction_id]=true
            }

           
            
           
        })

        for (var i in data.threshold_reached.no) {
            var c = 0
            for (var j in data.threshold_reached.no[i]) {
                c++
            }

            data.threshold_reached.no[i] = c
            if (transaction_ids.length>0) {
                data.threshold_reached.percentage[i] = parseInt((c / transaction_ids.length) * 100+"")
            }
            
        }
        data.average_total_duration_per_transaction.all_time = await ctx.model.Transaction.sum('total_duration', obj)


        if (!obj.where.start_of_transaction) {
            obj.where.start_of_transaction = { [Op['gt']]: new Date((new Date()).getTime() - 30 * 24 * 3600 * 1000) }



            data.average_total_duration_per_transaction.day_30 = await ctx.model.Transaction.sum('total_duration', obj)

            obj.where.start_of_transaction = { [Op['gt']]: new Date((new Date()).getTime() - 12 * 30 * 24 * 3600 * 1000) }

            data.average_total_duration_per_transaction.month_12 = await ctx.model.Transaction.sum('total_duration', obj)
        }

       

        ctx.body = {
            success: true,

            data: data

        }; 
    }
    
    async add(params) {

     
 
        const {ctx} = this;
        params.id=uuid.v1()//.replace(/-/g,"");
        const res = await ctx.model.Transaction.create(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
        

        
        
    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.Transaction.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;
        
    }
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Transaction.findByPk(params.id);

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
    async writetoBC(params) {
        const { ctx, service, app } = this;

        var events = await ctx.model.Transactionevent.findAll({ where: { transaction_id: params.id } });

        var data=events.map((a) => {
            return {
                "EOSID": params.id,
                "EventSubStage": a.flow_id,
                "Timestamp": new Date(a.event_time).toISOString()
            }
        })
        //data= JSON.stringify(data)
        //data = JSON.parse(data);


  
        const result = await ctx.curl(app.config.writetoBCUrl, {
            timeout: 30000,
            method: 'POST',
            contentType: 'json',
            data: data,
            dataType: 'json',
        });


        console.log(result.data)
        console.log(result.status)
        
    }
    async validateBC(params) {
        const { ctx, service, app } = this;

        var events = await ctx.model.Transactionevent.findAll({ where: { transaction_id: params.id } });

        var data = events.map((a) => {
            return {
                "EOSID": params.id,
                "EventSubStage": a.flow_id,
                "Timestamp": "2023-06-06T23:10:05+08:00"//new Date(a.event_time).toISOString()
            }
        })

        console.log(JSON.stringify(data))
        const result = await ctx.curl(app.config.writetoBCUrl, {
            timeout:30000,
            method: 'POST',
            contentType: 'json',
            data: data,
            dataType: 'json',
        });

        
       

        if (result.status==201) {
            ctx.body = { success: true, data: result.data[0] };
        } else {
            ctx.body = { success: true, data: [] };
        }

        console.log(result.data)
        console.log(result.status)
    }
    
}

module.exports = TransactionService;

