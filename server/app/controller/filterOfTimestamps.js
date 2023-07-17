'use strict';

const Controller = require('./base_controller');

const createRule = {

};


class UserconfigController extends Controller {

    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.userconfig.list(params);

    }

    async info() {
        const { ctx, service, app } = this;
        const params = { id: ctx.userconfig.userconfig_id };
        const res = await service.userconfig.findOne(params);

    }

    async add() {
        const { ctx, service } = this;
        var params = ctx.request.body;
        params.user_id = ctx.user.user_id
        params.type = 0
        params.value = params.value.join(",")
        console.log(params)
        const result = await service.userconfig.add(params);
        this.addOperlog()
    }

    async mod() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        params.value = params.value.join(",")
        const result = await service.userconfig.mod(params);
        this.addOperlog()
    }

    async del() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.userconfig.del(params);
        this.addOperlog()

    }

}

module.exports = UserconfigController;
