const Subscription = require('egg').Subscription;
const uuid = require('uuid');


var codeMap = {
    "toai_pilot_on_board_for_mooring_time": "1001",
    "pilot_service_request_time": "1002",
    "lqb_order_creation_time": "1003",
    "pilot_booking_confirmed_time": "1004",
    "pilot_arrival_time": "1005",
    "toai_pilot_on_board_for_mooring_time": "1006",
    "pilot_onboard_time": "1007",
    "lqb_pilot_on_board_time": "1008",
    "lqb_agent_acknowledgment_time": "1009",
    "towoi_nor_tendered_time": "1010",
    "pilotage_start_time": "2001",
    "pilotage_delay_start_time": "2002",
    "pilotage_end_time": "2003",
    "toai_first_line_rope_ashore_time": "2004",
    "toai_all_fast_time": "2005",
    "towoi_nor_accepted_time": "2006",
    "towoi_hose_connect_end_time": "2007",
    "tosi_cargo_start_first_foot_start_time": "3001",
    "tosi_first_foot_end_time": "3002",
    "tosi_first_foot_clear_time": "3003",
    "tosi_first_foot_resume_time": "3004",
    "tosi_cargo_cease_items": "3005",//[0].cease_time
    "tosi_cargo_cease_items": "3006",//[0].continue_time
    "tosi_cargo_end_time": "3007",
    "towoi_hose_connect_end_time": "4001",
    "toai_documentation_on_board_time": "4002",
    "pilot_service_request_time_agent_toa": "4003",
    "pilot_service_request_time": "4004",
    "lqb_order_creation_time": "4005",
    "pilot_booking_confirmed_time": "4006",
    "pilot_arrival_time": "4007",
    "pilot_onboard_time": "4008",
    "toai_pilot_on_board_for_unmooring_time": "4009",
    "lqb_pilot_on_board_time": "4010",
    "lqb_agent_acknowledgment_time": "4011",
    "pilotage_start_time": "4012",
    "pilotage_delay_start_time": "4013",
    "pilotage_end_time": "4014",
    
      
    
}

class ProcessIngInterfaceData extends Subscription {

    static get schedule() {
        return {
            interval: '60s',
            type: 'worker',
        };
    }
    async subscribe() {

       /* const { ctx, service, app } = this;
        var flow = await ctx.model.Flow.findAll()
        var flowMap = {}
        flow.forEach((t) => {
            flowMap[t.code + ""] = t
        })
        var step = 0;
        async function oneDo() {

            var InterfacedataList = await ctx.model.Interfacedata.findAll({ raw: true, where: { already_used: 0 } })

            var i = InterfacedataList[step]

            if (i.type == 1) {
                var transaction = await ctx.model.Transaction.findOne({ where: { imo_number: i.toai_imo_number } })
                if (!transaction) {

                    const jetty = await ctx.model.Jetty.findOne({ where: { name: i.toai_jetty_berth_location } })

                    // const trader = await ctx.model.Company.findOne({ where: { name: interface.Customer} })

                    transaction = {

                        status: 0,

                        arrival_id: i.toai_arrival_id,

                        vessel_size_dwt: i.toai_vessel_size_dwt,

                        imo_number: i.toai_imo_number,
                        vessel_name: i.toai_vessel_name,
                        terminal_id: jetty ? jetty.terminal_id : null,

                        jetty_id: jetty ? jetty.id : null,



                    }
                    transaction = await ctx.model.Transaction.create(transaction)
                    if (transaction) {
                        var eventArr = []
                        for (var k in i) {
                            if (k.indexOf("_time") > -1) {
                                var event = {}
                                event.transaction_id = transaction.id
                                event.flow_id = flowMap[codeMap[k]]
                                eventArr.push(eventArr)
                            }
                        }





                    }

                }
            }

            

        }

        await oneDo()*/


        

    }

        
}





module.exports = ProcessIngInterfaceData;