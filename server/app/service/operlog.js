/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class OperlogService extends Service {


    async list(params) {
        const { ctx } = this;

        let obj = {}

        if (params.where) {
            obj.where = params.where
        }
        if (params.order) {
            obj.order = params.order
        }
        if (params.page && params.limit) {
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
        obj.attributes = [[ctx.model.col('u.username'), 'username'], 'oper_log.*']
        obj.include = [{
            as: 'u',
            attributes: [],
            model: ctx.model.User

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
        const list = await ctx.model.Operlog.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        };
        if (is_report) {
            report.update({ json_string: JSON.stringify(ctx.body) })


        }

    }
    async add(params) {

        const { ctx } = this;

        const res = await ctx.model.Operlog.create(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false };
        }

    }

    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Operlog.findByPk(params.id);

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

module.exports = OperlogService;

