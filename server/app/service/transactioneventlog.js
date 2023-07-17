/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class TransactioneventlogService extends Service {


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
        obj.attributes = [[ctx.model.col('f.name'), 'name'], [ctx.model.col('f.code'), 'code'], 'transaction_event_log.*'];
        obj.include = [{
            as: 'f',
            attributes: [],
            model: ctx.model.Flow

        }]
        const list = await ctx.model.Transactioneventlog.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        };

    }


}

module.exports = TransactioneventlogService;

