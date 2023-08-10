'use strict';

const Controller = require('./base_controller');



const createRule = {
    password: 'string',
    username: 'string'

};


class UserController extends Controller {
    async login() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        ctx.validate(createRule, params);
        const res = await service.user.login(params);


    }
    async checkEmail() {
        const { ctx, service } = this;

        const params = ctx.request.body;
        await service.user.checkEmail(params.email);
        


    }

    async modifyPassword() {
        const { ctx, service } = this;

        const params = ctx.request.body;
        await service.user.modifyPassword(params);
        


    }
    async retrievePassword() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const res = await service.user.retrievePassword(params);
        ctx.body = { success: true }
        
    }
    async logout() {
        const { ctx, service } = this;
        const params = ctx.request.body;
        const res = await service.user.logout(params);
        ctx.body = { success: true }
       
    }
    async list() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.user.list(params);

    }
    async count() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.user.count(params);

    }
    async info() {
        const { ctx, service, app } = this;
        const params = { id: ctx.user?.user_id };
        if (ctx.user?.user_id) {
            const res = await service.user.findOne(params);
        } else {
            ctx.body = {
                success: true
               

            }; 

        }
        

    }

    async add() {
        const { ctx, service } = this;
        var params = ctx.request.body;
        
        const result = await service.user.add(params);
        this.addOperlog()

    }

    async mod() {
        const { ctx, service } = this;

        const params = ctx.request.body;
        await service.user.mod(params);
        this.addOperlog()


    }

    async acceptInvitation() {
        const { ctx, service } = this;

        const params = ctx.request.query;
        await service.user.acceptInvitation(params);
        this.addOperlog()


    }


    async del() {
        const { ctx, service } = this;

        const params = ctx.request.body;
        const result = await service.user.del(params);

        this.addOperlog()

    }

}

module.exports = UserController;
