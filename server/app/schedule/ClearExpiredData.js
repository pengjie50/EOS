const Subscription = require('egg').Subscription;
const uuid = require('uuid');

const moment = require('moment')



class ClearExpiredData extends Subscription {

    static get schedule() {
        return {
            interval: '10s',
            type: 'worker',
        };
    }






    async subscribe() {
       
        const { ctx, service, app } = this;

        var pDate = new Date((new Date()).getTime() - 3600 * 24 * 30 * 1000)
        var res = await ctx.model.Transaction.findOne({
            where: {
                created_at: { [app.Sequelize.Op.lt]: pDate },
                work_order_items_check: { [app.Sequelize.Op.ne]: null }
            }
        })

        
        if (res) {
            await ctx.model.Transactioneventlog.destroy({
                where: {
                    transaction_id: res.id
                }
            })
            await ctx.model.Transactionevent.destroy({
                where: {
                    transaction_id: res.id
                }
            })

            await ctx.model.Transaction.destroy({
                where: {
                    id: res.id
                }
            })
        }
        
        await ctx.model.Interfacedata.destroy({
            where: {
                created_at: { [app.Sequelize.Op.lt]: pDate }
            }
        })
        

    }
}





module.exports = ClearExpiredData;