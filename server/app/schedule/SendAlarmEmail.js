const Subscription = require('egg').Subscription;
const uuid = require('uuid');


const createContent = (alert, alertrule, transaction, flowMap) => {
    var pstr = ""
    if (alertrule.type ==2) {
        pstr = 'Entire Transaction Process'
    } else if (alertrule.type == 0) {
        pstr = 'Single Process ' + flowMap[alertrule.flow_id]
    } else if (alertrule.type == 1) {
        pstr = 'Between Two Events ' + flowMap[alertrule.flow_id] + " To " + flowMap[alertrule.flow_id_to]
    }
    var str = '<div>'

    str += '<div>Hi</div>'
    str += '<div> ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr +' is triggered for ' + transaction.eos_id + '</div>'
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
    str += '<div><a href="https://woke.qinqinwater.cn:7002/#/user/login"> Please Login to EOS system for more details.</a></div>'
    str += '<div>I am an auto-generated email alert from the EOS system. Please do not reply to me.</div>'
    str += '</div>'
    return str
}


const createTitle = (alert, alertrule,flowMap) => {
    var pstr=""
    if (alertrule.type == 2) {
        pstr = 'Entire Transaction Process'
    } else if (alertrule.type == 0) {
        pstr = 'Single Process ' + flowMap[alertrule.flow_id]
    } else if (alertrule.type ==1) {
        pstr = 'Between Two Events ' + flowMap[alertrule.flow_id] + " To " + flowMap[alertrule.flow_id_to]
    }

    var str = '[EOS] ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr

    return str
}


class SendAlarmEmail extends Subscription {
   
    static get schedule() {
        return {
            interval: '60s',
            type: 'worker',
        };
    }

  
    async subscribe() {
       
        const { ctx, service, app } = this;
        
      
        const alertDo = async (a, t, flowMap, type) => {



            var h=await ctx.model.AlertruleTransaction.findOne({ where: { transaction_id: t.id, alert_rule_id:a.id,alert_type:type}})

            if (h) {
                return
            }

            var ta = { ...a, transaction_id: t.id, alert_type: type}

            ta.alert_rule_id = ta.id
            delete ta.created_at
            delete ta.updated_at
            delete ta.id
           
            console.log(ta)
            
           var res= await ctx.model.AlertruleTransaction.create(ta);





            var alert = {}
            alert.alert_rule_transaction_id = res.id
            alert.transaction_id = t.id
            alert.flow_id = a.flow_id
            alert.flow_id_to = a.flow_id_to
            alert.user_id = a.user_id
            alert.company_id = a.company_id
            alert.alertrule_type = a.type
            alert.type = type
            await ctx.model.Alert.create(alert);
            if (a.email) {
                service.tool.sendMail(a.email, createTitle(alert, a, flowMap), createContent(alert, a, t, flowMap))
            }
          
        }



        var terminalList = await ctx.model.Terminal.findAll({ raw: true })
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



        var flowList = await ctx.model.Flow.findAll({ raw: true,order: [['sort', 'asc']] })
        var flowMap = {}
        flowList = flowList.map((f, index) => {
            f.next = flowList[index] ? flowList[index] : null
            flowMap[f.id] = f
            return f

        })
        var transactionList = await ctx.model.Transaction.findAll({ where: { status: 1 }, raw: true })

        var transactionList = transactionList.map((t) => {
            t.terminal_name = terminalMap[t.terminal_id].name
            t.jetty_name = jettyMap[t.jetty_id].name
            return t
        })
        var ids = transactionList.map((t) => {
            
            return t.id
        })

        var allTransactioneventList = await ctx.model.Transactionevent.findAll({
            where: { transaction_id: ids }, sorter: [['event_time', 'asc']], raw: true
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
                eventMap[a.flow_id] = a
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

      
        var alertruleList = await ctx.model.Alertrule.findAll({raw:true })
        transactionList.forEach((transaction) => {
            alertruleList.forEach((ar) => {

                
                var t1=false
                if ((ar.size_of_vessel_from == null && ar.size_of_vessel_to == null)
                    || (ar.size_of_vessel_from <= transaction.size_of_vessel && transaction.size_of_vessel < ar.size_of_vessel_to)) {
                    
                    t1 = true
                }
                
                var t2 = false
                if (ar.total_nominated_quantity_from_m == null && ar.total_nominated_quantity_to_m == null && ar.total_nominated_quantity_from_b == null && ar.total_nominated_quantity_to_b == null) { 
                   
                    t2 = true
                } else if (ar.total_nominated_quantity_from_b == null && ar.total_nominated_quantity_to_b == null) {
                    
                    if (ar.total_nominated_quantity_from_m <= transaction.total_nominated_quantity_m && transaction.total_nominated_quantity_m < ar.total_nominated_quantity_to_m) {
                        t2 = true
                       
                    }
                } else if (ar.total_nominated_quantity_from_m == null && ar.total_nominated_quantity_to_m == null) {
                   
                    if (ar.total_nominated_quantity_from_b <= transaction.total_nominated_quantity_b && transaction.total_nominated_quantity_b < ar.total_nominated_quantity_to_b) {
                        t2 = true
                       
                    }
                 }

                if (t1 && t2) {
                  
                    var transactioneventList=null
                   
                    if (!m[transaction.id]) {
                        return
                    }
                    
                    transactioneventList = m[transaction.id].eventList
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
                    console.log(ar.type)
                    if (ar.type == 0) {

                      
                            if (flowMap[lastEvent.flow_id].sort > flowMap[ar.flow_id].sort) {


                               
                               var processEventList= transactioneventList.filter((te) => {

                                    return te.flow_pid == ar.flow_id
                               })


                               
                                if (processEventList.length==0) {
                                    return 
                                }
                               
                                var trueTime =  (new Date(processEventList[processEventList.length - 1].event_time)).getTime() / 1000 - (new Date(processEventList[0].event_time)).getTime() / 1000

                                if (trueTime > ar_amber_time && trueTime < ar_red_time) {


                                    alertDo(ar, transaction, flowMap, 0)

                                }
                                if (trueTime > ar_red_time) {


                                    alertDo(ar, transaction, flowMap, 1)
                                }



                            }

                   


                        

                    } else if (ar.type == 1) {
                        
                        if (flowMap[lastEvent.flow_id].sort >= flowMap[ar.flow_id_to].sort ) {
                          
                            if (!transactioneeventMap) {
                                return
                            }

                          
                            var trueTime = (new Date(transactioneeventMap[ar.flow_id_to].event_time)).getTime() / 1000 - (new Date(transactioneeventMap[ar.flow_id].event_time)).getTime() / 1000
                            console.log(trueTime)
                            if (trueTime > ar_amber_time && trueTime < ar_red_time) {
                                

                                alertDo(ar, transaction, flowMap, 0)

                            }
                            if (trueTime > ar_red_time) {

                               
                                alertDo(ar, transaction, flowMap, 1)
                            }
                        }
                    } else if (ar.type == 2) {
                       
                       var trueTime= (new Date()).getTime() / 1000 - (new Date(oneEvent.event_time)).getTime() / 1000

                        if(trueTime > ar_amber_time && trueTime < ar_red_time){

                           
                           alertDo(ar, transaction,flowMap,0)

                        }
                        if (trueTime > ar_red_time) {

                           
                            alertDo(ar, transaction, flowMap, 1)
                        }
                        



                    }

                }
            })

        })



        //

    }
}





module.exports = SendAlarmEmail;