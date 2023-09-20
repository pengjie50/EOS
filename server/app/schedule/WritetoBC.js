const Subscription = require('egg').Subscription;
const uuid = require('uuid');

const moment = require('moment')



class WritetoBC extends Subscription {

    static get schedule() {
        return {
            interval: '900s',
            type: 'worker',
        };
    }






    async subscribe() {
        var subscribeStartTime = (new Date()).getTime()
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

      
        var transactionSendList = await ctx.model.Transaction.findAll({ where: { status: 1, blockchain_hex_key: { [app.Sequelize.Op['eq']]: 'send' } } });
        
        var step0 = 0
        async function Do0() {

            var nowTime = (new Date()).getTime()

            if (nowTime - subscribeStartTime > 800) {
                return
            }
            if (step0 >= transactionSendList.length) {
                return
            }
            var transaction = transactionSendList[step0]


            var result = await ctx.curl(app.config.QueryHeaderBC, {
                timeout: 30000,
                method: 'POST',
                contentType: 'json',
                data: { "EOSID": transaction.eos_id },
                dataType: 'json',
            });

            if (result.status == 201) {
                if (result.data[0]) {
                    await transaction.update({ blockchain_hex_key: result.data[0].HashID })
                    
                } else {
                    await transaction.update({ blockchain_hex_key: null })
                }


            }



            step0++
            await Do0()
        }
        try {
            await Do0()
        } catch (e) {

        }


        var transactionSendEventList = await ctx.model.Transactionevent.findAll({
           raw:true,
            include: [{
                as: 't',
                attributes: [],
                model: ctx.model.Transaction,
                where: { status: 1 }

            }], where: { blockchain_hex_key: { [app.Sequelize.Op['eq']]: 'send' } } })


        var transactionSendEventListMap = {}
        var transactionSendEventListArr = []
        transactionSendEventList.forEach((tset) => {
            if (!transactionSendEventListMap[tset['t.eos_id']]) {
                transactionSendEventListMap[tset['t.eos_id']] =[]
            }
            transactionSendEventListMap[tset['t.eos_id']].push(tset)
        })

        for (var i in transactionSendEventListMap) {
            transactionSendEventListArr.push(transactionSendEventListMap[i])
        }



        var step9 = 0
        async function Do9() {

            
            if (step9 >= transactionSendEventListArr.length) {
                return
            }
            var transactionSendEventArrOne = transactionSendEventListArr[step9]


            var result = await ctx.curl(app.config.BC, {
                timeout: 30000,
                method: 'POST',
                contentType: 'json',
                data: { "EOSID": transactionSendEventArrOne[0]['t.eos_id'] },
                dataType: 'json',
            });
           
            if (result.status == 201) {
               

                var stepa = 0
                async function Doa() {


                    if (stepa >= transactionSendEventArrOne.length) {
                        return
                    }
                    var transactionSendEventOne = transactionSendEventArrOne[stepa]

                    var findOne=result.data.find((k) => {
                        return k.EventSubStage == transactionSendEventOne.event_sub_stage
                    })

                    if (findOne) {
                        await ctx.model.transactionEvent.update({ blockchain_hex_key: findOne.HashID }, { where: { id: transactionSendEventOne.id}})
                        
                    } else {
                        await ctx.model.transactionEvent.update({ blockchain_hex_key: null }, { where: { id: transactionSendEventOne.id } })
                    }





                    stepa++
                    await Doa()
                }
                try {
                    await Doa()
                } catch (e) {

                }

            }

           








            step9++
            await Do9()
        }
        try {
            await Do9()
        } catch (e) {

        }





        var transactionList = await ctx.model.Transaction.findAll({ where: { status: 1, blockchain_hex_key: { [app.Sequelize.Op['eq']]: null } } });


        var company_id = []
        var transaction_id = []
        transactionList.forEach((t) => {
            company_id.push(t.trader_id)
            company_id.push(t.terminal_id)
            transaction_id.push(t.id)
        })

        const companyList = await ctx.model.Company.findAll({ raw: true, where: { id: company_id } })
        var companyMap = {}
        companyList.forEach((c) => {
            companyMap[c.id] = c
        })



        var step2 = 0
        async function Do2() {

           
            if (step2 >= transactionList.length) {
                return
            }
            var transaction = transactionList[step2]


            var transactionEventList = await ctx.model.Transactionevent.findAll({ raw: true, where: { transaction_id: transaction.id } });

            var BerthingPilotage = {}
            var UnberthingPilotage = {}

            transactionEventList.forEach((te) => {
                if (te.order_no && te.location_to && te.location_from) {


                    if (te.flow_pid == "9f2431b0-d3c9-11ed-a0d9-55ccaa27cc37" ) {

                        BerthingPilotage = te
                    }

                    if (te.flow_pid == "a7332eb0-d3c9-11ed-a0d9-55ccaa27cc37") {
                        UnberthingPilotage = te
                    }
                }

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
           
          

           

            ctx.activity_duration_start = new Date()
            const result = await ctx.curl(app.config.WriteHeaderBC, {
                timeout: 30000,
                method: 'POST',
                contentType: 'json',
                data: [head_data],
                dataType: 'json',
            });

            
            await addAPILog({ data: head_data, result: result.data, status: result.status == 201 ? 0 : 1, errorCode: result.status == 201 ? 0 : result.status, url: app.config.WriteHeaderBC })
            if (result.status == 201) {
                if (result.data[0].Stored == "True" || result.data[0].Store=="True") {
                    await transaction.update({ blockchain_hex_key: "send" })
                }

            }




            step2++
            await Do2()
        }
        try {
            await Do2()
        } catch (e) {

        }
        


        var transactionEventList = await ctx.model.Transactionevent.findAll({
            include:[{
                as: 't',
                attributes: [],
                model: ctx.model.Transaction,
                where: {status:1}

            }], order: [["event_time", "asc"]], where: { blockchain_hex_key: [null,"" ]}   });
        var m = {}

        var ids = []

        transactionEventList.forEach((t) => {
            if (!m[t.transaction_id]) {
                ids.push(t.transaction_id)
                m[t.transaction_id] = []
            }
            m[t.transaction_id].push(t)
        })
        var transactionEventArr = []
        for (var k in m) {
            transactionEventArr.push(m[k])
        }


        var transactionList = await ctx.model.Transaction.findAll({ where: { id: ids,status:1 } });

        var transactionMap = {}

        transactionList.forEach((t) => {
            transactionMap[t.id] = t.eos_id
        })



      


        var flowList = await ctx.model.Flow.findAll();

        var flowMap = {}

        flowList.forEach((f) => {
            flowMap[f.id] = f.code
        })


        
        var step3 = 0
        async function Do3() {

          
            if (step3 >= transactionEventArr.length) {

              
                return
            }
            var transactionEvent = transactionEventArr[step3]


            var reMap = {}
            
         
            var event_data = transactionEvent.map((te) => {


                var EventSubStage = flowMap[te.flow_id]

               

                if (!reMap[flowMap[te.flow_id]]) {

                    reMap[flowMap[te.flow_id]] = 0
                } 

                reMap[flowMap[te.flow_id]] += 1
                


               
               
                EventSubStage += (("00" + (reMap[flowMap[te.flow_id]]-1)).slice(-2))
                

                var b = {
                    "EOSID": transactionMap[te.transaction_id],
                    "EventSubStage": parseInt(EventSubStage),
                    "Timestamp": moment(new Date(te.event_time)).format('YYYY-MM-DDTHH:mm:ss+08:00'),
                    "Field1": te.product_quantity_in_bls_60_f ? parseInt(te.product_quantity_in_bls_60_f) : null,
                    "Field2": te.tank_number ? parseInt(te.tank_number) : null,
                    "Field3": te.work_order_id ? parseInt(te.work_order_id) : null,
                    "Field4": te.work_order_sequence_number ? parseInt(te.work_order_sequence_number) : null,
                    "Field5": te.work_order_operation_type ? te.work_order_operation_type : null,
                    "Field6": te.product_name ? te.product_name : null,
                    "Field7": te.work_order_status ? te.work_order_status : null,
                    "Field8": te.work_order_sequence_number_status ? te.work_order_sequence_number_status : null,
                    "Field9": te.work_order_surveyor ? te.work_order_surveyor : null
                }
                
                if (te.delay_reason) {
                    b.Field5 = te.delay_reason
                }

                if (te.location_from) {
                    b.Field6 = te.location_from
                }
                if (te.location_to) {
                    b.Field7 = te.location_to
                }
                return b
            })

          

           
             ctx.activity_duration_start = new Date()
            const result = await ctx.curl(app.config.WritetoBC, {
                 timeout: 30000,
                 method: 'POST',
                 contentType: 'json',
                 data: event_data,
                 dataType: 'json',
             });
 
            
            await addAPILog({ data: event_data, result: result.data, status: result.status == 201 ? 0 : 1, errorCode: result.status == 201 ? 0 : result.status, url: app.config.WritetoBC })
            if (result.status == 201) {
                if (result.data.length > 0) {


                    var step4 = 0
                    async function Do4() {
                        if (step4 >= result.data.length) {
                           
                            return
                        }
                        var BCback = result.data[step4]
                        if (BCback.Stored == "True") {
                           
                            await transactionEvent[step4].update({ blockchain_hex_key: "send", event_sub_stage: BCback.EventSubStage })
                        }
                       
                        step4++
                        await Do4()

                    }


                    await Do4()

                }   
 
             }

           

            step3++
            await Do3()
        }

        await Do3()



        

    }
}





module.exports = WritetoBC;