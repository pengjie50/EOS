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
        const {ctx,app} = this;
        
        let obj={}  

        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }
        if(params.order){
            obj.order = params.order
        }

       
       
           if (ctx.user.role_type == 'Super') {
               if (obj.where.organization_id) {
                   obj.where.company_id = obj.where.organization_id
               }

                
            } else if (ctx.user.role_type == 'Trader') {

                
            } else if (ctx.user.role_type == 'Terminal') {

                if (obj.where.tab) {
                    if (obj.where.tab[app.Sequelize.Op.like] == '%Trader%') {
                        if (!obj.where.organization_id) {
                            obj.where.company_id = {
                                [app.Sequelize.Op['in']]: ctx.user.accessible_organization
                            }
                        } else {
                            obj.where.company_id = obj.where.organization_id
                        }

                    } else if (obj.where.tab[app.Sequelize.Op.like] == '%All%') {
                        obj.where.company_id = {
                            [app.Sequelize.Op['in']]: [...ctx.user.accessible_organization, ctx.user.company_id]
                        }
                    }

                }
               
            }
           delete obj.where.organization_id
           delete obj.where.tab
        
        
        if(params.page && params.limit){
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
        var alertrule = ctx.model.Alertrule
        var list = {}
        if (obj.where && obj.where.transaction_id) {
            var flowList = await ctx.model.Flow.findAll({ order: [['sort', 'asc']], raw: true})
            var flowMap = {}
            flowList = flowList.map((f, index) => {

                console.log(flowList.length)
                f.next = flowList[index] ? flowList[index] : null
                flowMap[f.id] = f
                return f

            })

           
            var transaction = await ctx.model.Transaction.findOne({ where: { id: obj.where.transaction_id } })
           
            var transactioneventList = await ctx.model.Transactionevent.findAll({  raw: true,where: { transaction_id: obj.where.transaction_id }, sorter: { event_time: 'asc' } })

            var alertruleList = await ctx.model.Alertrule.findAll({ where: { user_id: ctx.user.user_id }, raw: true })
              
            alertruleList = alertruleList.filter((ar) => {


                    if (ar.company_id != transaction.trader_id && ar.company_id != transaction.terminal_id) {
                    
                        return false
                    }
                    var t1 = false
                    if ((ar.size_of_vessel_from == null && ar.size_of_vessel_to == null)
                        || (ar.size_of_vessel_from <= transaction.size_of_vessel && transaction.size_of_vessel < ar.size_of_vessel_to)) {

                        t1 = true
                    }

                    var t2 = false
                    if (ar.total_nominated_quantity_from_m == null && ar.total_nominated_quantity_to_m == null && ar.total_nominated_quantity_from_b == null && ar.total_nominated_quantity_to_b == null) {

                        t2 = true
                    } else if (ar.total_nominated_quantity_from_b == null && ar.total_nominated_quantity_to_b == null) {

                        if (ar.total_nominated_quantity_from_m <= transaction.total_nominated_quantity_m && transaction.total_nominated_quantity_m < ar.total_nominated_quantity_to_m) {
                            t2 = true

                        }
                    } else if (ar.total_nominated_quantity_from_m == null && ar.total_nominated_quantity_to_m == null) {

                        if (ar.total_nominated_quantity_from_b <= transaction.total_nominated_quantity_b && transaction.total_nominated_quantity_b < ar.total_nominated_quantity_to_b) {
                            t2 = true

                        }
                    }

                    if (t1 && t2) {
                      
                        if (transactioneventList.length==0) {
                            return ar
                        }
                        var lastEvent = transactioneventList[transactioneventList.length - 1]
                        
                        if (ar.type == 0) {

                           

                           
                           
                            if (flowMap[lastEvent.flow_id].sort < flowMap[ar.flow_id].sort) {
                                    return ar
                             }
                            

                            
                        } else if (ar.type == 1) {
                            
                            if (flowMap[lastEvent.flow_id].sort <= flowMap[ar.flow_id_to].sort && flowMap[lastEvent.flow_id].sort >= flowMap[ar.flow_id].sort) {
                                return ar
                            }
                        } else if (ar.type == 2) {

                            if (flowMap[lastEvent.flow_id].sort <= 64) {
                                return ar
                            }
                        }

                    }


                })





            


            var alertruleTransaction = await ctx.model.AlertruleTransaction.findAll(obj)

            alertruleList=alertruleList.filter((a) => {
                return !alertruleTransaction.find((b) => {
                  return  a.id==b.alert_rule_id
                })
            })

           
            list.rows = alertruleTransaction.concat(alertruleList)
            list.count = list.rows.length
        } else {


            obj.attributes = [[ctx.model.col('u.username'), 'username'], 'alert_rule.*']
            obj.include= [{
                as: 'u',
                model: ctx.model.User

            }]
            obj.raw= true
             list = await alertrule.findAndCountAll(obj)
        }



        

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
        
        if (params.typeArr) {
            var email = []

            var map = {}
            for (var k in params) {
                if (k.indexOf("_send_type_select") > -1) {

                   
                    map[k.split("_")[0]] = params[k]

                }
            }

          
            for(var k in params) {
                if (k.indexOf("_email") > -1) {
                    if (params[k]) {
                        var v = map[k.split("_")[0]]
                        var arr2 = [params[k]]
                        if (v) {

                            console.log(v)
                            arr2 = arr2.concat(v)
                        }
                       
                       
                        email.push(arr2.join(','))
                    }
                    
                }
            }

           
            params.typeArr.forEach((b) => {
                var a = b

                if (params[a + '_type'] =='2') {
                    params[a + '_flow_id']= 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
                }
                 arr.push({
                     company_id: params.company_id || ctx.user.company_id,
                     user_id: ctx.user.user_id,
                     total_nominated_quantity_from_m: params.total_nominated_quantity_from_m,
                     total_nominated_quantity_to_m: params.total_nominated_quantity_to_m,
                     total_nominated_quantity_from_b: params.total_nominated_quantity_from_b,
                     total_nominated_quantity_to_b: params.total_nominated_quantity_to_b,
                     size_of_vessel_from: params.size_of_vessel_from,
                     size_of_vessel_to: params.size_of_vessel_to,
                     flow_id: params[a + '_type'] == '1'?params[a + '_from']:params[a + '_flow_id'],
                     flow_id_to: params[a + '_type'] == '1'?params[a + '_to']:null,

                     

                     type: params[a + '_type'],
                     email: email.join(';'),
                   //  send_email_select: params.send_email_select ? params.send_email_select.join(','):null,
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
      

        if (params.type =='2') {
            params.flow_id = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
            params.flow_id_to=null
        }


        if (params.type == '0') {
           
            params.flow_id_to = null
        }
            var email = []

            var map = {}
            for (var k in params) {
                if (k.indexOf("_send_type_select") > -1) {


                    map[k.split("_")[0]] = params[k]

                }
            }

            for (var k in params) {
                if (k.indexOf("_email") > -1) {
                    if (params[k]) {
                        var v = map[k.split("_")[0]]
                        var arr = [params[k]]
                        if (v) {

                            console.log(v)
                            arr = arr.concat(v)
                        }


                        email.push(arr.join(','))
                    }

                }
            }

            params.email= email.join(';')

        
        
        const res = await user.update(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success:false,errorCode:1000};
        }
       
    }
    
}

module.exports = AlertruleService;

