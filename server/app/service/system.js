/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


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
        let obj = {}

        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }

        if (params.model == 'Transaction') {
            var Op = app.Sequelize.Op
            if (ctx.user.role_type == 'Super') {


            } else {


                obj.where[Op['or']] = [{ terminal_id: [...ctx.user.accessible_organization, ctx.user.company_id] }, { trader_id: [...ctx.user.accessible_organization, ctx.user.company_id] }]



            }
        }


        if (params.field != 'jetty_id') {
            obj.where[params.field] = { [this.app.Sequelize.Op.like]: params.value + "%" }
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
        }

        res.forEach((a) => {
            if (params.field == 'jetty_id') {
                data[a.id] = a.name
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

