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
        const {ctx} = this;
        
        let obj={}  

        if(params.where){
            obj.where = params.where
        }
        if(params.order){
            obj.order = params.order
        }
        if(params.page && params.limit){
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
        obj.attributes = [[ctx.model.col('u.username'),'username'],'oper_log.*']
        obj.include=[{
            as: 'u',
            attributes:[],
            model: ctx.model.User
          
        }]
        obj.raw=true
        const list = await ctx.model.Operlog.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        }; 
        
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

