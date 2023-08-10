/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class RoleService extends Service {
    
    async findOne(params){
        const ctx = this.ctx;
        var res=await ctx.model.Role.findByPk(params.id);
        ctx.body = { success: true,data:res} 
    }
    async list(params) {
        const {ctx} = this;
        
        let obj={}  

        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }
        if(params.order){
            obj.order = params.order
        }
       
        if(params.page && params.limit){
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
        obj.attributes= [[ctx.model.col('c.name'),'company_name'],'role.*']
        obj.include=[{
            as:'c',
            model: ctx.model.Company
          
        }]
        obj.raw=true
        const list = await ctx.model.Role.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        }; 
        
    }

    async add(params) {

     

        const { ctx, service } = this;
       
        params.company_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'

        params.role_type ="Normal"
       const res = await ctx.model.Role.create(params);
       
       

        if (res) {
            if (params.accessible_permissions) {
                await service.rolepermission.add({ role_id: res.id, permission_ids: params.accessible_permissions });
            }
           
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
        

        
        
    }

    async del(params) {

        const ctx = this.ctx;

        var user=await ctx.model.User.findOne({
            where: {
                role_id: params.id
            }
        })

        if (!user) {

           
            await ctx.model.User.destroy({
                where: {
                    role_id: params.id
                }
            })
            await ctx.model.Rolepermission.destroy({
                where: {
                    role_id: params.id
                }
            })
            let res = await ctx.model.Role.destroy({
                where: {
                    id: params.id
                }
            })
            ctx.body = { success: true };
            ctx.status = 200;
        } else {
            ctx.body = { success: false, errorCode: 1012 };
        }

        
        
    }
    async mod(params) {

        const { ctx, service } = this;
        const user = await ctx.model.Role.findByPk(params.id);

        if (!user) {
          ctx.status = 404;
            ctx.body = { success: false, errorCode:1000};
          return;
        }

        const res = await user.update(params);
        if (res) {
            if (!params.accessible_permissions) {
                params.accessible_permissions=[]
            }
            await service.rolepermission.add({ role_id: user.id, permission_ids: params.accessible_permissions });
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
       
    }
    
}

module.exports = RoleService;

