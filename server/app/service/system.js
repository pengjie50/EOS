/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('./base_service');
const uuid = require('uuid');
const company = require('../model/company');


class SystemService extends Service {

    async fieldUniquenessCheck(params) {
        const { ctx,app } = this;

        if (params.where.hasOwnProperty("alias")) {
            if (!params.where.alias) {
                ctx.body = { success: true, data: null }
                return
            }
            var arr = params.where.alias.split(",")
            params.where[app.Sequelize.Op.or] =[]
            arr.forEach((alias) => {
                params.where[app.Sequelize.Op.or].push(
                    {
                        alias: { [app.Sequelize.Op.like]: '%,' + alias }
                      
                    },
                    {
                        alias: { [app.Sequelize.Op.like]: alias+',%' }

                    },
                    {
                        alias: { [app.Sequelize.Op.like]: '%,'+alias+',%' }

                    },{
                        alias: { [app.Sequelize.Op.eq]: alias }
                      
                    }
                )

                 
            })
           delete params.where.alias
        }
        
        var res = await ctx.model[params.model].findOne({
            where: params.where,
            raw: true
        });
        ctx.body = { success: true, data: res }
    }
    async fieldSelectData(params) {


        const { ctx, app,service } = this;
        var Op = app.Sequelize.Op
        let obj = {}


         













        
        if (params.where) {
          
            obj.where = params.where
            if (params.Op) {
                var w = {}
                for (var i in params.where) {
                    var ww = {}
                    for (var k in params.where[i]) {
                        ww[Op[k]] = params.where[i][k]
                    }
                    w[i]=ww
                }
                obj.where=w
            }
            
        } else {
            obj.where = {}
        }



        if (params.model == 'Alert') {

            await service.alert.list(obj)
           


            var data = {}

            ctx.body.data.forEach((a) => {
                if (params.field == 'alert_id') {
                    data[a[params.field]] = "A" + a[params.field]
                } else if (params.field == 't.status') {
                    data[a[params.field]] = a[params.field] == 0 ? "Open" : (a[params.field] == 1 ?"Closed":"Cancelled")
                } else if (params.field == 'flow_id_to') {
                    
                    data[a.flow_id + "_" + a[params.field]] = a.flow_id + "_" + a[params.field]
                } else {

                    data[a[params.field]] = a[params.field]
                }

            })


            
            ctx.body = { success: true, data: data }

            return
        }

        if (params.model == 'Report') {
            if (ctx.user.company_type!='Super') {
                obj.where = { company_id: ctx.user.company_id }
            }
           



        } else
            if (params.model == 'Transaction') {



                if (ctx.user.role_type == 'Super') {
                    if (obj.where.organization_id) {

                        obj.where[Op['or']] = [{ terminal_id: obj.where.organization_id }, { trader_id: obj.where.organization_id }]
                    }

                } else {






                    if (ctx.user.accessible_organization.length == 0) {
                        obj.where.trader_id = "none"
                        obj.where.terminal_id = "none"
                    } else {
                        if (obj.where.organization_id) {

                            let terminalFilter = obj.where.organization_id[Op['in']].filter(item => ctx.user.accessible_organization_terminal.indexOf(item) > -1)
                            let traderFilter = obj.where.organization_id[Op['in']].filter(item => ctx.user.accessible_organization_trader.indexOf(item) > -1)

                            if (terminalFilter.length > 0 && traderFilter.length > 0) {
                                obj.where.terminal_id = ctx.user.accessible_organization_terminal
                                obj.where.trader_id = ctx.user.accessible_organization_trader
                            } else {
                                if (ctx.user.company_type == "Terminal" && traderFilter.length > 0) {
                                    obj.where.terminal_id = ctx.user.company_id
                                    obj.where.trader_id = traderFilter
                                } else if (ctx.user.company_type == "Trader" && terminalFilter.length > 0) {
                                    obj.where.terminal_id = terminalFilter
                                    obj.where.trader_id = ctx.user.company_id
                                } else {
                                    obj.where.trader_id = "none"
                                    obj.where.terminal_id = "none"
                                }



                            }

                        } else {

                            obj.where.terminal_id = ctx.user.accessible_organization_terminal
                            obj.where.trader_id = ctx.user.accessible_organization_trader


                        }
                    }




                }
            } else if (params.model == 'Alertrule') {

                if (ctx.user.role_type != "Super") {
                    var Op = app.Sequelize.Op


                    obj.where[Op.or] = [

                        {
                            type: { [Op.ne]: 1 },
                            flow_id: { [Op.in]: [ctx.user.accessible_timestamp, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] },
                            flow_id_to: { [Op.eq]: null }
                        },
                        {
                            type: { [Op.eq]: 1 },
                            flow_id: { [Op.in]: ctx.user.accessible_timestamp },
                            flow_id_to: { [Op.in]: ctx.user.accessible_timestamp }
                        }
                    ]


                }





                if (ctx.user.role_type == 'Super') {
                    if (obj.where.organization_id) {
                        obj.where.company_id = obj.where.organization_id
                    }


                } else {

                    if (this.access("alertrule_list")) {

                        obj.where.user_id = ctx.user.user_id

                        if (this.access("alertrule_list_company")) {
                            delete obj.where.user_id
                            obj.where.company_id = ctx.user.company_id
                        }

                        if (this.access("alertrule_list_tab")) {
                            if (obj.where.tab) {
                                if (obj.where.tab[app.Sequelize.Op.eq] == 'Self') {




                                } if (obj.where.tab[app.Sequelize.Op.eq] == 'Others') {
                                    delete obj.where.user_id
                                    if (!obj.where.organization_id) {

                                        obj.where.company_id = {
                                            [app.Sequelize.Op['in']]: ctx.user.accessible_organization.filter((a) => {
                                                return a != ctx.user.company_id
                                            })
                                        }
                                    } else {

                                        obj.where.company_id = obj.where.organization_id
                                    }

                                } else if (obj.where.tab[app.Sequelize.Op.eq] == 'All') {
                                    delete obj.where.user_id
                                    obj.where.company_id = {
                                        [app.Sequelize.Op['in']]: [...ctx.user.accessible_organization, ctx.user.company_id]
                                    }
                                }

                            }
                        }
                    }



                }
                delete obj.where.organization_id
                delete obj.where.tab




            }

        var companyMap = {}
        if (params.field != 'jetty_id') {
           
            
            if (params.field == 'eos_id') {
                obj.where[params.field] = { [this.app.Sequelize.Op.like]: params.value.replace("E", "") + "%" }
            } else if (params.field == 'organization_id' || params.field == 'threshold_organization_id' || params.field == 'company_id') {
                var companyList = await ctx.model.Company.findAll({ where: { name: { [this.app.Sequelize.Op.like]: params.value + "%" } } })
                companyList.forEach((c) => {
                    companyMap[c.id] = c.name
                })

            }else if (params.field == 'alertrule_type') {
               

            }else if (params.field == 'vessel_size_dwt') {


            } else if (params.field == 'user_id') {


            } else {
                obj.where[params.field] = { [this.app.Sequelize.Op.like]: params.value + "%" }
            }
        } 

       


        var res = await ctx.model[params.model].findAll({
            where: obj.where,
            raw: true
        });
        var data = {}



        if (params.field == 'jetty_id') {
            var jetty_id = []
            res.forEach((a) => {

                jetty_id.push(a.jetty_id)


            })
            res = await ctx.model.Jetty.findAll({
                where: { name: { [this.app.Sequelize.Op.like]: params.value + "%" }, id: jetty_id }
                ,
                raw: true
            });
        } if (params.field == 'user_id') {
            var user_id = []
            res.forEach((a) => {

                user_id.push(a.user_id)


            })
            res = await ctx.model.User.findAll({
                where: { username: { [this.app.Sequelize.Op.like]: params.value + "%" }, id: user_id }
                ,
                raw: true
            });
        } else if (params.field == 'alertrule_type') {

            var ids = []
            res.forEach((a) => {

                ids.push(a.id)


            })
            var alertList = await ctx.model.Alert.findAll({
                where: { transaction_id: ids }
                ,
                raw: true
            });
            var alertrule_typeMap = {}
            alertList.forEach((al) => {
                if (!alertrule_typeMap[al.alertrule_type + ""]) {
                    var m = {
                        '0': "Single Process",
                        '1': "Between Two Events",
                        '2': "Entire Transaction"
                    }
                    alertrule_typeMap[al.alertrule_type + ""] = m[al.alertrule_type + ""]




                }

            })

            ctx.body = { success: true, data: alertrule_typeMap }
            return
        } else if (params.field == 'vessel_size_dwt') {


                var m={
                "0-25000": "1. GP (General Purpose): Less than 24,990 DWT",
                "25000-45000": "2. MR (Medium Range): 25,000 to 44,990 DWT",
                "45000-80000": "3. LR1 (Long Range 1): 45,000 to 79,990 DWT",
                "80000-120000": "4. AFRA (AFRAMAX): 80,000 to 119,990 DWT",
                "120000-160000": "5. LR2 (Long Range 2): 120,000 to 159,990 DWT",
                "160000-320000": "6. VLCC (Very Large Crude Carrier): 160,000 to 319,990 DWT",
                "320000-1000000000": "7. ULCC (Ultra-Large Crude Carrier): More than 320,000 DWT",
                }
            var vessel_size_dwtMap = {}
            res.forEach((a) => {
                if (0 <= a.vessel_size_dwt && a.vessel_size_dwt < 25000) {
                    vessel_size_dwtMap["0-25000"] = "1. GP (General Purpose): Less than 24,990 DWT"
                } else if (25000 <= a.vessel_size_dwt && a.vessel_size_dwt < 45000) {
                    vessel_size_dwtMap["25000-45000"] = "2. MR (Medium Range): 25,000 to 44,990 DWT"
                } else if (45000 <= a.vessel_size_dwt && a.vessel_size_dwt < 80000) {
                    vessel_size_dwtMap["45000-80000"] = "3. LR1 (Long Range 1): 45,000 to 79,990 DWT"
                } else if (80000 <= a.vessel_size_dwt && a.vessel_size_dwt < 120000) {
                    vessel_size_dwtMap["80000-120000"] = "4. AFRA (AFRAMAX): 80,000 to 119,990 DWT"
                } else if (120000 <= a.vessel_size_dwt && a.vessel_size_dwt < 160000) {
                    vessel_size_dwtMap["120000-160000"] = "5. LR2 (Long Range 2): 120,000 to 159,990 DWT"
                } else if (160000 <= a.vessel_size_dwt && a.vessel_size_dwt < 320000) {
                    vessel_size_dwtMap["160000-320000"] = "6. VLCC (Very Large Crude Carrier): 160,000 to 319,990 DWT"
                } else if (320000 <= a.vessel_size_dwt && a.vessel_size_dwt < 1000000000) {
                    vessel_size_dwtMap["320000-1000000000"] = "7. ULCC (Ultra-Large Crude Carrier): More than 320,000 DWT"
                }
               


            })

            ctx.body = { success: true, data: vessel_size_dwtMap }
            return
        }

        res.forEach((a) => {
            if (params.field == 'jetty_id') {
                data[a.id] = a.name
            } if (params.field == 'user_id') {
                data[a.id] = a.username
            } else if (params.field == 'organization_id' || params.field == 'threshold_organization_id') {

                if (ctx.user.role_type == "Super") {
                   
                    
                } else {
                    if (this.access("transactions_list_tab")) {
                        if (companyMap[a.trader_id]) {
                            data[a.trader_id] = companyMap[a.trader_id]
                        }
                    } else {
                        if (companyMap[a.terminal_id]) {
                            data[a.terminal_id] = companyMap[a.terminal_id]
                        }
                    }


                }

                
                
               

               


            } else if (params.field == 'company_id' ) {

                
                 data[a.company_id] = companyMap[a.company_id]
                

                




            } else if (params.field == 'eos_id') {
                data[a[params.field]] = "E" + a[params.field]
            } else if (params.field == 'alertrule_id') {
                data[a[params.field]] = "T" + a[params.field]
            } else if (params.field == 'alert_id') {
                data[a[params.field]] = "A" + a[params.field]
            } else if (params.field == 'role_id') {
                data[a[params.field]] = "R" + a[params.field]
            } else {
                data[a[params.field]] = a[params.field]
            }

        })
        ctx.body = { success: true, data: data }
    }

    async receiveSGTradexData(params) {

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

        
        
        ctx.activity_duration_start = new Date()
        if (!ctx.checkToken) {

            await addAPILog({ data: params, result: { error: "unauthorized" }, status: 1, errorCode: 401, url: ctx.request.url })
            ctx.status = 401;
            ctx.body = { error: "unauthorized" }
            return
        }
       

        var res = null
       
        if (params.payload) {
           


            var arr = params.payload.map((a) => {
                var type = 0
                var work_order_id = a.towoi_work_order_id || a.tosi_work_order_id || null
                var imo_number = a.toai_imo_number || a.pilot_imo_no || a.pilot_lqb_imo_no || null
                if (ctx.params.data_element_id == "terminal_operations_arrival_information") {
                    type = 1
                } else if (ctx.params.data_element_id == "terminal_operations_work_order_information") {
                    type = 2
                } else if (ctx.params.data_element_id == "terminal_operations_tank_information") {
                    type = 3
                } else if (ctx.params.data_element_id == "demurrage_pilotage_service") {
                    type = 4
                } else if (ctx.params.data_element_id == "demurrage_terminal_pilot_booking_information") {
                    type = 5
                }
                return {
                    json_string: JSON.stringify(a),
                    work_order_id: work_order_id,
                    imo_number: imo_number,
                    already_used: 0,
                    type: type
                }


            })

            res = await ctx.model.Interfacedata.bulkCreate(arr)
        }
       
        ctx.status = 200;
        ctx.body = { success: true }
        await addAPILog({ data: params, result: { success: true }, status: 0, errorCode: 0, url: ctx.request.url })

    }


}

module.exports = SystemService;

