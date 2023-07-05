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


        if (obj.where && (obj.where.flow_id || obj.where.flow_id_to || obj.where.threshold_organization_id)) {
            var w = {}
            if (obj.where.flow_id) {
                w.flow_id = obj.where.flow_id
            }
            if (obj.where.threshold_organization_id) {
                w.company_id = obj.where.threshold_organization_id
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
            delete obj.where.threshold_organization_id
            obj.where.id=ids
        }
        var Op = app.Sequelize.Op
        if (obj.where.organization_id) {
            if (ctx.user.role_type == 'Super') {
                obj.where[Op['or']] = [{ terminal_id: obj.where.organization_id }, { trader_id: obj.where.organization_id }]
            } else if (ctx.user.role_type == 'Trader') {
                obj.where.trader_id = ctx.user.company_id
                obj.where.terminal_id = obj.where.organization_id
            } else if (ctx.user.role_type == 'Terminal') {
                obj.where.trader_id = obj.where.organization_id
                obj.where.terminal_id = ctx.user.company_id
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
        
       
        
        const list = await ctx.model.Transaction.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        }; 
        
    }

    async statistics(params) {

        const { ctx,app } = this;

        let obj = {
            where: {}
        }
        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }
       
        var data={
            average_total_duration_per_transaction: {
                all_time: 0,
                month_12: 0,
                day_30: 0
            },

            no_of_transaction: {
                total: 0,
                closed: 0,
                open: 0,
                cancelled:0
            },

            threshold_reached: {
                no: {},
                percentage: {},
                avg_duration: {}
            }

        }
       
       /* if (obj.where && obj.where.start_of_transaction) {
            var dateArr = obj.where.start_of_transaction[Op.between]
            obj.where.start_of_transaction = { [Op.gte]: dateArr[0] }
            obj.where.end_of_transaction = { [Op.lte]: dateArr[1] }

        }*/
        var Op = app.Sequelize.Op
        var awhere = { transaction_id: null }
        if (ctx.user.role_type == 'Super') {
            if (obj.where.organization_id) {
                obj.where[Op['or']] = [{ terminal_id: obj.where.organization_id }, { trader_id: obj.where.organization_id }]
            }
        } else if (ctx.user.role_type == 'Trader') {

            if (obj.where.organization_id) {


                obj.where.terminal_id = obj.where.organization_id
                obj.where.trader_id = ctx.user.company_id


            } else {
                obj.where.trader_id = ctx.user.company_id
                obj.where.terminal_id = {
                    [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                }

            }
        } else if (ctx.user.role_type == 'Terminal') {

            if (obj.where.organization_id) {


                obj.where.trader_id = obj.where.organization_id
                obj.where.terminal_id = ctx.user.company_id


            } else {
                obj.where.terminal_id = ctx.user.company_id
                obj.where.trader_id = {
                    [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                }

            }




            if (obj.where.tab[app.Sequelize.Op.like] == '%Trader%') {
                awhere.company_id = {
                    [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                }
            } else {
                awhere.company_id = ctx.user.company_id
            }

        }




       
        delete obj.where.organization_id
        delete obj.where.tab
        if (obj.where && obj.where.status && obj.where.status[Op.eq] == '0') {
            data.no_of_transaction.total = await ctx.model.Transaction.count(obj)
            data.no_of_transaction.open = data.no_of_transaction.total
            data.no_of_transaction.closed = 0
            data.no_of_transaction.cancelled = 0
           
           
        } else if (obj.where && obj.where.status && obj.where.status[Op.eq] == '1') {
            data.no_of_transaction.total = await ctx.model.Transaction.count(obj)
            data.no_of_transaction.closed = data.no_of_transaction.total
            data.no_of_transaction.cancelled = 0
            data.no_of_transaction.open =0
        } else if (obj.where && obj.where.status && obj.where.status[Op.eq] == '2') {
            data.no_of_transaction.total = await ctx.model.Transaction.count(obj)
            data.no_of_transaction.cancelled = data.no_of_transaction.total
            data.no_of_transaction.closed = 0
            data.no_of_transaction.open = 0
        } else {
            data.no_of_transaction.total = await ctx.model.Transaction.count(obj)
            obj.where.status = 1
            data.no_of_transaction.closed = await ctx.model.Transaction.count(obj)
            obj.where.status = 2
            data.no_of_transaction.cancelled = await ctx.model.Transaction.count(obj)
            obj.where.status = 0
            data.no_of_transaction.open = await ctx.model.Transaction.count(obj)
            delete obj.where.status
            
        }
        
       

       // obj.where.status = 1
        var transactions = await ctx.model.Transaction.findAll( obj)

        var transaction_ids= transactions.map((a) => {
            return a.id
        })
        awhere.transaction_id = transaction_ids



        
        var alerts = await ctx.model.Alert.findAll({ where: awhere })

        var alertruleTransactions = await ctx.model.AlertruleTransaction.findAll({ where: awhere })
        var alertruleTransactionCountMap = {}
        alertruleTransactions.forEach((a) => {

            var step=1
            if ((a.amber_hours || a.amber_mins) && (a.red_hours || a.red_mins)) {
                step = 2
            }
            if (a == 2) {


                if (!alertruleTransactionCountMap['b2e']) {
                   
                    alertruleTransactionCountMap['b2e'] = step
                    

                   
                } else {
                   
                        alertruleTransactionCountMap['b2e'] += step
                    
                   
                }
            } else {
                if (!alertruleTransactionCountMap[a.flow_id]) {
                    alertruleTransactionCountMap[a.flow_id] = step
                } else {
                    alertruleTransactionCountMap[a.flow_id] += step
                }
            }
           
        })
       
        alerts.forEach((a) => {
           
           
           
            if (a.alertrule_type != 1) {
               
                
                if (!data.threshold_reached.no[a.flow_id]) {
                    data.threshold_reached.no[a.flow_id] = {}
                }
                if (!data.threshold_reached.no[a.flow_id][a.transaction_id]) {
                    data.threshold_reached.no[a.flow_id][a.transaction_id] = {
                        amber: 0, red: 0
                    }
                }
               

                if (a.type == 0) {
                    data.threshold_reached.no[a.flow_id][a.transaction_id].amber++
                }

                    if (a.type == 1) {
                        data.threshold_reached.no[a.flow_id][a.transaction_id].red++
                    }
               
            } else {
                if (!data.threshold_reached.no.b2e) {


                    data.threshold_reached.no.b2e = { }
                }

                    if (!data.threshold_reached.no.b2e[a.transaction_id]) {
                        data.threshold_reached.no.b2e[a.transaction_id] = {
                            amber: 0, red: 0
                        }
                    }

                if (a.type == 0) {
                    data.threshold_reached.no.b2e[a.transaction_id].amber++
                }

                if (a.type == 1) {
                    data.threshold_reached.no.b2e[a.transaction_id].red++
                }

                
            }

           
            
           
        })

        for (var i in data.threshold_reached.no) {
            var c = 0
            var color = "#70AD47"
            for (var j in data.threshold_reached.no[i]) {

                if (data.threshold_reached.no[i][j].amber > 0) {
                    c += data.threshold_reached.no[i][j].amber
                    color ="#DE8205"
                }

                if (data.threshold_reached.no[i][j].red > 0) {
                    c += data.threshold_reached.no[i][j].red
                    color = "red"
                }
                
            }

            data.threshold_reached.no[i] = {
                count: c, color: color
            }
            if (transaction_ids.length>0) {
                data.threshold_reached.percentage[i] = parseInt((c / alertruleTransactionCountMap[i]) * 100+"")
            }
            
        }



        var old_status=obj.where.status

       // obj.where.status = 1

      
        
        console.log(obj.where.status)

        if (obj.where && obj.where.status && obj.where.status[Op.eq] != '1') {

        } else {

          
            var num = await ctx.model.Transaction.count(obj)


           
            data.average_total_duration_per_transaction.all_time = await ctx.model.Transaction.sum('total_duration', obj) / num


            if (!obj.where.start_of_transaction) {

               
                obj.where.start_of_transaction = { [Op['between']]: [new Date((new Date()).getTime() - 30 * 24 * 3600 * 1000), new Date((new Date()).getTime())] }

               
                num = await ctx.model.Transaction.count(obj)
              
                
                data.average_total_duration_per_transaction.day_30 = await ctx.model.Transaction.sum('total_duration', obj) / num


                obj.where.start_of_transaction = { [Op['between']]: [new Date((new Date()).getTime() - 12 * 30 * 24 * 3600 * 1000), new Date((new Date()).getTime())] }
                
                num = await ctx.model.Transaction.count(obj)
              
                data.average_total_duration_per_transaction.month_12 = await ctx.model.Transaction.sum('total_duration', obj) / num
            }

        }
       

        obj.where.status = old_status 



        var res = await ctx.model.Transactionevent.findAll({ where: { transaction_id: transaction_ids }, order: [['event_time', 'asc']] })



        var m = {}
        res.forEach((a) => {
            if (!m[a.transaction_id]) {
                m[a.transaction_id] = {
                    eventList: [], processMap: {}
                }
            }
            m[a.transaction_id].eventList.push(a)

        })
        for (var k in m) {
            var eventList = m[k].eventList
            var processMap = {}


            eventList.forEach((a, index) => {

                var obj = processMap[a.flow_pid]
                if (!obj) {
                    obj = { duration: 0, process_duration: 0, status: 0, event_count: 0, isFinish: false }
                }

                if (a.flow_id == "66ba5680-d912-11ed-a7e5-47842df0d9cc") {

                    obj.isFinish = true
                }
                var next = eventList[index + 1]
                if (next) {

                    if (next.flow_pid != a.flow_pid) {
                        obj.isFinish = true
                        obj.process_duration = parseInt(((new Date(eventList[index + 1].event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
                    } else {
                        var val = parseInt(((new Date(next.event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
                        obj.duration += val
                    }





                }

                obj.event_count++

                processMap[a.flow_pid] = obj



            })
            m[k].processMap = processMap

        }

        var num = 0
        var to = {}
        for (var k in m) {
            var p = m[k].processMap

            for (var j in p) {
                if (!to[j]) {
                    to[j] = { count: 0, duration: 0, avg: 0 }
                }
                if (p[j].isFinish) {

                    to[j].duration += p[j].duration
                    to[j].count++


                    to[j].avg = to[j].duration / to[j].count

                }


            }
        }
        to.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa = { count: 0, duration: 0, avg: data.average_total_duration_per_transaction.all_time }
            data.threshold_reached.avg_duration = to


       

        ctx.body = {
            success: true,

            data: data

        }; 
    }
    
    async add(params) {

     
 
        const {ctx} = this;
      
        const res = await ctx.model.Transaction.create(params);



        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
        

        
        
    }

    async del(params) {

        const ctx = this.ctx;
       

        await ctx.model.Transactionevent.destroy({
            where: {
                transaction_id: params.id
            }
        })

        await ctx.model.AlertruleTransaction.destroy({
            where: {
                transaction_id: params.id
            }
        })


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


       
        
            var events = await ctx.model.Transactionevent.findAll({ where: { transaction_id: params.id }, order: [["event_time", "asc"]] })
            if (events.length>0) {
                params.start_of_transaction = events[0].event_time
               
                 params.end_of_transaction = events[events.length - 1].event_time
                

                params.total_duration = (new Date(params.end_of_transaction)).getTime() / 1000 - (new Date(params.start_of_transaction)).getTime() / 1000
            }
           
           
       

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


        var transaction = await ctx.model.Transaction.findOne({ where: { id: params.id } });

        var events = await ctx.model.Transactionevent.findAll({ where: { transaction_id: params.id } });

        var data=events.map((a) => {
            return {
                "EOSID": transaction.eos_id,
                "EventSubStage": a.flow_id,
                "Timestamp": new Date(a.event_time).toISOString()
            }
        })
        //data= JSON.stringify(data)
        //data = JSON.parse(data);

        console.log(data)
        
        const result = await ctx.curl(app.config.writetoBCUrl, {
            timeout: 30000,
            method: 'POST',
            contentType: 'json',
            data: data,
            dataType: 'json',
        });

        return {
            method:"POST",
            data: data,
            url: app.config.writetoBCUrl,
            result: result,
            status: result.status ,
            errorCode:0
        }
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
                "Verified": "True",
                "Timestamp": "2023-06-06T23:10:05+08:00"//new Date(a.event_time).toISOString()
            }
        })
        console.log(data)

        ctx.body = { success: true, data: data };
        return {
            method: "POST",
            data: data,
            url: app.config.validateBCUrl,
            result: {},
            status: 0,
            errorCode: 0
        }
       /* var data = events.map((a) => {
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

        
       

        if (result.status == 201) {




            ctx.body = { success: true, data: result.data[0] };
        } else {
            ctx.body = { success: true, data: [] };
        }*/









       // console.log(result.data)
       // console.log(result.status)
    }
    
}

module.exports = TransactionService;

