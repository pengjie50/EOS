'use strict';

const Controller = require('./base_controller');



const createRule = {

};


class SystemController extends Controller {

    async fieldUniquenessCheck() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.system.fieldUniquenessCheck(params);

    }

    async fieldSelectData() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.system.fieldSelectData(params);

    }


    async receiveSGTradexData() {


        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.system.receiveSGTradexData(params);

    }




}

module.exports = SystemController;
