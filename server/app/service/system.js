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

        if (params.model =='Transaction') {
            var Op = app.Sequelize.Op
            if (obj.where.organization_id) {
                if (ctx.user.role_type == 'Super') {
                    obj.where[Op['or']] = [{ terminal_id: obj.where.organization_id }, { trader_id: obj.where.organization_id }]
                } else if (ctx.user.role_type == 'Trader') {

                    obj.where.terminal_id = obj.where.organization_id
                } else if (ctx.user.role_type == 'Terminal') {
                    obj.where.trader_id = obj.where.organization_id
                }
                delete obj.where.organization_id
            } else {
                if (ctx.user.role_type == 'Trader') {

                    obj.where.trader_id = ctx.user.company_id
                    obj.where.terminal_id = {
                        [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                    }
                } else if (ctx.user.role_type == 'Terminal') {
                    obj.where.terminal_id = ctx.user.company_id
                    obj.where.trader_id = {
                        [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                    }
                }
            }
        }

       
      
        obj.where[params.field] = { [this.app.Sequelize.Op.like]: params.value +"%"}

      
      
        var res = await ctx.model[params.model].findAll({
            where: obj.where,
            raw: true
        });
        var data = {}
        res.forEach((a) => {
            
            data[a[params.field]] = a[params.field]
        })
        ctx.body = { success: true, data: data }
    }

    
}

module.exports = SystemService;

