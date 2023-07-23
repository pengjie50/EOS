const Subscription = require('egg').Subscription;
const uuid = require('uuid');

const moment = require('moment')



class WritetoBC extends Subscription {

    static get schedule() {
        return {
            interval: '60s',
            type: 'worker',
        };
    }


    

    

    async subscribe() {
        
        const { ctx, service, app } = this;


        var addAPILog = async (params)=> {


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

        var transactionList = await ctx.model.Transaction.findAll({  where: { status: 1, blockchain_hex_key: { [app.Sequelize.Op['eq']]:null } } });
      
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


            var transactionEventList = await ctx.model.Transactionevent.findAll({ raw: true, where: { transaction_id: transaction.id, blockchain_hex_key: { [app.Sequelize.Op['eq']]: null } } });

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

           
            var head_data = {
                    "EOSID": transaction.eos_id,
                    "StartOfTransaction": moment(new Date(transaction.start_of_transaction)).format('YYYY-MM-DDTHH:mm:ss+08:00'),
                    "EndOfTransaction": moment(new Date(transaction.end_of_transaction)).format('YYYY-MM-DDTHH:mm:ss+08:00'),
                    "ArrivalID": transaction.arrival_id,
                    "Jetty": transaction.jetty_name,
                    "VesselName": transaction.vessel_name,
                "TerminalName": companyMap[transaction.terminal_id]?.name || 'null',
                "TraderName": companyMap[transaction.trader_id]?.name || 'null',
                    "Agent": transaction.agent,
                    "Status": transaction.status + "",
                    "VesselSize": transaction.vessel_size_dwt,
                    "ArrivalStatus": transaction.arrival_id_status,
                    "IMONumber": transaction.imo_number,
                "BerthingPilotageID": BerthingPilotage.order_no ? parseInt(BerthingPilotage.order_no) :0,
                "PilotageLocationFrom1": BerthingPilotage.location_from || 'null',
                "PilotageLocationTo1": BerthingPilotage.location_to || 'null',
                "UnberthingPilotageID": UnberthingPilotage.order_no ? parseInt(UnberthingPilotage.order_no) : 0,
                "PilotageLocationFrom2": UnberthingPilotage.location_from || 'null',
                "PilotageLocationTo2": UnberthingPilotage.location_to || 'null'

                }
               

            
           
            console.log(head_data)

            ctx.activity_duration_start=new Date()
            const result = await ctx.curl(app.config.WriteHeaderBC, {
                timeout: 30000,
                method: 'POST',
                contentType: 'json',
                data: [head_data],
                dataType: 'json',
            });

            console.log(result.data)
            console.log(result)
            addAPILog({ data: head_data, result: result.data, status: result.status == 201 ? 0 : 1, errorCode: result.status == 201 ? 0 : result.status, url: app.config.WriteHeaderBC })
            if (result.status == 201) {
                if (result.data[0].Store) {
                    transaction.update({ blockchain_hex_key: result.data[0].HashID })
                }
               
            }
           
            

           

            step2++
            await Do2()
        }
        
        await Do2()




       
        

      
      /* 

        console.log(result)*/

    }
}





module.exports = WritetoBC;