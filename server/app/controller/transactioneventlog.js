'use strict';

const Controller = require('egg').Controller;

class TransactioneventlogController extends Controller {


    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.transactioneventlog.list(params);
    }




}

module.exports = TransactioneventlogController;
