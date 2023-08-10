'use strict';

const Controller = require('./base_controller');

const createRule = {

};

class TransactionController extends Controller {

    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.transaction.list(params);

    }

    async info() {
        const { ctx, service, app } = this;
        const params = { id: ctx.transation.transation_id };
        const res = await service.transaction.findOne(params);

    }

    async add() {
        const { ctx, service } = this;
        var params = ctx.request.body;
       
        const result = await service.transaction.add(params);
        this.addOperlog()
    }
    async statistics() {
        const { ctx, service, app } = this;
        var params = ctx.request.body;
        const res = await service.transaction.statistics(params);

    }

    async mod() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.transaction.mod(params);
        this.addOperlog()
    }
    async writetoBC() {
        const { ctx, service } = this;
        ctx.activity_duration_start = new Date
        const params = ctx.request.body;
        const result = await service.transaction.writetoBC(params);
        this.addAPILog(result)
    }
    async validateBC() {
        const { ctx, service } = this;
        ctx.activity_duration_start = new Date
        const params = ctx.request.body;
        const result = await service.transaction.validateBC(params);

        this.addAPILog(result)
       
    }
    async del() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.transaction.del(params);
        this.addOperlog()

    }

}

module.exports = TransactionController;
