const Subscription = require('egg').Subscription;
const uuid = require('uuid');





class SendAlarmEmail extends Subscription {

    static get schedule() {
        return {
            interval: '60s',
            type: 'worker',
        };
    }

 









    async subscribe() {
        var AlertruleTransactionMap = {}
        var AlertMap = {}

        var subscribeStartTime = (new Date()).getTime()
        
        const { ctx, service, app } = this;

        var createClearContent=service.tool.createClearContent
        var createClearTitle =service.tool.createClearTitle
        var createTitle =service.tool.createTitle
        var createContent = service.tool.createContent

        var createUpdateTitle = service.tool.createUpdateTitle
        var createUpdateContent = service.tool.createUpdateContent

        var AlertruleTransaction = await ctx.model.AlertruleTransaction.findAll()

        AlertruleTransaction.forEach((t) => {
            AlertruleTransactionMap[t.transaction_id + t.alert_rule_id + "_" + (t.work_order_id || 'null') + "_" + (t.work_order_sequence_number || "null")] = t
        })


        var Alert = await ctx.model.Alert.findAll({ raw: true })
      
        Alert.forEach((t) => {
            AlertMap[t.transaction_id + t.alert_rule_transaction_id + t.type + "_" + (t.work_order_id || 'null') + "_" + (t.work_order_sequence_number || "null")]=t
        })
       
        const SaveAlertruleTransaction = async (fromEventObj, toEventObj, a, t, amber, red) => {

            var work_order_id = toEventObj?.work_order_id || fromEventObj?.work_order_id || null
            var work_order_sequence_number = toEventObj?.work_order_sequence_number || fromEventObj?.work_order_sequence_number || null
            var oh = AlertruleTransactionMap[t.id + a.id + "_" + (work_order_id || 'null') + "_" + (work_order_sequence_number || "null")]

            if (!oh) {
                oh = await ctx.model.AlertruleTransaction.findOne({ where: { transaction_id: t.id, alert_rule_id: a.id, work_order_id: work_order_id, work_order_sequence_number: work_order_sequence_number } })
                AlertruleTransactionMap[t.id + a.id + "_" + (work_order_id || 'null') + "_" + (work_order_sequence_number || "null")] = oh
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
               var transaction_event_id_from = fromEventObj?.id || null
                var transaction_event_id_to = toEventObj?.id || null
                var ta = { ...a, transaction_id: t.id, amber, red, work_order_id, work_order_sequence_number, transaction_event_id_from, transaction_event_id_to }

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




                       await service.tool.sendMail(sendEmail.join(","), createTitle(alert, a, t, flowMap), createContent(alert, a, t, flowMap))
                    }


                } catch (e) {

                }




            }



        }
       
        const clearAlert = async (flowMap, ar, transaction, ar_amber_time, ar_red_time, trueTime, fromEventObj, toEventObj) => {
           
            var work_order_id = toEventObj?.work_order_id || fromEventObj?.work_order_id || null
            var work_order_sequence_number = toEventObj?.work_order_sequence_number || fromEventObj?.work_order_sequence_number || null
            var artk = transaction.id + ar.id + "_" + (work_order_id || 'null') + "_" + (work_order_sequence_number || "null")
            var art = AlertruleTransactionMap[artk]
            var alert_rule_transaction_id = art.id
            var ak = transaction.id + alert_rule_transaction_id + 0 + "_" + (work_order_id || 'null') + "_" + (work_order_sequence_number || "null")
            var oa = AlertMap[ak]

           

           

            var modart = { ...ar }

            var isUpdateAr = false
            if (art.product_quantity_from != ar.product_quantity_from

                || art.product_quantity_to != ar.product_quantity_to
                || art.uom != ar.uom
                || art.vessel_size_dwt_from != ar.vessel_size_dwt_from
                || art.vessel_size_dwt_to != ar.vessel_size_dwt_to
                || art.amber_hours != ar.amber_hours
                || art.amber_mins != ar.amber_mins
                || art.red_hours != ar.red_hours
                || art.red_mins != ar.red_mins
                || art.email != ar.email

            ) {

                
                
                isUpdateAr = true
            }
            if (oa) {

               var isDeleteAlert = false
                
              
                if (art.flow_id != ar.flow_id || art.flow_id_to != ar.flow_id_to) {
                    isDeleteAlert = true
                    isUpdateAr = true
                }
                 
               
                if (ar_amber_time > 0 && trueTime > ar_amber_time) {
                   
                    if (oa.total_duration != trueTime && (trueTime - oa.total_duration > 3600 || oa.total_duration - trueTime > 3600) ){
                       isUpdateAr=true
                    }
                   
                    if (isUpdateAr) {
                       
                        await service.tool.sendMailDo(ar, oa, transaction, flowMap, "Update")
                      
                        await ctx.model.Alert.update({ total_duration: trueTime}, { where: { id: oa.id } })
                        
                    }


                    

                } else {

                    isDeleteAlert = true
                    isUpdateAr = true


                }
               

               
                if (isDeleteAlert) {
                   
                    modart.amber = null
                    await service.tool.sendMailDo(ar, oa, transaction, flowMap, "Clear")

                    await ctx.model.Alert.destroy({
                        where: {
                            id: oa.id
                        }
                    })
                }


              


            }



            ak = transaction.id + alert_rule_transaction_id + 1 + "_" + (work_order_id || 'null') + "_" + (work_order_sequence_number || "null")
            oa = AlertMap[ak]



            if (oa) {


                var isDeleteAlert = false

              
                if (art.flow_id != ar.flow_id || art.flow_id_to != ar.flow_id_to) {
                    isDeleteAlert = true
                    isUpdateAr = true
                }


                if (ar_red_time > 0 && trueTime > ar_red_time) {
 
                    if (oa.total_duration != trueTime && (trueTime - oa.total_duration > 3600 || oa.total_duration - trueTime > 3600)) {
                            isUpdateAr=true
                          }
                   
                    if (isUpdateAr) {
                        
                            await service.tool.sendMailDo(ar, oa, transaction, flowMap, "Update")
                           
                            await ctx.model.Alert.update({ total_duration: trueTime }, { where: { id: oa.id}})


                        }
                    


                } else {

                    isDeleteAlert = true
                    isUpdateAr = true


                }
               


              


                if (isDeleteAlert) {

                    modart.red = null
                    await service.tool.sendMailDo(ar, oa, transaction, flowMap, "Clear")


                   

                    await ctx.model.Alert.destroy({
                        where: {
                            id: oa.id
                        }
                    })
                }


                


            }

           
            if (isUpdateAr) {
               

                    modart.transaction_event_id_from=fromEventObj?.id || null

                    modart.transaction_event_id_to = toEventObj?.id || null
               
                   AlertruleTransactionMap[artk] = await AlertruleTransactionMap[artk].update(modart)
                   
              
                
            }

        }





        const compareDo = async (flowMap, ar, transaction, ar_amber_time, ar_red_time, trueTime, fromEventObj, toEventObj) => {

            try {
                await clearAlert(flowMap, ar, transaction, ar_amber_time, ar_red_time, trueTime, fromEventObj, toEventObj)
            } catch (e) {

            }
            
            await SaveAlertruleTransaction(fromEventObj, toEventObj,ar, transaction)
            var alert_rule_transaction_id = await SaveAlertruleTransaction(fromEventObj, toEventObj, ar, transaction)
           
            if (ar_amber_time > 0 && trueTime > ar_amber_time) {
               
                var alert_rule_transaction_id = await SaveAlertruleTransaction(fromEventObj, toEventObj, ar, transaction, 1, null)

                await alertDo(ar, transaction, flowMap, 0, alert_rule_transaction_id, trueTime, fromEventObj, toEventObj)


            }

            if (ar_red_time > 0 && trueTime > ar_red_time) {



                var alert_rule_transaction_id = await SaveAlertruleTransaction(fromEventObj, toEventObj, ar, transaction, null, 1)
                await alertDo(ar, transaction, flowMap, 1, alert_rule_transaction_id, trueTime, fromEventObj, toEventObj)
            }

            var alert_rule_transaction_id = await SaveAlertruleTransaction(fromEventObj, toEventObj, ar, transaction, null, null)
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
        var transactionList = await ctx.model.Transaction.findAll({ where: { status: 0 }, raw: true })

       // var transactionList = await ctx.model.Transaction.findAll({ raw: true })

        var transactionList = transactionList.map((t) => {

            //t.terminal_name = terminalMap[t.terminal_id]?.name || ""
            //t.jetty_name = jettyMap[t.jetty_id]?.name || t.jetty_name
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
            
            var nowTime = (new Date()).getTime()

            if (nowTime - subscribeStartTime > 55000) {
                return
            }


            if (step1 == alertruleList.length) {
                step1 = 0;
                step++
               
            }
           
            if (step == transactionList.length) {
                return
            }


            var transaction = transactionList[step]


            

           // var work_order_items=[]

          //   work_order_items= transaction.work_order_items_check?.split(",") || []

            var ar = alertruleList[step1]




           /* if (transaction && transaction.eos_id != 90) {
                step1++
                await oneDo()
               
                return

            }*/

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
            if (ar.product_quantity_from == null && ar.product_quantity_to == null ) {

                t2 = true
            } else {

                if (ar.product_quantity_from <= transaction["product_quantity_in_" + ar.uom] && transaction["product_quantity_in_" + ar.uom] < ar.product_quantity_to) {
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


                var info=service.tool.getDurationInfo(transactioneventList,flowMap)
                var lastEvent = info.ee

                var oneEvent = info.se

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
                   

                    var lastEvent = transactioneventList[transactioneventList.length - 1]
                    var lastEventFlow = flowMap[lastEvent.flow_pid]
                   
                    var processEventList = transactioneventProcessMap[ar.flow_id]
                    if (!processEventList || processEventList.length == 0) {
                        step1++
                        await oneDo()
                        return
                    }
                   
                    var isEnd = false
                    var processCode = flowMap[ar.flow_id]

                    if (processCode.sort < lastEventFlow.sort) {
                       
                       
                            
                         isEnd=true
                        

                    }


                   

                    var trueTime=0
                    
                    if (isEnd) {
                         trueTime = (new Date(processEventList[processEventList.length - 1].event_time)).getTime() / 1000 - (new Date(processEventList[0].event_time)).getTime() / 1000
                    } else {
                         trueTime = (new Date()).getTime() / 1000 - (new Date(processEventList[0].event_time)).getTime() / 1000
                    }
                   
                    await compareDo(flowMap, ar, transaction, ar_amber_time, ar_red_time, trueTime)


                }else if (ar.type == 1) {
                   
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
                    if (transaction.status == 0) {
                        var trueTime = (new Date()).getTime() / 1000 - (new Date(oneEvent.event_time)).getTime() / 1000
                        
                    } else {
                        var trueTime = (new Date(lastEvent.event_time)).getTime() / 1000 - (new Date(oneEvent.event_time)).getTime() / 1000
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