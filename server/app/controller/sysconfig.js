'use strict';
const Controller = require("./base_controller");
const createRule = {

};
class SysconfigController extends Controller {

    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.sysconfig.list(params);

    }

    async info() {
        const { ctx, service, app } = this;
        const params = { id: ctx.permission.permission_id };
        const res = await service.sysconfig.findOne(params);

    }

    async add() {
        const { ctx, service } = this;
        var params = ctx.request.body;

        const result = await service.sysconfig.add(params);
        this.addOperlog()
    }

    async mod() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.sysconfig.mod(params);
        this.addOperlog()
    }

    async del() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.sysconfig.del(params);
        this.addOperlog()

    }

}

module.exports = SysconfigController;
