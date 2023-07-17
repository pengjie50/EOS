'use strict';

const Controller = require('./base_controller');



const createRule = {

};


class InterfacedataController extends Controller {

    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.interfacedata.list(params);

    }

    async info() {
        const { ctx, service, app } = this;
        const params = { id: ctx.interfacedata.interfacedata_id };
        const res = await service.interfacedata.findOne(params);

    }

    async add() {
        const { ctx, service } = this;
        var params = ctx.request.body;
        const result = await service.interfacedata.add(params);
        this.addOperlog()
    }

    async mod() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.interfacedata.mod(params);
        this.addOperlog()
    }

    async del() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.interfacedata.del(params);
        this.addOperlog()

    }

}

module.exports = InterfacedataController;
