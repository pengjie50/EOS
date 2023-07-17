'use strict';

const Controller = require('./base_controller');

const createRule = {

};


class TerminalController extends Controller {

    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.terminal.list(params);

    }

    async info() {
        const { ctx, service, app } = this;
        const params = { id: ctx.terminal.terminal_id };
        const res = await service.terminal.findOne(params);

    }

    async add() {
        const { ctx, service } = this;
        var params = ctx.request.body;
        const result = await service.terminal.add(params);
        this.addOperlog()
    }

    async mod() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.terminal.mod(params);
        this.addOperlog()
    }

    async del() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const result = await service.terminal.del(params);
        this.addOperlog()

    }

}

module.exports = TerminalController;
