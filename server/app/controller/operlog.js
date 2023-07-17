'use strict';

const Controller = require('egg').Controller;



const createRule = {

};


class OperlogController extends Controller {

    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.operlog.list(params);

    }

    async mod() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.operlog.mod(params);
        
    }

}

module.exports = OperlogController;