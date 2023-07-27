/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('./base_service');
const uuid = require('uuid');
const where = require('../middleware/where');
const Sequelize = require('sequelize');
const report = require('../model/report');
const { type } = require('tedious/lib/data-types/ntext');

class AlertService extends Service {

    async findOne(params) {
        const ctx = this.ctx;
        var res = await ctx.model.Alert.findByPk(params.id);
        ctx.body = { success: true, data: res }
    }
    async list(params) {
        const { ctx, app } = this;

        let obj = {}

        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }
        if (params.order) {
            obj.order = params.order
        }
        if (params.page && params.limit) {
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }



        if (ctx.user.role_type != "Super") {
            var Op = Sequelize.Op
            obj.where[Op.or] = [
                
                {
                    alertrule_type: { [Op.ne]: 1 },
                    flow_id: { [Op.in]: [...ctx.user.accessible_timestamp,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] },
                    flow_id_to: { [Op.eq]: null }
                },
                {
                    alertrule_type: { [Op.eq]: 1 },
                    flow_id: { [Op.in]: ctx.user.accessible_timestamp },
                    flow_id_to: { [Op.in]: ctx.user.accessible_timestamp }
                }
            ]
                
               
        }
            
            
       

        var is_report = false
        if (obj.where.is_report) {
            is_report = true
        }
        delete obj.where.is_report





        var t_where = {}
        for (var i in obj.where) {
            if (i.indexOf("t.") > -1) {
                if (!t_where) {
                    t_where = {}
                }
                t_where[i.replace("t.", "")] = obj.where[i]

                delete obj.where[i]
            }

        }



        var Op = app.Sequelize.Op

        if (ctx.user.role_type == 'Super') {

            if (obj.where.organization_id) {
                obj.where.company_id = obj.where.organization_id
            }

        } else {
            if (this.access("alert_list")) {

                obj.where.user_id = ctx.user.user_id

                if (this.access("alert_list_company")) {
                    delete obj.where.user_id
                    obj.where.company_id = ctx.user.company_id
                }

                if (this.access("alert_list_tab")) {
                    if (obj.where.tab) {
                        if (obj.where.tab[app.Sequelize.Op.eq] == 'Terminal') {




                        } if (obj.where.tab[app.Sequelize.Op.eq] == 'Trader') {
                            delete obj.where.user_id
                            if (!obj.where.organization_id) {

                                obj.where.company_id = {
                                    [app.Sequelize.Op['in']]: ctx.user.accessible_organization
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




        delete obj.where.tab
        delete obj.where.organization_id


        obj.include = [{
            as: 't',
            model: ctx.model.Transaction,
            where: t_where
        }, {
            as: 'ar',
            model: ctx.model.AlertruleTransaction

        }]
        var showNoRead = false
        if (obj.where && obj.where.showNoRead) {
            showNoRead = true
            delete obj.where.showNoRead
        }
        obj.raw = true

        var m = new Map()

        if (showNoRead) {
            var noReadArr = await ctx.model.query("select *  FROM alert where id not in (select alert_id from alert_user_read where user_id='" + ctx.user.user_id + "')", { type: Sequelize.QueryTypes.SELECT })

            var ids = []
            noReadArr.forEach((nr) => {
                m.set(nr.id, true)
                ids.push(nr.id)
            })
            obj.where.id = ids
        }



        const list = await ctx.model.Alert.findAndCountAll(obj)

        if (params.isCount) {
            return list.count
        }




        ctx.status = 200;




       
        var jetty_id = []
        list.rows.forEach((a) => {
            jetty_id.push(a['t.jetty_id'])

        })

        const jettyList = await ctx.model.Jetty.findAll({ raw: true, where: { id: jetty_id } })
        var jettyMap = {}
        jettyList.forEach((j) => {
            jettyMap[j.id] = j
        })

        list.rows = list.rows.map((a) => {
            a.jetty_name = jettyMap[a["t.jetty_id"]]?.name || "-"

            return a
        })
        ctx.body = {
            success: true,
            total: list.count,
            top_total: 0,
            top_all_total: 0,
            data: list.rows

        };



    }


    async setUserReadAlert(params) {
        const { ctx, sequelize, app } = this;





        var noReadArr = await ctx.model.query("select *  FROM alert where id not in (select alert_id from alert_user_read where user_id='" + ctx.user.user_id + "')", { type: Sequelize.QueryTypes.SELECT })




        var readArr = []
        noReadArr.forEach((a) => {

            readArr.push({ user_id: ctx.user.user_id, alert_id: a.id })



        })

        if (readArr.length > 0) {


            await ctx.model.AlertUserRead.bulkCreate(readArr);
        }

        ctx.body = { success: true, data: "dddd" };

    }
    async getUserUnreadAlertCount(params) {
        const { ctx, sequelize, app } = this;

        var count = await this.list({ where: { showNoRead: true }, isCount: true })


        return count
    }

    async add(params) {



        const { ctx } = this;

        const res = await ctx.model.Alert.create(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }

    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.Alert.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;

    }
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Alert.findByPk(params.id);

        if (!user) {
            ctx.status = 404;
            ctx.body = { success: false, errorCode: 1000 };
            return;
        }

        const res = await user.update(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }

    }

}

module.exports = AlertService;

