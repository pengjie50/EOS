/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class AlertruleService extends Service {
    
    async findOne(params){
        const ctx = this.ctx;
        var res=await ctx.model.Alertrule.findByPk(params.id);
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

        if (!ctx.user.isAdmin) {
            if (obj.where) {
                obj.where.user_id = ctx.user.user_id
            } else {
                obj.where = { user_id: ctx.user.user_id }
            }
        }
        if(params.page && params.limit){
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
        var alertrule = ctx.model.Alertrule

        if (obj.where.transaction_id) {
            alertrule = ctx.model.Alertruletransaction
        }



        const list = await ctx.model.Alertrule.findAndCountAll(obj)

        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        }; 
        
    }

    async add(params) {

     
 
        const {ctx} = this;
       // params.id = uuid.v1()//.replace(/-/g,"");

        var arr=[]
        
        if (params.flow_id) {
             params.flow_id.forEach((b) => {
                var a = b.value
                 arr.push({
                     id: uuid.v1(),
                     user_id: ctx.user.user_id,
                     total_nominated_quantity_from_m: params.total_nominated_quantity_from_m,
                     total_nominated_quantity_to_m: params.total_nominated_quantity_to_m,
                     total_nominated_quantity_from_b: params.total_nominated_quantity_from_b,
                     total_nominated_quantity_to_b: params.total_nominated_quantity_to_b,
                    size_of_vessel_from: params.size_of_vessel_from,
                    size_of_vessel_to: params.size_of_vessel_to,
                     flow_id: a,
                     type: a =='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'?2:0,
                    email: params.email,
                     send_email_select: params.send_email_select ? params.send_email_select.join(','):null,
                    'amber_hours': params[a + '_amber_hours'],
                    'amber_mins': params[a + '_amber_mins'],
                    'red_hours': params[a + '_red_hours'],
                    'red_mins': params[a + '_red_mins']
                })

            })
        }
        if (params.events) {
              params.events.forEach((b,index) => {
                  var a = b
                arr.push( {
                    id: uuid.v1(),
                    user_id: ctx.user.user_id,
                    total_nominated_quantity_from_m: params.total_nominated_quantity_from_m,
                    total_nominated_quantity_to_m: params.total_nominated_quantity_to_m,
                    total_nominated_quantity_from_b: params.total_nominated_quantity_from_b,
                    total_nominated_quantity_to_b: params.total_nominated_quantity_to_b,
                    size_of_vessel_from: params.size_of_vessel_from,
                    size_of_vessel_to: params.size_of_vessel_to,
                    flow_id: params[a + '_from'],
                    flow_id_to: params[a + '_to'],
                    email: params.email,
                    type: 1,
                    send_email_select: params.send_email_select ? params.send_email_select.join(',') : null,
                    'amber_hours': params[a + '_amber_hours'],
                    'amber_mins': params[a + '_amber_mins'],
                    'red_hours': params[a + '_red_hours'],
                    'red_mins': params[a + '_red_mins']
                })

            })
        }

      
        const res = await ctx.model.Alertrule.bulkCreate(arr);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
        

        
        
    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.Alertrule.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;
        
    }
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Alertrule.findByPk(params.id);

        if (!user) {
          ctx.status = 404;
            ctx.body = { success: false, errorCode:1000};
          return;
        }
        if (params.send_email_select) {
            params.send_email_select = params.send_email_select.join(',')
        }
        
        const res = await user.update(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success:false,errorCode:1000};
        }
       
    }
    
}

module.exports = AlertruleService;

