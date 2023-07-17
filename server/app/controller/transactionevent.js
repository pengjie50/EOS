'use strict';

const Controller = require('egg').Controller;

class TransactioneventController extends Controller {


    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.transactionevent.list(params);
    }

    async add() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.transactionevent.add(params);
    }
    async mod() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.transactionevent.mod(params);

    }
    async del() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.transactionevent.del(params);
    }


}

module.exports = TransactioneventController;
