/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');

class CompanyService extends Service {

    async findOne(params) {
        const ctx = this.ctx;
        var res = await ctx.model.Company.findByPk(params.id);
        ctx.body = { success: true, data: res }
    }
    async organization(params) {
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

        obj.raw = true

        if (ctx.user.role_type == 'Super') {


            if (obj.where.type) {

            } else {
                obj.where.type = { [app.Sequelize.Op['ne']]: 'Super' }
            }
        } else {


            obj.where.id = {
                [app.Sequelize.Op['in']]: ctx.user.accessible_organization
            }
        }
        const list = await ctx.model.Company.findAndCountAll(obj)

        ctx.status = 200;

        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        };


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
        obj.raw = true
        const list = await ctx.model.Company.findAndCountAll(obj)
        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        };


    }

    async add(params) {
        const { ctx } = this;
        params.pid = "cccccccc-cccc-cccc-cccc-cccccccccccc"
        const res = await ctx.model.Company.create(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
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
        const user = await ctx.model.Company.findByPk(params.id);

        if (!user) {
            ctx.status = 404;
            ctx.body = { code: 1000 };
            return;
        }
        if (params.id == params.pid) {
            delete params.pid
        }

        const res = await user.update(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }

    }

}

module.exports = CompanyService;

