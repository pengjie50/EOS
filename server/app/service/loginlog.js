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
        const list = await ctx.model.Loginlog.findAndCountAll(obj)
        console.log(list.rows)
        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        };

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
        console.log(login_lock)
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

