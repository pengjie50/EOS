/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class JettyService extends Service {

    async findOne(params) {
        const ctx = this.ctx;
        var res = await ctx.model.Jetty.findByPk(params.id);
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
        var Op = app.Sequelize.Op
        if (obj.where.terminal_id) {
            if (ctx.user.role_type == 'Super') {

            } else if (ctx.user.role_type == 'Trader') {


            }

        } else {
            if (ctx.user.role_type == 'Trader') {


                obj.where.terminal_id = {
                    [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                }
            } else if (ctx.user.role_type == 'Terminal') {
                obj.where.terminal_id = ctx.user.company_id

            }
        }
        const list = await ctx.model.Jetty.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        };

    }

    async add(params) {



        const { ctx } = this;

        if (params.batch_data) {

            const res = await ctx.model.Jetty.bulkCreate(params.batch_data);
            ctx.body = { success: true, data: res };
            return

        }





        if (!params.terminal_id) {
            params.terminal_id = ctx.user.company_id
        }
        params.company_id = ctx.user.company_id
        const res = await ctx.model.Jetty.create(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }




    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.Jetty.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;

    }
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Jetty.findByPk(params.id);

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

module.exports = JettyService;

