/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;



class RolepermissionService extends Service {
    
    async getById(params){
        const {ctx} = this;
        try {
            if (!params.id) {
                params.id=ctx.role.role_id
                
            }
            const role = await ctx.model.Rolepermission.findOne({
                where: {
                    id: params.id
                },
            });
            return role
        } catch (e) {
            throw new Error(e)
        }
    }
    async list(params) {
        const {ctx} = this;
       
        
        const list = await ctx.model.Rolepermission.findAndCountAll({
            attributes: [[ctx.model.col('p.name'),'name'],'role_permission.*'],
            where:{role_id:params.role_id},
            include: [{
                as:'p',
                model: ctx.model.Permission
               
            },{
                as:'r',
                model: ctx.model.Role
              
            }],
            raw:true
            
        })

        ctx.status = 200;
        ctx.body= {
            success: true,
            data: list.rows
            
        };
        
    }

    async add(params) {

        
        const { ctx } = this;

        const res3 = await ctx.model.Rolepermission.destroy({ where: {role_id:params.role_id } });
        var arr=params.permission_ids.map((a)=>{
            return {permission_id:a,role_id:params.role_id}

        })
        
        const res = await ctx.model.Rolepermission.bulkCreate(arr);
        

        if (res) {
            return true
            //ctx.body = { success: true, }
        } else {
            return false
            //ctx.body = { success: false, errorCode:1000}
        }

       
        
    }
    

    async del(params) {

        
        const {ctx} = this;
      
        const res = await ctx.model.Rolepermission.destroy({ where: { permission_id: params.permission_ids.split(','),role_id:params.role_id } });
        
        if(res){
            ctx.body= {code:0}
        }else{
            ctx.body= {code:1000}
        }

        
        
    }
}

module.exports = RolepermissionService;

