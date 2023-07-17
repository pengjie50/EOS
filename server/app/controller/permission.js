'use strict';
const Controller = require('./base_controller');

const createRule = {

};

class PermissionController extends Controller {

    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.permission.list(params);

    }

    async info() {
        const { ctx, service, app } = this;
        const params = { id: ctx.permission.permission_id };
        const res = await service.permission.findOne(params);

    }

    async add() {
        const { ctx, service } = this;
        var params = ctx.request.body;

        const result = await service.permission.add(params);
        this.addOperlog()
    }

    async mod() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.permission.mod(params);
        this.addOperlog()
    }

    async del() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.permission.del(params);
        this.addOperlog()

    }

}

module.exports = PermissionController;
