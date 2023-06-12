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
        ctx.body = { success: true, data: res ? true : false }
    }
}

module.exports = SystemService;

