/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');
const company = require('../model/company');


class SystemService extends Service {

    async fieldUniquenessCheck(params) {
        const ctx = this.ctx;
        var res = await ctx.model[params.model].findOne({
            where: params.where,
            raw: true
        });
        ctx.body = { success: true, data: res }
    }
    async fieldSelectData(params) {


        const { ctx, app } = this;
        var Op = app.Sequelize.Op
        let obj = {}
        
        if (params.where) {
            console.log(params.where)
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

        if (params.model == 'Transaction') {


        
            if (ctx.user.role_type == 'Super') {


            } else {


                obj.where[Op['or']] = [{ terminal_id: [...ctx.user.accessible_organization, ctx.user.company_id] }, { trader_id: [...ctx.user.accessible_organization, ctx.user.company_id] }]



            }
        }

        var companyMap = {}
        if (params.field != 'jetty_id') {
           
            
            if (params.field == 'eos_id') {
                obj.where[params.field] = { [this.app.Sequelize.Op.like]: params.value.replace("E", "") + "%" }
            } else if (params.field == 'organization_id' || params.field == 'threshold_organization_id') {
                var companyList = await ctx.model.Company.findAll({ where: { name: { [this.app.Sequelize.Op.like]: params.value + "%" } } })
                companyList.forEach((c) => {
                    companyMap[c.id] = c.name
                })

            }else if (params.field == 'alertrule_type') {
               

            }else if (params.field == 'vessel_size_dwt') {


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
            } else if (params.field == 'organization_id' || params.field == 'threshold_organization_id') {

                if (companyMap[a.trader_id] ) {
                    data[a.trader_id] = companyMap[a.trader_id] 
                }

                if ( companyMap[a.terminal_id]) {
                    data[a.terminal_id] = companyMap[a.terminal_id]
                }

               


            } else if (params.field == 'eos_id') {
                data[a[params.field]] = "E" + a[params.field]
            } else {
                data[a[params.field]] = a[params.field]
            }

        })
        ctx.body = { success: true, data: data }
    }

    async receiveSGTradexData(params) {

        const { ctx, app } = this;

        app.logger.warn('checkTokenreceiveSGTradexData11111111111');
        app.logger.warn(ctx.params.data_element_id);

        if (!ctx.checkToken) {
            ctx.status = 401;
            ctx.body = { error: "unauthorized" }
            return
        }
        app.logger.warn('checkTokenreceiveSGTradexData22222222222');

        var res = null
        app.logger.warn(JSON.stringify(params));
        if (params.payload) {
            ctx.logger.warn('checkTokenreceiveSGTradexData333333333');


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


    }


}

module.exports = SystemService;

