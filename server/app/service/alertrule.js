/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('./base_service');
const uuid = require('uuid');


class AlertruleService extends Service {

    async findOne(params) {
        const ctx = this.ctx;
        var res = await ctx.model.Alertrule.findByPk(params.id);
        ctx.body = { success: true, data: res }
    }
    async list(params) {
        const { ctx, app } = this;

        let obj = {}

        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }
        if (params.order) {
            obj.order = params.order
        }

        if (ctx.user.role_type != "Super") {
            var Op = app.Sequelize.Op

           
            obj.where[Op.or] = [
                
                {
                    type: { [Op.ne]: 1 },
                    flow_id: { [Op.in]: [ctx.user.accessible_timestamp, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] },
                    flow_id_to: { [Op.eq]: null }
                },
                {
                    type: { [Op.eq]: 1 },
                    flow_id: { [Op.in]: ctx.user.accessible_timestamp },
                    flow_id_to: { [Op.in]: ctx.user.accessible_timestamp }
                }
            ]


        }

       

        

        if (ctx.user.role_type == 'Super') {
            if (obj.where.organization_id) {
                obj.where.company_id = obj.where.organization_id
            }


        } else {

            if (this.access("alertrule_list") || this.access("transactions_list")) {

                obj.where.user_id = ctx.user.user_id

                if (this.access("alertrule_list_company") || this.access("transactions_list_company")) {
                    delete obj.where.user_id
                    obj.where.company_id = ctx.user.company_id
                }

                if (this.access("alertrule_list_tab") || this.access("transactions_list_tab")) {
                    if (obj.where.tab) {
                        if (obj.where.tab[app.Sequelize.Op.eq] == 'Self') {




                        } if (obj.where.tab[app.Sequelize.Op.eq] == 'Others') {
                            delete obj.where.user_id
                            if (!obj.where.organization_id) {

                                obj.where.company_id = {
                                    [app.Sequelize.Op['in']]: ctx.user.accessible_organization.filter((a) => {
                                        return a != ctx.user.company_id
                                    })
                                }
                            } else {

                                obj.where.company_id = obj.where.organization_id
                            }

                        } else if (obj.where.tab[app.Sequelize.Op.eq] == 'All') {
                            delete obj.where.user_id
                            obj.where.company_id = {
                                [app.Sequelize.Op['in']]: [...ctx.user.accessible_organization, ctx.user.company_id]
                            }
                        }

                    }
                }
            }



        }

        
        delete obj.where.organization_id
        delete obj.where.tab


        if (params.page && params.limit) {
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
        var alertrule = ctx.model.Alertrule
        var list = {}


       
        if (obj.where && obj.where.transaction_id) {

           

           // console.log(s)
            var flowList = await ctx.model.Flow.findAll({ order: [['sort', 'asc']], raw: true })
            var flowMap = {}
            flowList = flowList.map((f, index) => {


                f.next = flowList[index] ? flowList[index] : null
                flowMap[f.id] = f
                return f

            })

           
            var transaction = await ctx.model.Transaction.findOne({ where: { id: obj.where.transaction_id } })

            var transactioneventList = await ctx.model.Transactionevent.findAll({ raw: true, where: { transaction_id: obj.where.transaction_id }, sorter: { event_time: 'asc' } })

            obj.raw = true
            var alertruleTransaction = await ctx.model.AlertruleTransaction.findAll(obj)
            var obj3 = { ...obj }
           
            delete obj3.where.transaction_id
            var alertruleList = await ctx.model.Alertrule.findAll(obj3 )

            alertruleList = alertruleList.filter((ar) => {


                if (ar.company_id != transaction.trader_id && ar.company_id != transaction.terminal_id) {

                    return false
                }
                var t1 = false
                if ((ar.vessel_size_dwt_from == null && ar.vessel_size_dwt_to == null)
                    || (ar.vessel_size_dwt_from <= transaction.vessel_size_dwt && transaction.vessel_size_dwt < ar.vessel_size_dwt_to)) {

                    t1 = true
                }
                var t2 = false
                if (ar.product_quantity_from == null && ar.product_quantity_to == null) {

                    t2 = true
                } else {

                    if (ar.product_quantity_from <= transaction["product_quantity_in_" + ar.uom] && transaction["product_quantity_in_" + ar.uom] < ar.product_quantity_to) {
                        t2 = true

                    }
                } 
               

                if (t1 && t2) {


                    return ar


                } else {
                    return false
                }


            })

            
            var alertruleList0=[]
           

            alertruleList.forEach((a) => {
                var iss=false
                alertruleTransaction.forEach((b) => {
                    if (a.id == b.alert_rule_id) {
                        iss=true
                        alertruleList0.push(b)
                    }
               })
                if (!iss) {
                    
                    alertruleList0.push(a)
                }
               
               
            })


            if (transaction.status == 0) {
                
                list.rows = alertruleList0
            } else {
                list.rows = alertruleTransaction
            }
            
          
            list.count = list.rows.length
        } else {


            obj.attributes = [[ctx.model.col('u.username'), 'username'], [ctx.model.col('c.name'), 'company_name'], 'alert_rule.*']
            obj.include = [{
                as: 'u',
                attributes: [],
                model: ctx.model.User

            }, {
                as: 'c',
                attributes: [],
                model: ctx.model.Company

            }]
            obj.raw = true


           
            
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



        const { ctx } = this;
        // params.id = uuid.v1()//.replace(/-/g,"");

        var arr = []

        if (params.typeArr) {
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
                        var arr2 = [params[k]]
                        if (v) {


                            arr2 = arr2.concat(v)
                        }


                        email.push(arr2.join(','))
                    }

                }
            }


            params.typeArr.forEach((b) => {
                var a = b

                if (params[a + '_type'] == '2') {
                    params[a + '_flow_id'] = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
                }
                arr.push({
                    company_id: params.company_id || ctx.user.company_id,
                    user_id: ctx.user.user_id,
                    product_quantity_from: params.product_quantity_from,
                    product_quantity_to: params.product_quantity_to,
                    uom: params.uom,
                    
                    vessel_size_dwt_from: params.vessel_size_dwt_from,
                    vessel_size_dwt_to: params.vessel_size_dwt_to,
                    flow_id: params[a + '_type'] == '1' ? params[a + '_from'] : params[a + '_flow_id'],
                    flow_id_to: params[a + '_type'] == '1' ? params[a + '_to'] : null,



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
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }




    }

    async del(params) {

        const { ctx, service } = this;

        var ar =await ctx.model.Alertrule.findOne({
            where: {
                id: params.id
            }
        })
        
        var alertruleTransactionList= await ctx.model.AlertruleTransaction.findAll({

            include:[{
                as: 't',
                model: ctx.model.Transaction,
                where: {status:0}
            }],
            where: {
                alert_rule_id: params.id
            }
        })

        var AlertruleTransactionIds =alertruleTransactionList.map((b) => {
            return b.id
        })

       

       

        var AlertList = await ctx.model.Alert.findAll({ where: { alert_rule_transaction_id: AlertruleTransactionIds } })

        var AlertIds = AlertList.map((b) => {
            return b.id
        })
        

        var flowList = await ctx.model.Flow.findAll({ raw: true, order: [['sort', 'asc']] })
        var flowMap = {}

      


        flowList = flowList.map((f, index) => {
            f.next = flowList[index] ? flowList[index] : null
            flowMap[f.id] = f
            return f
        })

        var step3 = 0
        async function Do3() {


            if (step3 >= AlertList.length) {


                return
            }
            var alert = AlertList[step3]

            var transaction = await ctx.model.Transaction.findOne({ where: { id: alert.transaction_id } })


            var title = service.tool.createClearTitle(alert, ar, transaction, flowMap)
            var content = service.tool.createClearContent(alert, ar, transaction, flowMap)

           
            if (ar.email) {
                try {
                    var emailArr = ar.email.split(";")
                    var sendEmail = []
                    emailArr.forEach((c) => {
                        var v = c.split(',')
                        if (v.some((f) => {
                            return f == (alert.type == 0 ? 'a' : 'r')

                        })) {
                            sendEmail.push(v[0])
                        }


                    })
                    if (sendEmail.length > 0) {
                        
                       await service.tool.sendMail(sendEmail.join(","), title, content)
                    }


                } catch (e) {

                }

            }




            step3++
            await Do3()

        }
        await Do3()
       
        var res = await ctx.model.Alert.destroy({
            where: {
                id: AlertIds
            }
        })
        res = await ctx.model.AlertruleTransaction.destroy({
            where: {
                id: AlertruleTransactionIds
            }
        })
        res = await ctx.model.Alertrule.destroy({
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
            ctx.body = { success: false, errorCode: 1000 };
            return;
        }


        if (params.type == '2') {
            params.flow_id = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
            params.flow_id_to = null
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


                        arr = arr.concat(v)
                    }


                    email.push(arr.join(','))
                }

            }
        }

        params.email = email.join(';')



        const res = await user.update(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }

    }

}

module.exports = AlertruleService;

