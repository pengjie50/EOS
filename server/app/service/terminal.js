/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class TerminalService extends Service {
    
    async findOne(params){
        const ctx = this.ctx;
        var res=await ctx.model.Terminal.findByPk(params.id);
        ctx.body ={success:true,data:res} 
    }
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
        
        const list = await ctx.model.Terminal.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        }; 
        
    }

    async add(params) {

     
 
        const {ctx} = this;
        params.id=uuid.v1()//.replace(/-/g,"");
        const res = await ctx.model.Terminal.create(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
        

        
        
    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.Terminal.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;
        
    }
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Terminal.findByPk(params.id);

        if (!user) {
          ctx.status = 404;
            ctx.body = { success: false, errorCode:1000};
          return;
        }

        const res = await user.update(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success:false,errorCode:1000};
        }
       
    }
    
}

module.exports = TerminalService;

