const Subscription = require('egg').Subscription;
const uuid = require('uuid');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;







var codeMap = {
    "pilot_service_request_time_agent_toa_to": "1001",
    "pilot_service_request_time_to": "1002",//
    "lqb_order_creation_time_to": "1003",//
    "pilot_booking_confirmed_time_to": "1004",//
    "pilot_arrival_time_to": "1005",//
    "toai_pilot_on_board_for_mooring_time": "1006",
    "pilot_onboard_time_to": "1007",//
    "lqb_pilot_on_board_time_to": "1008",//
    "lqb_agent_acknowledgment_time_to": "1009",//
    "towoi_nor_tendered_time": "1010",

    "pilotage_start_time_to": "2001",//
    "pilotage_delay_start_time_to": "2002",//
    "pilotage_end_time_to": "2003",//
    "toai_first_line_rope_ashore_time": "2004",
    "toai_all_fast_time": "2005",
    "towoi_nor_accepted_time": "2006",
    "towoi_hose_connect_end_time": "2007",


    "tosi_cargo_start_first_foot_start_time": "3001",
    "tosi_first_foot_end_time": "3002",
    "tosi_first_foot_clear_time": "3003",
    "tosi_first_foot_resume_time": "3004",
    "tosi_cargo_cease_items_cease_time": "3005",//[0].cease_time
    "tosi_cargo_cease_items_continue_time": "3006",//[0].continue_time
    "tosi_cargo_end_time": "3007",


    "towoi_hose_disconnect_end_time": "4001",
    "toai_documentation_on_board_time": "4002",
    "pilot_service_request_time_agent_toa": "4003",
    "pilot_service_request_time": "4004",//
    "lqb_order_creation_time": "4005",//
    "pilot_booking_confirmed_time": "4006",//
    "pilot_arrival_time": "4007",//
    "pilot_onboard_time": "4008",//
    "toai_pilot_on_board_for_unmooring_time": "4009",//
    "lqb_agent_acknowledgment_time": "4010",//
    "lqb_pilot_on_board_time": "4011",//
    "pilotage_start_time": "4012",//
    "pilotage_delay_start_time": "4013",//
    "pilotage_end_time": "4014",//



}

class ProcessIngInterfaceData extends Subscription {

    static get schedule() {
        return {
            interval: '60s',
            type: 'worker',
        };
    }
    async subscribe() {
        var subscribeStartTime = (new Date()).getTime()
        const { ctx, service, app } = this;

        // var sequelize = ctx.sequelize
        var flowList = await ctx.model.Flow.findAll()
        var flowMap = {}
        var flowIdMap = {}
        flowList.forEach((t) => {
            flowMap[t.code + ""] = t
            flowIdMap[t.id] = t
        })

        var getDurationInfo = service.tool.getDurationInfo



        //var transactionList = await ctx.model.Transaction.findAll()
        var transactionMap = {}
        // transactionList.forEach((t) => {
        // transactionMap[t.imo_number+""] = t
        //})

        function isDE1DE21DE3StopCheck( transactioneventList) {
            var isDE1DE21DE3Stop = false
            var dob = transactioneventList.find((v) => { return flowIdMap[v.flow_id].code == "4002" })
            if (dob) {

                if ((new Date()).getTime() - (new Date(dob.event_time)).getTime() > 3600 * 24 * 5 * 1000) {
                    isDE1DE21DE3Stop = true
                }
            }
            return isDE1DE21DE3Stop

        }




        async function clearAler(transaction) {
            var alertruleTransactionArr = await ctx.model.AlertruleTransaction.findAll({ where: { transaction_id: transaction.id, type: 1, transaction_event_id_to:null } })

            var step3 = 0
            async function Do3() {


                if (step3 >= alertruleTransactionArr.length) {


                    return
                }
                var ar = alertruleTransactionArr[step3]

                if (ar.amber==1) {
                    var alert = await ctx.model.Alert.findOne({ where: { alert_rule_transaction_id: ar.id, type: 0 } })
                    await service.tool.sendMailDo(ar, alert, transaction, flowIdMap, "Clear")
                    await ctx.model.Alert.destroy({
                        where: {
                            id: alert.id
                        }
                    })
                }

                if (ar.red == 1) {
                    var alert = await ctx.model.Alert.findOne({ where: { alert_rule_transaction_id: ar.id, type: 1 } })
                    await service.tool.sendMailDo(ar, alert, transaction, flowIdMap, "Clear")
                    await ctx.model.Alert.destroy({
                        where: {
                            id: alert.id
                        }
                    })
                }

                


                step3++
                await Do3()
            }
            await Do3()

           
            await ctx.model.AlertruleTransaction.update({ amber:null,red:null} , { where: { transaction_id: transaction.id, type: 1, transaction_event_id_to: null } })


        }

        

        async function closeTransaction(transaction, transactioneventList) {
            // var transactioneventList = await ctx.model.Transactionevent.findAll({ raw: true, order: [['event_time', 'asc']], where: { transaction_id: transaction.id } })
            var a, b, c, d = false
            //if (transaction.arrival_id_status == 'departed') {
            // a=true
            // }
            a = true
            var end_of_transaction = null
            var dob_time = null

            if (transactioneventList && transactioneventList.length > 0) {

            } else {
                return
            }

            var info = getDurationInfo(transactioneventList, flowIdMap)
            var dob
            transactioneventList.forEach((te) => {
                


                if (te.flow_id == flowMap['4002'].id) {
                    dob = te
                    dob_time = te.event_time
                    b = true
                }

              //  if (te.flow_id == flowMap['4009'].id) {

                    c = true
               // }

                if (te.flow_id == flowMap['4014'].id) {
                    d = true

                    end_of_transaction = te.event_time
                }

            })


          
            var ee = info.ee
            var se = info.se

            if (a && b && c && d && ((new Date()).getTime() - (new Date(dob_time)).getTime() > 3600 * 24 * 5 * 1000) ) {
                /*if ((new Date()).getTime() - (new Date(dob_time)).getTime() > 3600 * 24 * 5 * 1000) {
                    if ((new Date(dob_time)).getTime() > (new Date(end_of_transaction)).getTime() ) {
                        end_of_transaction = dob_time
                    }

                }*/

                var total_duration = ((new Date(end_of_transaction)).getTime() - (new Date(transactioneventList[0].event_time)).getTime()) / 1000
                await transaction.update({ end_of_transaction: end_of_transaction, total_duration: total_duration, status: 1 })

                await clearAler(transaction)

            } else {
                if (transactioneventList.length > 0) {
                    var start_of_transaction = se.event_time
                    var flow_id =ee.flow_pid
                    await transaction.update({ start_of_transaction: start_of_transaction, flow_id: flow_id })
                }


            }


        }


       /* var transaction__= await ctx.model.Transaction.findOne({ where: {eos_id:112}})
        if (transaction__) {
            await clearAler(transaction__)
        }*/
       
       



       



        var InterfacedataList = await ctx.model.Interfacedata.findAll({ order: [['created_at', 'asc']], where: { already_used: 0 } })
        var step = 0;
        async function oneDo() {

            var nowTime = (new Date()).getTime()

            if (nowTime - subscribeStartTime > 55000) {
                return
            }
  
            var interfaceObj = InterfacedataList[step]

            if (!interfaceObj) {
                return
            }
            var i = eval('(' + interfaceObj.json_string + ')')
            if (interfaceObj.type == 1) {


                var transaction = transactionMap[i.toai_arrival_id]


                if (!transaction) {
                    transaction = await ctx.model.Transaction.findOne({ where: { arrival_id: i.toai_arrival_id } })

                }



                const jetty = await ctx.model.Jetty.findOne({ where: { name: i.toai_jetty_berth_location } })
                var terminal_name = null
                var terminal_id = null
                if (jetty) {
                    const company = await ctx.model.Company.findOne({ where: { id: jetty.terminal_id } })
                    if (company) {
                        terminal_name = company.name
                    }
                    terminal_id= jetty.terminal_id 
                } else {
                    const company = await ctx.model.Company.findOne({ where: { name: 'Advario' } })
                    if (company) {
                        terminal_name = company.name
                        terminal_id = company.id 
                    }
                    
                }

                //if (jetty) {



                    if (!transaction) {

                       
                        transaction = {
                            status: i.toai_arrival_id_status =='Cancelled'?2:0,
                            arrival_id: i.toai_arrival_id,
                            arrival_id_status: i.toai_arrival_id_status,
                            vessel_size_dwt: i.toai_vessel_size_dwt,
                            imo_number: i.toai_imo_number,
                            vessel_name: i.toai_vessel_name,
                            agent: i.toai_agent || null,
                            terminal_name: terminal_name,
                            terminal_id: terminal_id,
                            jetty_id: jetty ? jetty.id : null,
                           
                            jetty_name: i.toai_jetty_berth_location || null,
                            work_order_items: i.toai_work_order_items ? i.toai_work_order_items.map((a) => { return a.work_order_id }).join(",") : null
                        }


                        transaction = await ctx.model.Transaction.create(transaction)

                       

                    }






                if (transaction && (transaction.status == 0 )) {
                        if (i.toai_agent) {
                            await transaction.update({ agent: i.toai_agent })
                        }
                        if (i.toai_arrival_id_status != transaction.arrival_id_status) {
                            if (i.toai_arrival_id_status == 'Cancelled') {
                                await transaction.update({ arrival_id_status: i.toai_arrival_id_status, status: 2 })
                                await clearAler(transaction)
                            } else {
                                await transaction.update({ arrival_id_status: i.toai_arrival_id_status })
                            }
                            
                        }


                        var transactioneventList = await ctx.model.Transactionevent.findAll({ raw: true, order: [['event_time', 'asc']], where: { transaction_id: transaction.id } })
                        if (isDE1DE21DE3StopCheck(transactioneventList)) {

                            await interfaceObj.update({ already_used: 0})
                            step++
                            await oneDo()
                            return
                        }

                        var transactioneventMap = {}
                        transactioneventList.forEach((t) => {
                            transactioneventMap[t.flow_id] = t
                        })
                        transactionMap[i.toai_arrival_id] = transaction
                        var eventArr = []
                        var updateEventArr = []
                        var updateLogEventArr = []
                        for (var k in i) {
                            if (k.indexOf("_time") > -1 && i[k]) {
                                var event = {}
                                event.transaction_id = transaction.id
                                event.event_time = i[k]

                                event.arrival_id_status = i.toai_arrival_id_status
                                event.flow_id = flowMap[codeMap[k]].id
                                event.flow_pid = flowMap[codeMap[k]].pid
                                var oldEvent = transactioneventMap[event.flow_id]
                                if (!oldEvent) {
                                    eventArr.push(event)
                                } else {

                                    if (

                                        (new Date(oldEvent.event_time)).getTime() != (new Date(event.event_time)).getTime()
                                        || oldEvent.arrival_id_status != event.arrival_id_status

                                    ) {
                                        event.id = oldEvent.id
                                        updateEventArr.push(event)
                                        var transaction_event_id = oldEvent.id
                                        delete oldEvent.id
                                        updateLogEventArr.push({ ...oldEvent, transaction_event_id: transaction_event_id })


                                    }


                                }
                            }
                        }
                        if (updateEventArr.length > 0) {
                            await ctx.model.Transactionevent.destroy({
                                where: {
                                    id: updateEventArr.map((kk) => {
                                        return kk.id
                                    })
                                }
                            })
                            await ctx.model.Transactionevent.bulkCreate(updateEventArr);

                            await ctx.model.Transactioneventlog.bulkCreate(updateLogEventArr)
                        }



                        var res = await ctx.model.Transactionevent.bulkCreate(eventArr)


                        await closeTransaction(transaction, transactioneventList)

                        if (res) {

                            await interfaceObj.update({ already_used: 1, eos_id: transaction.eos_id })

                        }
                    }

                //}
            } else if (interfaceObj.type == 2) {

                var transaction = null
                if (!transaction) {
                    transaction = await ctx.model.Transaction.findOne({ where: { work_order_items: { [Op.like]: "%" + i.towoi_work_order_id + "%" } } })

                }


                if (transaction && transaction.status == 0) {
                    var transactioneventList = await ctx.model.Transactionevent.findAll({ raw: true, order: [['event_time', 'asc']], where: { transaction_id: transaction.id } })
                    if (isDE1DE21DE3StopCheck(transactioneventList)) {

                        await interfaceObj.update({ already_used: 0 })
                        step++
                        await oneDo()
                        return
                    }


                    if (i.towoi_work_order_status == "Cancelled") {

                        await ctx.model.Transactionevent.destroy({ where: { transaction_id: transaction.id, work_order_id: i.towoi_work_order_id } })
                        await ctx.model.Transactioneventlog.destroy({ where: { transaction_id: transaction.id, work_order_id: i.towoi_work_order_id } })
                        step++
                        await oneDo()
                        return

                    }


                    if (i.toiwo_work_order_customer_name) {
                        var customer = await ctx.model.Company.findOne({
                            where: {
                                [app.Sequelize.Op.or]: [
                                    {
                                        alias: { [app.Sequelize.Op.like]: '%,' + i.toiwo_work_order_customer_name }

                                    },
                                    {
                                        alias: { [app.Sequelize.Op.like]: i.toiwo_work_order_customer_name + ',%' }

                                    },
                                    {
                                        alias: { [app.Sequelize.Op.like]: '%,' + i.toiwo_work_order_customer_name + ',%' }

                                    }, {
                                        alias: { [app.Sequelize.Op.eq]: i.toiwo_work_order_customer_name }

                                    }

                                ]

                            }
                        })
                        if (!customer) {
                            step++
                            await oneDo()
                            return
                        }



                        if (customer) {

                          

                            if (transaction.trader_id) {

                                if (transaction.trader_id != customer.id) {
                                    transaction.update({ work_order_items: transaction.work_order_items.replace(i.towoi_work_order_id, "") })

                                    transaction = await ctx.model.Transaction.create({
                                        status: 0,
                                        arrival_id: transaction.arrival_id,
                                        arrival_id_status: transaction.arrival_id_status,
                                        vessel_size_dwt: transaction.vessel_size_dwt,
                                        imo_number: transaction.imo_number,
                                        vessel_name: transaction.vessel_name,
                                        agent: transaction.agent,
                                        trader_id: customer.id,
                                        trader_name: customer.name,
                                        terminal_id: transaction.terminal_id,
                                        jetty_id: transaction.jetty_id,
                                        jetty_name: transaction.jetty_name,
                                        work_order_items_check: i.towoi_work_order_id,
                                        work_order_items: i.towoi_work_order_id
                                    })
                                    

                                } else {
                                    await transaction.update({ trader_id: customer.id, trader_name: customer.name, work_order_items_check: transaction.work_order_items_check + "," + i.towoi_work_order_id })
                                }

                            } else {
                                await transaction.update({ trader_id: customer.id, trader_name: customer.name, work_order_items_check: i.towoi_work_order_id })
                            }



                            var eventArr = []
                            var updateEventArr = []
                            var updateLogEventArr = []
                            for (var k in i) {
                                if (k.indexOf("_time") > -1 && i[k]) {
                                    var event = {}
                                    event.event_time = i[k]
                                    event.transaction_id = transaction.id


                                    event.flow_id = flowMap[codeMap[k]].id
                                    event.flow_pid = flowMap[codeMap[k]].pid

                                    event.work_order_id = i.towoi_work_order_id
                                    event.work_order_status = i.towoi_work_order_status
                                    event.work_order_operation_type = i.towoi_work_order_operation_type

                                    event.work_order_surveyor = i.towoi_work_order_surveyor || null

                                    var oldEvent = transactioneventList.find((e) => {
                                        return e.flow_id == event.flow_id && e.work_order_id == i.towoi_work_order_id
                                    })
                                    if (!oldEvent) {

                                        eventArr.push(event)
                                    } else {
                                        if (

                                            (new Date(oldEvent.event_time)).getTime() != (new Date(event.event_time)).getTime()

                                            || oldEvent.work_order_status != event.work_order_status
                                            || oldEvent.work_order_operation_type != event.work_order_operation_type

                                        ) {
                                            event.id = oldEvent.id
                                            updateEventArr.push(event)
                                            var transaction_event_id = oldEvent.id
                                            delete oldEvent.id
                                            updateLogEventArr.push({ ...oldEvent, transaction_event_id: transaction_event_id })


                                        }


                                    }

                                }
                            }
                            if (updateEventArr.length > 0) {
                                await ctx.model.Transactionevent.destroy({
                                    where: {
                                        id: updateEventArr.map((kk) => {
                                            return kk.id
                                        })
                                    }
                                })
                                await ctx.model.Transactionevent.bulkCreate(updateEventArr);

                                await ctx.model.Transactioneventlog.bulkCreate(updateLogEventArr)
                            }

                            var res = await ctx.model.Transactionevent.bulkCreate(eventArr)
                            await closeTransaction(transaction, transactioneventList)
                            if (res) {
                                await interfaceObj.update({ already_used: 1, eos_id: transaction.eos_id })
                            }


                        }






                    }

                }


            } else if (interfaceObj.type == 3 ) {
                var transaction = null
                if (!transaction) {
                    transaction = await ctx.model.Transaction.findOne({ where: { work_order_items_check: { [Op.like]: "%" + i.tosi_work_order_id + "%" } } })

                }
               

                if (transaction && transaction.status==0) {
                    var transactioneventList = await ctx.model.Transactionevent.findAll({ raw: true, order: [['event_time', 'asc']], where: { transaction_id: transaction.id } })

                    if (isDE1DE21DE3StopCheck(transactioneventList)) {
                        
                        await interfaceObj.update({ already_used: 0 })
                        step++
                        await oneDo()
                        return
                    }

                  
                    var eventArr = []
                    var updateEventArr = []
                    var updateLogEventArr = []
                    if (i.tosi_cargo_cease_items) {
                        i.tosi_cargo_cease_items.forEach((item, index) => {
                            i['tosi_cargo_cease_items_cease_time_' + index] = item.cease_time
                            i['tosi_cargo_cease_items_continue_time_' + index] = item.continue_time
                        })
                    }
                    for (var k in i) {
                        if (k.indexOf("_time") > -1 && i[k]) {
                            var event = {}
                            event.transaction_id = transaction.id
                            event.event_time = i[k]
                            if (k.indexOf('tosi_cargo_cease_items') > -1) {
                                var karr = k.split("_")
                                karr.pop()
                                k = karr.join("_")
                            }

                            event.flow_id = flowMap[codeMap[k]].id
                            event.flow_pid = flowMap[codeMap[k]].pid

                            event.flow_id = flowMap[codeMap[k]].id
                            event.flow_pid = flowMap[codeMap[k]].pid

                        

                            event.work_order_id = i.tosi_work_order_id
                            event.product_name = i.tosi_product_name
                            event.product_quantity_in_l_obs = i['tosi_product_quantity_in_l-obs']
                            event.product_quantity_in_l_15_c = i['tosi_product_quantity_in_l-15-c']
                            event.product_quantity_in_mt = i['tosi_product_quantity_in_mt']
                            event.product_quantity_in_mtv = i['tosi_product_quantity_in_mtv']
                           event.product_quantity_in_bls_60_f = i['tosi_product_quantity_in_Bls-60-f']


                          
                            event.work_order_sequence_number = i.tosi_work_order_sequence_number

                            event.tank_number = i.tosi_tank_number
                            var oldEvent = transactioneventList.find((e) => {
                                return e.flow_id == event.flow_id && e.work_order_id == i.tosi_work_order_id && e.work_order_sequence_number == i.tosi_work_order_sequence_number
                            })
                            if (!oldEvent) {
                                eventArr.push(event)
                            } else {
                                if (

                                    (new Date(oldEvent.event_time)).getTime() != (new Date(event.event_time)).getTime()

                                    || oldEvent.tosi_work_order_sequence_number != event.tosi_work_order_sequence_number
                                    || oldEvent.tank_number != event.tank_number
                                    || oldEvent.product_name != event.product_name
                                    || oldEvent.product_quantity_in_l_obs != event.product_quantity_in_l_obs
                                    || oldEvent.product_quantity_in_l_15_c != event.product_quantity_in_l_15_c
                                    || oldEvent.product_quantity_in_mt != event.product_quantity_in_mt
                                    || oldEvent.product_quantity_in_mtv != event.product_quantity_in_mtv

                                    || oldEvent.product_quantity_in_bls_60_f != event.product_quantity_in_bls_60_f


                                ) {
                                    event.id = oldEvent.id
                                    updateEventArr.push(event)
                                    var transaction_event_id = oldEvent.id
                                    delete oldEvent.id
                                    updateLogEventArr.push({ ...oldEvent, transaction_event_id: transaction_event_id })


                                }


                            }

                        }
                    }
                   
                    if (updateEventArr.length > 0) {
                        await ctx.model.Transactionevent.destroy({
                            where: {
                                id: updateEventArr.map((kk) => {
                                    return kk.id
                                })
                            }
                        })
                        await ctx.model.Transactionevent.bulkCreate(updateEventArr);

                        await ctx.model.Transactioneventlog.bulkCreate(updateLogEventArr)
                    }
                   
                    var res = await ctx.model.Transactionevent.bulkCreate(eventArr)
                   
                    var isNoTime = false

                    var allEvent = await ctx.model.Transactionevent.findAll({ raw: true, where: { transaction_id: transaction.id, work_order_id: i.tosi_work_order_id, work_order_sequence_number: i.tosi_work_order_sequence_number }, order: [['event_time', 'asc']] })
                    if (allEvent && allEvent.length == 0) {

                        isNoTime = true

                    } else {

                        var updateEventArr2 = allEvent.filter((a) => {
                            return !updateLogEventArr.some((b) => {
                                return b.transaction_event_id == a.id
                            })

                        })
                        
                        updateEventArr2=updateEventArr2.map((a) => {
                            a.transaction_event_id = a.id
                            delete a.id
                            return a

                        })
                        var oldEvent= allEvent[0]
                        var product_quantity_in_l_obs = i['tosi_product_quantity_in_l-obs']
                        var product_quantity_in_l_15_c = i['tosi_product_quantity_in_l-15-c']
                        var product_quantity_in_mt = i['tosi_product_quantity_in_mt']
                        var product_quantity_in_mtv = i['tosi_product_quantity_in_mtv']
                        var product_quantity_in_bls_60_f = i['tosi_product_quantity_in_Bls-60-f']
                        var product_name = i.tosi_product_name

                        if (
                            oldEvent.product_name != product_name
                            || oldEvent.product_quantity_in_l_obs != product_quantity_in_l_obs
                            || oldEvent.product_quantity_in_l_15_c != product_quantity_in_l_15_c
                            || oldEvent.product_quantity_in_mt != product_quantity_in_mt
                            || oldEvent.product_quantity_in_mtv != product_quantity_in_mtv
                            || oldEvent.product_quantity_in_bls_60_f != product_quantity_in_bls_60_f

                        ) {
                            await ctx.model.Transactionevent.update({
                                product_name
                                , product_quantity_in_l_obs, product_quantity_in_l_15_c, product_quantity_in_mt, product_quantity_in_mtv, product_quantity_in_bls_60_f

                            }, { where: { transaction_id: transaction.id, work_order_id: i.tosi_work_order_id, work_order_sequence_number: i.tosi_work_order_sequence_number } })

                           // await ctx.model.Transactioneventlog.bulkCreate(updateEventArr2)
                        }

                        

                       

                    }


                     allEvent = await ctx.model.Transactionevent.findAll({ raw: true, where: { transaction_id: transaction.id }, order: [['event_time', 'asc']] })
                    if (allEvent) {

                        if (isNoTime) {
                            allEvent.push({
                                work_order_id: i.tosi_work_order_id,
                                work_order_sequence_number: i.tosi_work_order_sequence_number,
                                product_name: i.tosi_product_name,
                                product_quantity_in_l_obs: i['tosi_product_quantity_in_l-obs'],
                                product_quantity_in_l_15_c: i['tosi_product_quantity_in_l-15-c'],
                                product_quantity_in_mt: i['tosi_product_quantity_in_mt'],
                                product_quantity_in_mtv: i['tosi_product_quantity_in_mtv'],
                                product_quantity_in_bls_60_f: i['tosi_product_quantity_in_Bls-60-f']
                            })
                        }

                       



                        var pArr = []
                        var product_quantity_in_l_obs = 0
                        var product_quantity_in_l_15_c = 0
                        var product_quantity_in_mt = 0
                        var product_quantity_in_mtv = 0
                        var product_quantity_in_bls_60_f = 0

                        var qlock = {}
                        allEvent.forEach((ae) => {
                            if (ae.product_name && !pArr.some((pp) => {
                                return pp == ae.product_name
                            })) {


                                pArr.push(ae.product_name)
                            }
                            if (ae.product_quantity_in_bls_60_f > 0) {
                                if (!qlock[ae.work_order_id + "" + ae.work_order_sequence_number]) {

                                    product_quantity_in_l_obs += (ae.product_quantity_in_l_obs || 0)
                                    product_quantity_in_l_15_c += (ae.product_quantity_in_l_15_c || 0)
                                    product_quantity_in_mt += (ae.product_quantity_in_mt || 0)
                                    product_quantity_in_mtv += (ae.product_quantity_in_mtv || 0)
                                    product_quantity_in_bls_60_f += (ae.product_quantity_in_bls_60_f || 0)
                                    qlock[ae.work_order_id + "" + ae.work_order_sequence_number] = true
                                }

                            }



                        })
                        await closeTransaction(transaction, transactioneventList)

                        var startEvent = allEvent[0]
                        if (startEvent) {
                            await transaction.update({
                                start_of_transaction: startEvent.event_time, product_name: pArr.join(',')
                                , product_quantity_in_l_obs, product_quantity_in_l_15_c, product_quantity_in_mt, product_quantity_in_mtv, product_quantity_in_bls_60_f
                            })
                        }
                    }

                    
                     await interfaceObj.update({ already_used: 1, eos_id: transaction.eos_id })
                    


                   




                }


            } else if (interfaceObj.type == 4 ) {
              

              
                   
                    var transactionList = await ctx.model.Transaction.findAll({ where: { imo_number: i.pilot_imo_no } })

                    var s = 0
                    var oneCreate = async () => {
                        if (s == transactionList.length) {
                            return
                        }

                        
                        var transaction = transactionList[s]
                        if (transaction && transaction.status == 0) {
                            var transactioneventList = await ctx.model.Transactionevent.findAll({ raw: true, order: [['event_time', 'asc']], where: { transaction_id: transaction.id } })
                            var isDE4DE5StopBerthing = false
                            var isDE4DE5StopUnBerthing = false
                            if (transactioneventList.some((v) => { return flowIdMap[v.flow_id].code == "4014" })) {
                               

                                isDE4DE5StopUnBerthing=true
                            }


                            if (transactioneventList.some((v) => { return flowIdMap[v.flow_id].code == "2003" })) {
                                
                                isDE4DE5StopBerthing = true
                            }


                            var transactioneventMap = {}
                            transactioneventList.forEach((t) => {
                                transactioneventMap[t.flow_id] = t
                            })


                            

                            const transactionJetty = await ctx.model.Transaction.findOne({ where: { imo_number: i.pilot_imo_no,jetty_name: [i.pilot_location_from, i.pilot_location_to] } })

                            if (transactionJetty) {
                                
                               
                                if (i.pilot_location_to == transactionJetty.jetty_name) {
                                    if (transactioneventMap[flowMap['1006'].id] && i.pilot_onboard_time ) {

                                        if ((new Date(i.pilot_onboard_time)).getTime() > (new Date(transactioneventMap[flowMap['1006'].id].event_time)).getTime() + 3600 * 1000
                                            || (new Date(i.pilot_onboard_time)).getTime() < (new Date(transactioneventMap[flowMap['1006'].id].event_time)).getTime() - 3600 * 1000
                                        ) {

                                           
                                            s++
                                            await oneCreate()
                                            return

                                        }


                                    } else {
                                        
                                        s++
                                        await oneCreate()
                                        return
                                    }


                                } else {

                                    if (transactioneventMap[flowMap['4009'].id]) {

                                        if ((new Date(transactioneventMap[flowMap['4009'].id].event_time)).getTime() != (new Date(i.pilot_booking_confirmed_time)).getTime()) {

                                           
                                            s++
                                            await oneCreate()
                                            return


                                        }


                                    } else {
                                        
                                        s++
                                        await oneCreate()
                                        return
                                    }
                                }

                               
                                var eventArr = []
                                var updateEventArr = []
                                var updateLogEventArr = []
                                for (var k in i) {
                                    if (k.indexOf("_time") > -1 && i[k]) {
                                        var event = {}
                                        event.transaction_id = transaction.id
                                        event.event_time = i[k]
                                        if (i.pilot_location_to == transactionJetty.jetty_name) {
                                            event.flow_id = flowMap[codeMap[k + "_to"]].id
                                            event.flow_pid = flowMap[codeMap[k + "_to"]].pid

                                            if (isDE4DE5StopBerthing) {
                                                continue
                                            }
                                        } else {
                                            event.flow_id = flowMap[codeMap[k]].id
                                            event.flow_pid = flowMap[codeMap[k]].pid
                                            if (isDE4DE5StopUnBerthing) {
                                                continue
                                            }
                                        }
                                        event.location_to = i.pilot_location_to
                                        event.location_from = i.pilot_location_from
                                       
                                        event.order_no = i.pilot_order_no
                                        event.delay_duration = i.pilotage_delay_duration || null
                                        event.delay_reason = i.pilotage_delay_reason || null

                                        event.cancellation_requestor = i.pilot_cancellation_requestor || null
                                        var oldEvent = transactioneventList.find((e) => {
                                            return e.flow_id == event.flow_id
                                        })
                                        if (!oldEvent) {
                                            eventArr.push(event)
                                        } else {
                                            if (

                                                (new Date(oldEvent.event_time)).getTime() != (new Date(event.event_time)).getTime()
                                                || oldEvent.location_to != event.location_to
                                                || oldEvent.location_from != event.location_from
                                                || oldEvent.delay_duration != event.delay_duration
                                                || oldEvent.delay_reason != event.delay_reason
                                                || oldEvent.order_no != event.order_no
                                                || oldEvent.cancellation_requestor != event.cancellation_requestor
                                            ) {
                                                event.id = oldEvent.id
                                                updateEventArr.push(event)
                                                var transaction_event_id = oldEvent.id
                                                delete oldEvent.id
                                                updateLogEventArr.push({ ...oldEvent, transaction_event_id: transaction_event_id })


                                            }


                                        }

                                    }
                                }

                                if (updateEventArr.length > 0) {
                                    await ctx.model.Transactionevent.destroy({
                                        where: {
                                            id: updateEventArr.map((kk) => {
                                                return kk.id
                                            })
                                        }
                                    })
                                    await ctx.model.Transactionevent.bulkCreate(updateEventArr);
                                    await ctx.model.Transactioneventlog.bulkCreate(updateLogEventArr)
                                }

                                if (updateEventArr.length == 0 && eventArr.length==0) {
                                    await interfaceObj.update({ already_used: 0 })
                                    s++
                                    await oneCreate()
                                    return
                                }
                               

                                var res = await ctx.model.Transactionevent.bulkCreate(eventArr)
                                await closeTransaction(transaction, transactioneventList)
                                if (res) {
                                    await interfaceObj.update({ already_used: 1, eos_id: transaction.eos_id })
                                }

                            }


                        }

                        s++
                        await oneCreate()
                        return
                    }
                    await oneCreate()


                //}



            } else if (interfaceObj.type == 5  ) {

              

                var transactionList = await ctx.model.Transaction.findAll({ where: { imo_number: i.pilot_lqb_imo_no } })
               
                var s = 0
                var oneCreate = async () => {
                    if (s == transactionList.length) {
                        return
                    }
                    var transaction = transactionList[s]

                    if (transaction && transaction.status == 0) {

                       
                        var transactioneventList = await ctx.model.Transactionevent.findAll({ raw: true, order: [['event_time', 'asc']], where: { transaction_id: transaction.id } })
                        var transactioneventMap = {}
                        transactioneventList.forEach((t) => {
                            transactioneventMap[t.flow_id] = t
                        })

                        
                        

                        

                        var isDE4DE5StopBerthing = false
                        var isDE4DE5StopUnBerthing = false
                        if (transactioneventList.some((v) => { return flowIdMap[v.flow_id].code == "4014" })) {
                           
                            isDE4DE5StopUnBerthing = true
                        }


                        if (transactioneventList.some((v) => { return flowIdMap[v.flow_id].code == "2003" })) {
                           
                            isDE4DE5StopBerthing = true
                        }

                        const transactionJetty = await ctx.model.Transaction.findOne({ where: { imo_number: i.pilot_lqb_imo_no, jetty_name: [i.pilot_lqb_location_from, i.pilot_lqb_location_to] } })
                      
                        if (transactionJetty) {
                            

                            if (i.pilot_lqb_location_to == transactionJetty.jetty_name) {
                               
                                
                                if (transactioneventMap[flowMap['1006'].id] &&  transactioneventMap[flowMap['1004'].id]) {
                                    var ctime = null
                                  
                                    if (transactioneventMap[flowMap['1004'].id]) {
                                        ctime = transactioneventMap[flowMap['1004'].id].event_time
                                    }
                                    if ((new Date(i.lqb_pilot_on_board_time)).getTime() - 3600 * 4 * 1000 > (new Date(ctime)).getTime()

                                        || (new Date(ctime)).getTime() > (new Date(i.lqb_pilot_on_board_time)).getTime() + 3600 * 4 * 1000) {

                                        
                                       
                                        s++
                                        await oneCreate()
                                        return

                                    }
                                } else {
                                   
                                    s++
                                    await oneCreate()
                                    return
                                }
                               
                            } else {
                               
                                if (transactioneventMap[flowMap['4009'].id] && transactioneventMap[flowMap['4006'].id] ) {
                                    var ctime = null
                                    if (transactioneventMap[flowMap['4006'].id]) {
                                        ctime = transactioneventMap[flowMap['4006'].id].event_time
                                    }
                                   
                                    if ((new Date(i.lqb_pilot_on_board_time)).getTime() - 3600 * 4 * 1000 > (new Date(ctime)).getTime()

                                        || (new Date(ctime)).getTime() > (new Date(i.lqb_pilot_on_board_time)).getTime() + 3600 * 4 * 1000) {

                                       

                                        s++
                                        await oneCreate()
                                        return

                                    }
                                } else {
                                   
                                  
                                    s++
                                    await oneCreate()
                                    return
                                }
                            }




                           
                           
                           
                            var eventArr = []
                            var updateEventArr = []
                            var updateLogEventArr = []
                            for (var k in i) {
                                if (k.indexOf("_time") > -1 && i[k]) {
                                    var event = {}
                                    event.transaction_id = transaction.id
                                    event.event_time = i[k]
                                    if (i.pilot_lqb_location_to == transactionJetty.jetty_name) {
                                        event.flow_id = flowMap[codeMap[k + "_to"]].id
                                        event.flow_pid = flowMap[codeMap[k + "_to"]].pid
                                        if (isDE4DE5StopBerthing) {
                                            
                                            continue
                                        }
                                    } else {
                                        event.flow_id = flowMap[codeMap[k]].id
                                        event.flow_pid = flowMap[codeMap[k]].pid
                                        if (isDE4DE5StopUnBerthing) {
                                           
                                            continue
                                        }
                                    }
                                    event.location_to = i.pilot_lqb_location_to
                                    event.location_from = i.pilot_lqb_location_from

                                    var oldEvent = transactioneventList.find((e) => {
                                        return e.flow_id == event.flow_id
                                    })
                                    if (!oldEvent) {
                                        eventArr.push(event)
                                    } else {
                                        if (

                                            (new Date(oldEvent.event_time)).getTime() != (new Date(event.event_time)).getTime()
                                            || oldEvent.location_to != event.location_to
                                            || oldEvent.location_from != event.location_from
                                        ) {
                                            event.id = oldEvent.id
                                            updateEventArr.push(event)
                                            var transaction_event_id = oldEvent.id
                                            delete oldEvent.id
                                            updateLogEventArr.push({ ...oldEvent, transaction_event_id: transaction_event_id })


                                        }


                                    }

                                }
                            }
                            if (updateEventArr.length == 0 && eventArr.length == 0) {
                               
                                await interfaceObj.update({ already_used:0 })
                                s++
                                await oneCreate()
                                return

                            }
                            if (updateEventArr.length > 0) {
                                await ctx.model.Transactionevent.destroy({
                                    where: {
                                        id: updateEventArr.map((kk) => {
                                            return kk.id
                                        })
                                    }
                                })
                                await ctx.model.Transactionevent.bulkCreate(updateEventArr);

                                await ctx.model.Transactioneventlog.bulkCreate(updateLogEventArr)
                            }
                            var res = await ctx.model.Transactionevent.bulkCreate(eventArr)
                            await closeTransaction(transaction, transactioneventList)
                            
                            if (res) {
                                await interfaceObj.update({ already_used: 1, eos_id: transaction.eos_id })
                            }

                        }


                    }


                    s++
                    await oneCreate()
                    return
                }


                await oneCreate()



            }
            step++
            await oneDo()

        }

        await oneDo()

        var updateDoStep = 0
        var allOpenTransaction = await ctx.model.Transaction.findAll({ where: { status: 0 } })
        async function updateDo() {
            if (updateDoStep >= allOpenTransaction.length) {
                return
            }

           

            var openTransaction = allOpenTransaction[updateDoStep]

           


            var transactioneventList = await ctx.model.Transactionevent.findAll({ raw: true, order: [['event_time', 'asc']], where: { transaction_id: openTransaction.id } })
            if (transactioneventList.length > 0) {


                await closeTransaction(openTransaction, transactioneventList)

            }


            updateDoStep++
            await updateDo()
        }

        await updateDo()


    }


}





module.exports = ProcessIngInterfaceData;