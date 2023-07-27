/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const moment = require('moment')
const uuid = require('uuid');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Service = require('./base_service');
class TransactionService extends Service {

    async findOne(params) {
        const ctx = this.ctx;
        var res = await ctx.model.Transaction.findByPk(params.id);
        ctx.body = { success: true, data: res }
    }
    async list(params) {
        const { ctx, app } = this;

        let obj = {}

        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }


        var is_report = false
        var is_detail_report = false
        if (obj.where.is_report) {
            is_report =true
        }
        delete obj.where.is_report


        if (obj.where.is_detail_report) {
            is_detail_report = true
        }
        delete obj.where.is_detail_report

        if (params.order) {
            obj.order = params.order
        }
        if (params.page && params.limit) {
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }

        var w = {}

        if (ctx.user.role_type == 'Super') {
            if (obj.where.organization_id) {
                w.company_id = obj.where.organization_id
            }


        } else {
            if (this.access("transactions_list")) {

                w.user_id = ctx.user.user_id

                if (this.access("transactions_list_company")) {
                    delete w.user_id
                    w.company_id = ctx.user.company_id
                }

                if (this.access("transactions_list_tab")) {
                   
                    delete w.user_id
                    if (!obj.where.threshold_organization_id) {
                       
                        w.company_id = {
                            [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                        }
                    } else {
                        
                        
                        w.company_id = obj.where.threshold_organization_id
                    }




                }
            }

        }

        if (obj.where && (obj.where.flow_id || obj.where.flow_id_to || obj.where.threshold_organization_id)) {

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

            obj.where.id = ids
        }
        delete obj.where.flow_id
        delete obj.where.flow_id_to
        delete obj.where.threshold_organization_id



        var Op = app.Sequelize.Op


        if (ctx.user.role_type == 'Super') {
            if (obj.where.organization_id) {
                
                obj.where[Op['or']] = [{ terminal_id: obj.where.organization_id }, { trader_id: obj.where.organization_id }]
            }

        } else {

            if (obj.where.organization_id) {
                if (ctx.user.company_type == "Terminal") {
                    obj.where.trader_id = obj.where.organization_id
                    obj.where.terminal_id = ctx.user.company_id
                } else {
                    obj.where.terminal_id = obj.where.organization_id
                    obj.where.trader_id = ctx.user.company_id
                }
               
            } else {
                if (ctx.user.company_type == "Terminal") {
                    obj.where.trader_id = ctx.user.accessible_organization
                    obj.where.terminal_id = ctx.user.company_id
                } else {

                    obj.where[Op['or']] = [{ terminal_id: ctx.user.accessible_organization }, { terminal_id: null}]
                  
                    obj.where.trader_id = ctx.user.company_id
                }
                
            }


        }
        delete obj.where.organization_id




        console.log(obj.where)
        obj.raw = true
        var list = await ctx.model.Transaction.findAndCountAll(obj)
        var jetty_id = []
        var company_id = []

        list.rows.forEach((t) => {
            jetty_id.push(t.jetty_id)
            company_id.push(t.trader_id)
            company_id.push(t.terminal_id)
        })

        const companyList = await ctx.model.Company.findAll({ raw: true, where: { id: company_id } })
        var companyMap = {}
        companyList.forEach((c) => {
            companyMap[c.id] = c
        })
        const jettyList = await ctx.model.Jetty.findAll({ raw: true, where: { id: jetty_id } })
        var jettyMap = {}
        jettyList.forEach((j) => {
            jettyMap[j.id] = j
        })

        list.rows = list.rows.map((t) => {
            t.jetty_name = jettyMap[t.jetty_id]?.name || t.jetty_name
            t.trader_name = companyMap[t.trader_id]?.name || "-"
            t.terminal_name = companyMap[t.terminal_id]?.name || "-"
            return t
        })

        ctx.status = 200;

        if (is_report || is_detail_report){
            const alertliset = await ctx.model.Alert.findAll({ raw: true, where: { transaction_id: list.rows.map((t) => { return t.id }) } })
            var alertMap = {}
            alertliset.forEach((a) => {
                if (!alertMap[a.transaction_id]) {
                    alertMap[a.transaction_id] = { amber_alert_num: 0, red_alert_num: 0 }
                }
                if (a.type == 0) {
                    alertMap[a.transaction_id].amber_alert_num += 1
                } else {
                    alertMap[a.transaction_id].red_alert_num += 1
                }

            })
            list.rows = list.rows.map((a) => {
                a.amber_alert_num = alertMap[a.id].amber_alert_num
                a.red_alert_num = alertMap[a.id].red_alert_num
                return a
            })

            var cw = {}

            if (ctx.user.role_type == 'Super') {
            } else {
                if (ctx.user.company_type == "Terminal") {
                    cw.trader_id = ctx.user.accessible_organization
                    cw.terminal_id = ctx.user.company_id
                } else {

                    cw[Op['or']] = [{ terminal_id: ctx.user.accessible_organization }, { terminal_id: null }]
                   
                    cw.trader_id = ctx.user.company_id
                }
            }
           

            var all_total = await ctx.model.Transaction.count(cw)
        }

        var total = list.count


        if (is_detail_report) {
            var ids=list.rows.map((t) => {
                return t.id
            })
            obj.where = { transaction_id: ids }
            obj.order = [["event_time", "asc"], ["transaction_id", "asc"]]
            obj.attributes = [[ctx.model.col('t.eos_id'), 'eos_id'], 'transaction_event.*'];
            obj.include = [{
                as: 't',
                attributes: [],
                model: ctx.model.Transaction

            }]
            list = await ctx.model.Transactionevent.findAndCountAll(obj)





        }
        

        ctx.body = {
            success: true,
            total: list.count,
            top_total: total,
            top_all_total: all_total || 0,
            data: list.rows

        };

    }

    async statistics(params) {

        const { ctx, app } = this;

        let obj = {
            where: {}
        }
        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }

        var data = {
            average_total_duration_per_transaction: {
                all_time: 0,
                month_12: 0,
                day_30: 0
            },

            no_of_transaction: {
                total: 0,
                closed: 0,
                open: 0,
                cancelled: 0
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
                awhere.company_id = obj.where.organization_id
            }

        } else {

            if (obj.where.organization_id) {
                if (ctx.user.company_type == "Terminal") {
                    obj.where.trader_id = obj.where.organization_id
                    obj.where.terminal_id = ctx.user.company_id
                } else {
                    obj.where.terminal_id = obj.where.organization_id
                    obj.where.trader_id = ctx.user.company_id
                }

            } else {
                if (ctx.user.company_type == "Terminal") {
                    obj.where.trader_id = ctx.user.accessible_organization
                    obj.where.terminal_id = ctx.user.company_id
                } else {
                    obj.where[Op['or']] = [{ terminal_id: ctx.user.accessible_organization }, { terminal_id: null }]
                }

            }




            if (this.access("dashboard")) {

                awhere.user_id = ctx.user.user_id

                if (this.access("dashboard_company")) {
                    delete awhere.user_id
                    awhere.company_id = ctx.user.company_id
                }

                if (this.access("dashboard_tab")) {
                    if (obj.where.tab) {
                        if (obj.where.tab[app.Sequelize.Op.eq] == 'Terminal') {




                        } if (obj.where.tab[app.Sequelize.Op.eq] == 'Trader') {
                            delete awhere.user_id
                            if (!obj.where.organization_id) {

                                awhere.company_id = {
                                    [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                                }
                            } else {

                                awhere.company_id = obj.where.organization_id
                            }

                        } else if (obj.where.tab[app.Sequelize.Op.eq] == 'All') {
                            delete awhere.user_id
                            awhere.company_id = {
                                [app.Sequelize.Op['in']]: [...ctx.user.accessible_organization, ctx.user.company_id]
                            }
                        }

                    }
                }
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
            data.no_of_transaction.open = 0
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
        var transactions = await ctx.model.Transaction.findAll(obj)

        var transaction_ids = transactions.map((a) => {
            return a.id
        })
        awhere.transaction_id = transaction_ids




        var alerts = await ctx.model.Alert.findAll({ where: awhere })

        var alertruleTransactions = await ctx.model.AlertruleTransaction.findAll({ where: awhere })
        var alertruleTransactionCountMap = {}
        alertruleTransactions.forEach((a) => {

            var step = 1
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


                    data.threshold_reached.no.b2e = {}
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
                    color = "#DE7E39"
                }

                if (data.threshold_reached.no[i][j].red > 0) {
                    c += data.threshold_reached.no[i][j].red
                    color = "red"
                }

            }

            data.threshold_reached.no[i] = {
                count: c, color: color
            }
            if (transaction_ids.length > 0) {
                data.threshold_reached.percentage[i] = parseInt((c / alertruleTransactionCountMap[i]) * 100 + "")
            }

        }



        var old_status = obj.where.status

        // obj.where.status = 1





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



        const { ctx } = this;

        const res = await ctx.model.Transaction.create(params);



        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }




    }

    async del(params) {

        const ctx = this.ctx;

        await ctx.model.Alert.destroy({
            where: {
                transaction_id: params.id
            }
        })
        await ctx.model.Transactionevent.destroy({
            where: {
                transaction_id: params.id
            }
        })

        await ctx.model.Transactioneventlog.destroy({
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
        if (events.length > 0) {
            params.start_of_transaction = events[0].event_time

            params.end_of_transaction = events[events.length - 1].event_time


            params.total_duration = (new Date(params.end_of_transaction)).getTime() / 1000 - (new Date(params.start_of_transaction)).getTime() / 1000
        }




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
    async writetoBC(params) {
        const { ctx, service, app } = this;


        var transaction = await ctx.model.Transaction.findOne({ where: { id: params.id } });


        










        var events = await ctx.model.Transactionevent.findAll({ where: { transaction_id: params.id } });

        var data = events.map((a) => {
            return {
                "EOSID": transaction.eos_id,
                "EventSubStage": a.flow_id,
                "Timestamp": new Date(a.event_time).toISOString()
            }
        })
        //data= JSON.stringify(data)
        //data = JSON.parse(data);



        const result = await ctx.curl(app.config.WriteHeaderBC, {
            timeout: 30000,
            method: 'POST',
            contentType: 'json',
            data: data,
            dataType: 'json',
        });

        return {
            method: "POST",
            data: data,
            url: app.config.writetoBCUrl,
            result: result,
            status: result.status,
            errorCode: 0
        }


    }
    async validateBC(params) {
        const { ctx, service, app } = this;

        var addAPILog = async (params) => {


            var operlog = {}
            operlog.request_method = params.method
            // operlog.ip = ctx.request.ip
            operlog.url = params.url
            operlog.param = JSON.stringify(params.data)
            operlog.result = JSON.stringify(params.result)

            operlog.status = params.status
            operlog.err_code = params.errorCode


            operlog.activity_duration = (new Date()).getTime() - ctx.activity_duration_start.getTime()
            operlog.device_type = "PC"

            operlog.type = 3
            operlog.oper_time = new Date()

            const result = await service.operlog.add(operlog);

        }

        var transaction = await ctx.model.Transaction.findOne({ where: { id: params.id } });
       
        var transactionEventList = await ctx.model.Transactionevent.findAll({ raw: true, order: [["event_time", "asc"]], where: { transaction_id: transaction.id } });

        var BerthingPilotage = {}
        var UnberthingPilotage = {}

        transactionEventList.forEach((te) => {
            if (te.order_no && te.location_to && te.location_from) {


                if (te.flow_pid == "9f2431b0-d3c9-11ed-a0d9-55ccaa27cc37" && !BerthingPilotage) {

                    BerthingPilotage = te
                }

                if (te.flow_pid == "a7332eb0-d3c9-11ed-a0d9-55ccaa27cc37" && !UnberthingPilotage) {
                    UnberthingPilotage = te
                }
            }

        })
        const companyList = await ctx.model.Company.findAll({ raw: true, where: { id: [transaction.terminal_id, transaction.trader_id] } })
        var companyMap = {}
        companyList.forEach((c) => {
            companyMap[c.id] = c
        })

        var head_data = {
            "EOSID": transaction.eos_id,
            "StartOfTransaction": moment(new Date(transaction.start_of_transaction)).format('YYYY-MM-DDTHH:mm:ss+08:00'),
            "EndOfTransaction": moment(new Date(transaction.end_of_transaction)).format('YYYY-MM-DDTHH:mm:ss+08:00'),
            "ArrivalID": transaction.arrival_id,
            "Jetty": transaction.jetty_name,
            "VesselName": transaction.vessel_name,
            "TerminalName": companyMap[transaction.terminal_id]?.name || null,
            "TraderName": companyMap[transaction.trader_id]?.name || null,
            "Agent": transaction.agent,
            "Status": transaction.status + "",
            "VesselSize": transaction.vessel_size_dwt,
            "ArrivalStatus": transaction.arrival_id_status,
            "IMONumber": transaction.imo_number,
            "BerthingPilotageID": BerthingPilotage.order_no ? parseInt(BerthingPilotage.order_no) : null,
            "PilotageLocationFrom1": BerthingPilotage.location_from || null,
            "PilotageLocationTo1": BerthingPilotage.location_to || null,
            "UnberthingPilotageID": UnberthingPilotage.order_no ? parseInt(UnberthingPilotage.order_no) : null,
            "PilotageLocationFrom2": UnberthingPilotage.location_from || null,
            "PilotageLocationTo2": UnberthingPilotage.location_to || null

        }
        var back = {}
        var result = await ctx.curl(app.config.ValidateHeaderBC, {
            timeout: 30000,
            method: 'POST',
            contentType: 'json',
            data: [head_data],
            dataType: 'json',
        });

        console.log(result)

        if (result.status == 201) {
            back.head_data = result.data[0]



        } 

        var flowList = await ctx.model.Flow.findAll();

        var flowMap = {}

        flowList.forEach((f) => {
            flowMap[f.id] = f.code
        })
        var transactionEvent = transactionEventList


        var reMap = {}



        var event_data = transactionEvent.map((te) => {


            var EventSubStage = flowMap[te.flow_id]




            if (!reMap[flowMap[te.flow_id]]) {

                reMap[flowMap[te.flow_id]] = 0
            }

            reMap[flowMap[te.flow_id]] += 1



            console.log(reMap[flowMap[te.flow_id]] - 1)

            EventSubStage += (("00" + (reMap[flowMap[te.flow_id]] - 1)).slice(-2))


            var b = {
                "EOSID": transaction.eos_id,
                "EventSubStage": EventSubStage,
                "Timestamp": moment(new Date(te.event_time)).format('YYYY-MM-DDTHH:mm:ss+08:00'),
                "Field1": te.product_quantity_in_bls_60_f ? parseInt(te.product_quantity_in_bls_60_f) : 0,
                "Field2": te.tank_number ? parseInt(te.tank_number) : 0,
                "Field3": te.work_order_id ? parseInt(te.work_order_id) : 0,
                "Field4": te.work_order_sequence_number ? parseInt(te.work_order_sequence_number) : 0,
                "Field5": te.work_order_operation_type ? te.work_order_operation_type : null,
                "Field6": te.product_name ? te.product_name : null,
                "Field7": te.work_order_status ? te.work_order_status : null,
                "Field8": te.work_order_sequence_number_status ? te.work_order_sequence_number_status : null,
                "Field9": te.work_order_surveyor ? te.work_order_surveyor : null
            }

            if (te.delay_duration) {
                b.Field5 = te.delay_duration
            }

            if (te.location_from) {
                b.Field6 = te.location_from
            }
            if (te.location_to) {
                b.Field6 = te.location_to
            }
            return b
        })



        console.log(event_data)
        console.log(app.config.ValidateBC)
        ctx.activity_duration_start = new Date()
         result = await ctx.curl(app.config.ValidateBC, {
            timeout: 30000,
            method: 'POST',
            contentType: 'json',
            data: event_data,
            dataType: 'json',
        });

      
        await addAPILog({ data: event_data, result: result.data, status: result.status == 201 ? 0 : 1, errorCode: result.status == 201 ? 0 : result.status, url: app.config.ValidateBC })



        if (result.status == 201) {
            back.event_data = result.data



        } 






        result = await ctx.curl(app.config.QueryHeaderBC, {
            timeout: 30000,
            method: 'POST',
            contentType: 'json',
            data: {"EOSID": transaction.eos_id },
            dataType: 'json',
        });

       
        await addAPILog({ data: { "EOSID": transaction.eos_id }, result: result.data, status: result.status == 201 ? 0 : 1, errorCode: result.status == 201 ? 0 : result.status, url: app.config.QueryHeaderBC })



        if (result.status == 201) {
            back.bc_head_data = result.data[0]

        } 



        result = await ctx.curl(app.config.QueryBC, {
            timeout: 30000,
            method: 'POST',
            contentType: 'json',
            data: { "EOSID": transaction.eos_id },
            dataType: 'json',
        });

      
       
        await addAPILog({ data: { "EOSID": transaction.eos_id }, result: result.data, status: result.status == 201 ? 0 : 1, errorCode: result.status == 201 ? 0 : result.status, url: app.config.QueryBC })



        if (result.status == 201) {
            back.bc_event_data = result.data

        } 


        

        ctx.body = { success: true, data: back };












       
        return {
            method: "POST",
            data: [head_data],
            url: app.config.ValidateHeaderBC,
            result: result.data,
            status: result.status==201?0:1,
            errorCode: 0
        }



      
    }

}

module.exports = TransactionService;

