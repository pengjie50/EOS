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



}

module.exports = OperlogController;