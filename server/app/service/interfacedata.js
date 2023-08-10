/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;
const uuid = require('uuid');


class InterfacedataService extends Service {

    async findOne(params) {
        const ctx = this.ctx;
        var res = await ctx.model.Interfacedata.findByPk(params.id);
        ctx.body = { success: true, data: res }
    }
    async list(params) {
        const { ctx, app, service } = this;

        let obj = {}

        if (params.where) {
            obj.where = params.where
        } else {
            obj.where = {}
        }
        if (params.order) {
            obj.order = params.order
        }
        if (params.page && params.limit) {
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }

        const list = await ctx.model.Interfacedata.findAndCountAll(obj)
        var eos_id = []




        /*service.tool.sendMail("504475705@qq.com", "222222", "eeeeee")


       var all= await ctx.model.AlertruleTransaction.findAll()

       

        var step2 = 0
        async function Do2() {
            if (step2 >= all.length) {
                return
            }
            var bb=all[step2]
            if (bb.product_quantity_in_mt_from) {
                await bb.update({ product_quantity_from: bb.product_quantity_in_mt_from, product_quantity_to: bb.product_quantity_in_mt_to,uom:"mt" })
            }

            if (bb.product_quantity_in_bls_60_f_from) {
                await bb.update({ product_quantity_from: bb.product_quantity_in_bls_60_f_from, product_quantity_to: bb.product_quantity_in_bls_60_f_to, uom: "bls_60_f" })
            }
            
            step2++
            await Do2()
        }
        await Do2()*/

        list.rows.forEach((t) => {
           
            eos_id.push(t.eos_id)
        })

        const transactionList = await ctx.model.Transaction.findAll({ raw: true, where: { eos_id: eos_id } })
        var tMap = {}
        transactionList.forEach((c) => {
            tMap[c.eos_id] = c
        })

        list.rows = list.rows.map((t) => {
            t.transaction_id = tMap[t.eos_id]?.id || null
          
            return t
        })
        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        };

    }

    async add(params) {



        const { ctx } = this;

        if (params.batch_data) {

            const res = await ctx.model.Interfacedata.bulkCreate(params.batch_data);
            ctx.body = { success: true, data: res };
            return

        }





        if (!params.terminal_id) {
            params.terminal_id = ctx.user.company_id
        }
        params.company_id = ctx.user.company_id
        const res = await ctx.model.Interfacedata.create(params);
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }




    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.Interfacedata.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;

    }
    async mod(params) {

        const ctx = this.ctx;
        const user = await ctx.model.Interfacedata.findByPk(params.id);

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

module.exports = InterfacedataService;

