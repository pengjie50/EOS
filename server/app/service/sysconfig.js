/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class SysconfigService extends Service {

    async findOne(params) {
        const ctx = this.ctx;
        var res = await ctx.model.Sysconfig.findByPk(params.id);
        ctx.body = { code: 0, data: res }
    }
    async getValueByKey(key) {
        const ctx = this.ctx;
        var res = await ctx.model.Sysconfig.findOne({ where: { config_key: key } });
        return res.value
    }
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

        const list = await ctx.model.Sysconfig.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        };

    }

    async add(params) {



        const { ctx } = this;

        const res = await ctx.model.Sysconfig.create(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode };
        }




    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.Company.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;

    }
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Sysconfig.findByPk(params.id);

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

module.exports = SysconfigService;

