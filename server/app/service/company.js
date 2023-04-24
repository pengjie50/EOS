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
    
    async findOne(params){
        const ctx = this.ctx;
        var res=await ctx.model.Company.findByPk(params.id);
        ctx.body = { success: true,data:res} 
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
        obj.attributes= [[ctx.model.col('pc.name'),'company_name'],'company.*']
        obj.include=[{
            as:'pc',
            model: ctx.model.Company
          
        }]
        obj.raw=true
        const list = await ctx.model.Company.findAndCountAll(obj)

        ctx.status = 200;
        
        ctx.body = {
            success: true,
            total: list.count,
            data:list.rows
            
        };
        console.log(ctx.body)
        
    }

    async add(params) {

        const {ctx} = this;
        params.id=uuid.v1();
        params.pid = "1111"
        console.log(params)
        const res = await ctx.model.Company.create(params);

        if(res){
            ctx.body = {success:true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
     
    }

    async del(params) {

        /*const ctx = this.ctx;
        const user = await ctx.model.Company.findByPk(params.id);
        if (!user) {
          ctx.status = 404;
          ctx.body={code:1000}
          return;
        }

        await user.destroy();
        ctx.body = {code:0};
        ctx.status = 200;*/
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
          ctx.body = {code:1000};
          return;
        }
        if(params.id==params.pid){
          delete params.pid
        }
        

        const res = await user.update(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
       
    }
    
}

module.exports = CompanyService;

