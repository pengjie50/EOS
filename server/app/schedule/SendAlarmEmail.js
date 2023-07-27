const Subscription = require('egg').Subscription;
const uuid = require('uuid');


const createContent = (alert, alertrule, transaction, flowMap) => {
    var pstr = ""
    if (alertrule.type == 2) {
        pstr = 'Entire Transaction Process'
    } else if (alertrule.type == 0) {
        pstr = 'Single Process ' + flowMap[alertrule.flow_id].name
    } else if (alertrule.type == 1) {
        pstr = 'Between Two Events ' + flowMap[alertrule.flow_id].name + " To " + flowMap[alertrule.flow_id_to].name
    }
    var str = '<div>'

    str += '<div>Hi</div>'
    str += '<div> ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr + ' is triggered for A' + alert.alert_id + '</div>'
    str += '<table border="1" cellspacing="0">'
    str += '<tr>'
    str += '<td>IMO Number </td><td>' + transaction.imo_number + '</td>'
    str += '</tr>'
    str += '<tr>'
    str += '<td>Vessel Name</td><td>' + transaction.vessel_name + '</td>'
    str += '</tr>'
    str += '<tr>'
    str += '<td>Terminal Name</td><td>' + transaction.terminal_name + '</td>'
    str += '</tr>'
    str += '<tr>'
    str += '<td>Jetty Number</td><td>' + transaction.jetty_name + '</td>'
    str += '</tr>'
    str += '</table>'
    str += '<div><a href="http://eosuat.southeastasia.cloudapp.azure.com/#/user/login?redirect=/threshold/alert"> Please Login to EOS system for more details.</a></div>'
    str += '<div>I am an auto-generated email alert from the EOS system. Please do not reply to me.</div>'
    str += '</div>'
    return str
}


const createTitle = (alert, alertrule, flowMap) => {
    var pstr = ""
    if (alertrule.type == 2) {
        pstr = 'Entire Transaction Process'
    } else if (alertrule.type == 0) {
        pstr = 'Single Process ' + flowMap[alertrule.flow_id].name
    } else if (alertrule.type == 1) {
        pstr = 'Between Two Events ' + flowMap[alertrule.flow_id].name + " To " + flowMap[alertrule.flow_id_to].name
    }

    var str = '[EOS] ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr

    return str
}

var AlertruleTransactionMap = {}
var AlertMap = {}
class SendAlarmEmail extends Subscription {

    static get schedule() {
        return {
            interval: '60s',
            type: 'worker',
        };
    }






    async subscribe() {
        
        const { ctx, service, app } = this;

        var AlertruleTransaction = await ctx.model.AlertruleTransaction.findAll()

        AlertruleTransaction.forEach((t) => {
            AlertruleTransactionMap[t.transaction_id + t.alert_rule_id] = t
        })


        var Alert = await ctx.model.Alert.findAll()

        Alert.forEach((t) => {
            AlertMap[t.transaction_id + t.alert_rule_transaction_id + t.type] = t
        })

        const SaveAlertruleTransaction = async (a, t, amber, red) => {


            var oh = AlertruleTransactionMap[t.id + a.id]

            if (!oh) {
                oh = await ctx.model.AlertruleTransaction.findOne({ where: { transaction_id: t.id, alert_rule_id: a.id } })
                AlertruleTransactionMap[t.id + a.id] = oh
            }

            var h = oh

            var alert_rule_transaction_id = ''

            if (h) {



                if ((amber == 1 && h.amber == 1) || (red == 1 && h.red == 1) || (!amber && !red && !h.amber && !h.red)) {



                } else {
                    var v = { red_hours: a.red_hours, red_mins: a.red_mins, amber_hours: a.amber_hours, amber_mins: a.amber_mins }
                    if (red == 1) {
                        v.red = 1
                    }
                    if (amber == 1) {
                        v.amber = 1
                    }
                    await h.update(v)
                }

                alert_rule_transaction_id = h.id
            } else {

                var ta = { ...a, transaction_id: t.id, amber, red }

                ta.alert_rule_id = a.id
                delete ta.created_at
                delete ta.updated_at
                delete ta.id

                var res = await ctx.model.AlertruleTransaction.create(ta);
                alert_rule_transaction_id = res.id

            }
            return alert_rule_transaction_id

        }





      
        const alertDo = async (a, t, flowMap, type, alert_rule_transaction_id, trueTime, fromEventObj, toEventObj) => {

           var work_order_id = toEventObj?.work_order_id || fromEventObj?.work_order_id || null
           var work_order_sequence_number = toEventObj?.work_order_sequence_number || fromEventObj?.work_order_sequence_number || null
            var ak = t.id + alert_rule_transaction_id + type + "_" + (work_order_id || 'null')+ "_" + (work_order_sequence_number || "null")
            var oh = AlertMap[ak]

            if (!oh) {
                oh = await ctx.model.Alert.findOne({ where: { transaction_id: t.id, work_order_id: work_order_id, work_order_sequence_number: work_order_sequence_number, alert_rule_transaction_id: alert_rule_transaction_id, type: type } })
                AlertMap[ak] = oh
            }

            var h = oh




            if (h) {
                return

            }


            var alert = {}
            alert.alert_rule_transaction_id = alert_rule_transaction_id
            alert.transaction_id = t.id
            alert.flow_id = a.flow_id
            alert.flow_id_to = a.flow_id_to
            alert.user_id = a.user_id
            alert.company_id = a.company_id
            alert.alertrule_type = a.type
            alert.total_duration = trueTime
            alert.type = type
            alert.transaction_event_id_from = fromEventObj?.id || null
            alert.transaction_event_id_to = toEventObj?.id || null
            alert.work_order_id = work_order_id
            alert.work_order_sequence_number = work_order_sequence_number



            var ba = await ctx.model.Alert.create(alert);
            if (ba) {
                alert.alert_id = ba.alert_id
            }



            if (a.email) {
                try {
                    var emailArr = a.email.split(";")
                    var sendEmail = []





                    emailArr.forEach((c) => {
                        var v = c.split(',')
                        if (v.some((f) => {
                            return f == (type == 0 ? 'a' : 'r')

                        })) {
                            sendEmail.push(v[0])
                        }


                    })
                    if (sendEmail.length > 0) {




                        service.tool.sendMail(sendEmail.join(","), createTitle(alert, a, flowMap), createContent(alert, a, t, flowMap))
                    }


                } catch (e) {

                }




            }



        }

        const compareDo = async (flowMap, ar, transaction, ar_amber_time, ar_red_time, trueTime, fromEventObj, toEventObj ) => {
            
            await SaveAlertruleTransaction(ar, transaction)
            var alert_rule_transaction_id = await SaveAlertruleTransaction(ar, transaction)
           
            if (ar_amber_time > 0 && trueTime > ar_amber_time) {
               
                var alert_rule_transaction_id = await SaveAlertruleTransaction(ar, transaction, 1, null)

                await alertDo(ar, transaction, flowMap, 0, alert_rule_transaction_id, trueTime, fromEventObj, toEventObj)


            }

            if (ar_red_time > 0 && trueTime > ar_red_time) {



                var alert_rule_transaction_id = await SaveAlertruleTransaction(ar, transaction, null, 1)
                await alertDo(ar, transaction, flowMap, 1, alert_rule_transaction_id, trueTime, fromEventObj, toEventObj)
            }

            var alert_rule_transaction_id = await SaveAlertruleTransaction(ar, transaction, null, null)
        }



        var terminalList = await ctx.model.Company.findAll({ raw: true })
        var terminalMap = {}
        terminalList.map((f, index) => {

            terminalMap[f.id] = f
            return f

        })

        var jettyList = await ctx.model.Jetty.findAll({ raw: true })
        var jettyMap = {}
        jettyList.map((f, index) => {

            jettyMap[f.id] = f
            return f

        })



        var flowList = await ctx.model.Flow.findAll({ raw: true, order: [['sort', 'asc']] })
        var flowMap = {}

        var processMap = {}


        flowList = flowList.map((f, index) => {
            f.next = flowList[index] ? flowList[index] : null
            flowMap[f.id] = f
            if (!processMap[f.pid]) {
                processMap[f.pid] = []
            }
            processMap[f.pid].push(f)

            return f

        })
        //var transactionList = await ctx.model.Transaction.findAll({ where: { status: 1 }, raw: true })

        var transactionList = await ctx.model.Transaction.findAll({ raw: true, where: { status: 0  } })

        var transactionList = transactionList.map((t) => {

            t.terminal_name = terminalMap[t.terminal_id]?.name || ""
            t.jetty_name = jettyMap[t.jetty_id]?.name || ""
            return t
        })
        var ids = transactionList.map((t) => {

            return t.id
        })

        var allTransactioneventList = await ctx.model.Transactionevent.findAll({
            where: { transaction_id: ids }, order: [['event_time', 'asc']], raw: true
        })


        var m = {}
        allTransactioneventList.forEach((a) => {
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
            var eventMap = {}

            eventList.forEach((a, index) => {

                if (a.work_order_id && a.work_order_sequence_number) {
                    eventMap[a.flow_id +"_"+ (a.work_order_id || 'null') +"_"+ (a.work_order_sequence_number || 'null')] = a
                } else {
                    eventMap[a.flow_id] = a
                }

                var obj = processMap[a.flow_pid]
                if (!obj) {
                    obj = a
                }

                if (!processMap["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]) {

                    obj = a
                }

            })
            m[k].processMap = processMap
            m[k].eventMap = eventMap
        }


        var alertruleList = await ctx.model.Alertrule.findAll({ raw: true })


        var step = 0;
        var step1 = 0;
        async function oneDo() {
            



            if (step1 == alertruleList.length) {
                step1 = 0;
                step++
                if (step == transactionList.length) {
                    return
                }
            }


            var transaction = transactionList[step]

            var work_order_items=[]

             work_order_items= transaction.work_order_items_check?.split(",") || []

            var ar = alertruleList[step1]

            if (ar.company_id != transaction.trader_id && ar.company_id != transaction.terminal_id) {
                step1++
                await oneDo()
                return
            }



            var t1 = false
            if ((ar.vessel_size_dwt_from == null && ar.vessel_size_dwt_to == null)
                || (ar.vessel_size_dwt_from <= transaction.vessel_size_dwt && transaction.vessel_size_dwt < ar.vessel_size_dwt_to)) {

                t1 = true
            }

            var t2 = false
            if (ar.product_quantity_in_mt_from == null && ar.product_quantity_in_mt_to == null && ar.product_quantity_in_bls_60_f_from == null && ar.product_quantity_in_bls_60_f_to == null) {

                t2 = true
            } else if (ar.product_quantity_in_bls_60_f_from == null && ar.product_quantity_in_bls_60_f_to == null) {

                if (ar.product_quantity_in_mt_from <= transaction.product_quantity_in_mt && transaction.product_quantity_in_mt < ar.product_quantity_in_mt_to) {
                    t2 = true

                }
            } else if (ar.product_quantity_in_mt_from == null && ar.product_quantity_in_mt_to == null) {

                if (ar.product_quantity_in_bls_60_f_from <= transaction.product_quantity_in_bls_60_f && transaction.product_quantity_in_bls_60_f < ar.product_quantity_in_bls_60_f_to) {

                  

                    t2 = true

                }
            }
           
            if (t1 && t2) {

                var transactioneventList = null
               
                if (!m[transaction.id]) {
                    step1++
                    await oneDo()
                    return
                }
                var transactioneventProcessMap = {}

               

                transactioneventList = m[transaction.id].eventList

                transactioneventList.forEach((tel) => {
                    if (!transactioneventProcessMap[tel.flow_pid]) {
                        transactioneventProcessMap[tel.flow_pid] = []
                    }
                    transactioneventProcessMap[tel.flow_pid].push(tel)
                })
              

                var transactioneeventMap = m[transaction.id].eventMap
                var lastEvent = transactioneventList[transactioneventList.length - 1]

                var oneEvent = transactioneventList[0]

                var ar_amber_time = 0
                if (ar.amber_hours || ar.amber_mins) {

                    if (ar.amber_hours) {
                        ar_amber_time += ar.amber_hours * 3600
                    }
                    if (ar.amber_mins) {
                        ar_amber_time += ar.amber_mins * 60
                    }

                }
               
                var ar_red_time = 0
                if (ar.red_hours || ar.red_mins) {

                    if (ar.red_hours) {
                        ar_red_time += ar.red_hours * 3600
                    }
                    if (ar.red_mins) {
                        ar_red_time += ar.red_mins * 60
                    }

                }
                
                if (ar.type == 0) {
                    //第一种情况，事件还不完整，用当前时间去减第一个时间


                 
                   
                    var processEventList = transactioneventProcessMap[ar.flow_id]
                    if (!processEventList || processEventList.length == 0) {
                        step1++
                        await oneDo()
                        return
                    }
                   
                    var isEnd = false
                    var processCode = flowMap[ar.flow_id]

                    if (processCode.code == 10) {
                       
                       var pearr= processEventList.filter((pe) => {

                           return flowMap[pe.flow_id].code==1010
                       })

                        if (work_order_items.length == pearr.length) {
                            
                            isEnd=true
                        }

                    }


                    if (processCode.code == 20) {

                        var pearr = processEventList.filter((pe) => {

                            return flowMap[pe.flow_id]?.code == 2007
                        })

                        if (work_order_items.length == pearr.length) {

                            isEnd = true
                        }

                    }


                    if (processCode.code == 30) {

                        

                        if (transaction.status==1) {

                            isEnd = true
                        }

                    }

                    if (processCode.code == 40) {

                        var pearr = processEventList.filter((pe) => {

                            return flowMap[pe.flow_id].code == 4014
                        })

                        if ( pearr.length>0) {

                            isEnd = true
                        }

                    }

                    var trueTime=0
                    
                    if (isEnd) {
                         trueTime = (new Date(processEventList[processEventList.length - 1].event_time)).getTime() / 1000 - (new Date(processEventList[0].event_time)).getTime() / 1000
                    } else {
                         trueTime = (new Date()).getTime() / 1000 - (new Date(processEventList[0].event_time)).getTime() / 1000
                    }
                   
                    await compareDo(flowMap, ar, transaction, ar_amber_time, ar_red_time, trueTime)


                } else if (ar.type == 1) {

                    if (!transactioneventList || transactioneventList.length == 0) {
                        step1++
                        await oneDo()
                        return
                    }

                    var fromEvent = transactioneventList.filter((tel) => {
                        return tel.flow_id == ar.flow_id

                    })
                   

                    var toEvent = transactioneventList.filter((tel) => {
                        return tel.flow_id == ar.flow_id_to
                    })
                    var step2=0
                    async function Do2() {
                        if (step2 >= fromEvent.length) {
                            return
                        }
                        var fromEventObj = fromEvent[step2]
                        if (fromEventObj) {
                            

                            var toEventArr= toEvent.filter((te2) => {
                                if (!fromEventObj.work_order_id && !fromEventObj.work_order_sequence_number) {
                                   return true
                                } else if (fromEventObj.work_order_id && !fromEventObj.work_order_sequence_number) {
                                    if (!te2.work_order_id && !te2.work_order_sequence_number) {
                                        return true
                                    } else if (te2.work_order_id) {
                                        if (te2.work_order_id == fromEventObj.work_order_id) {
                                            return true
                                        }
                                    } 
                                } else if (fromEventObj.work_order_id && fromEventObj.work_order_sequence_number) {
                                    
                                    if (!te2.work_order_id && !te2.work_order_sequence_number) {

                                        
                                        return true
                                    }else if (te2.work_order_id && !te2.work_order_sequence_number) {
                                        if (te2.work_order_id == fromEventObj.work_order_id) {

                                            
                                            return true
                                        }
                                    } else if (te2.work_order_id && te2.work_order_sequence_number) {
                                        if (te2.work_order_id == fromEventObj.work_order_id && te2.work_order_sequence_number == fromEventObj.work_order_sequence_number) {

                                          
                                            return true
                                        }
                                    }
                                   
                                }
                                return false
                            })

                            if (toEventArr.length > 0) {
                               
                                var step3 = 0
                                async function Do3() {
                                    if (step3 >= toEventArr.length) {
                                        return
                                    }

                                    var toEventObj = toEventArr[step3]
                                    var trueTime = (new Date(toEventObj.event_time)).getTime() / 1000 - (new Date(fromEventObj.event_time)).getTime() / 1000

                                    

                                    
                                    await compareDo(flowMap, ar, transaction, ar_amber_time, ar_red_time, trueTime, fromEventObj, toEventObj)



                                    step3++
                                    await Do3()
                                }
                                await Do3()


                            } else {

                                
                                var trueTime = (new Date()).getTime() / 1000 - (new Date(fromEventObj.event_time)).getTime() / 1000
                               
                                await compareDo(flowMap, ar, transaction, ar_amber_time, ar_red_time, trueTime, fromEventObj)

                            }
                           
                        }
                        step2++
                        await Do2()
                    }

                    await Do2()



                } else if (ar.type == 2) {

                    if (!transactioneventList || transactioneventList.length == 0) {
                        step1++
                        await oneDo()
                        return
                    }
                    var trueTime=0
                    if (transactioneventList.find((tel) => {
                        return tel.flow_id == flowList[flowList.length - 1].id

                    })) {
                        var trueTime = (new Date(lastEvent.event_time)).getTime() / 1000 - (new Date(oneEvent.event_time)).getTime() / 1000
                    } else {
                        var trueTime = (new Date()).getTime() / 1000 - (new Date(oneEvent.event_time)).getTime() / 1000
                    }


                    await compareDo(flowMap, ar, transaction, ar_amber_time, ar_red_time, trueTime)



                }




            }

            step1++
            await oneDo()


        }


        await oneDo()




        //

    }
}





module.exports = SendAlarmEmail;