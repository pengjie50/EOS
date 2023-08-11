/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class LoginlogService extends Service {


    async list(params) {
        const { ctx } = this;

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
        obj.attributes = [[ctx.model.col('u.username'), 'username'], [ctx.model.col('c.name'), 'company_name'], 'login_log.*']
        obj.include = [{
            as: 'u',
            attributes: [],
            model: ctx.model.User

        }, {
            as: 'c',
            model: ctx.model.Company,
            attributes: [],
        }]
        obj.raw = true

        var is_report = false
      
        if (obj.where.is_report) {
            is_report = true
        }
        delete obj.where.is_report

        var report
        if (is_report) {

            report = await ctx.model.Report.findOne({ where: { id: obj.where.report_id } })
            if (report && report.json_string) {

                var backData = eval('(' + report.json_string + ')')
                var offset = parseInt((params.page - 1)) * parseInt(params.limit)
                var limit = parseInt(params.limit)

                backData.data = backData.data.slice(offset, offset + limit)
                ctx.body = backData

                return


            } else {
                obj.offset = 0
                obj.limit = 1000000000

            }

            delete obj.where.report_id


           
        }



        const list = await ctx.model.Loginlog.findAndCountAll(obj)
      
        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        };
        if ( is_report) {
            report.update({ json_string: JSON.stringify(ctx.body) })


        }
    }

    async add(params) {

        const { ctx } = this;

        const res = await ctx.model.Loginlog.create(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false };
        }

    }

    async checkPasswordErrorTimes(login_lock) {
        var count = 5
        var time_out = 60 * 1000
        
        if (login_lock) {
            count = parseInt(login_lock.split("/")[0])
            time_out = parseInt(login_lock.split("/")[1]) * 1000
        }


        const { ctx } = this;
        const Op = this.app.Sequelize.Op;
        var count_ = await ctx.model.Loginlog.count({ where: { login_time: { [Op['between']]: [new Date((new Date).getTime() - time_out), new Date] } } })
        if (count_ > count) {
            return false
        }
        return count_
    }


}

module.exports = LoginlogService;

