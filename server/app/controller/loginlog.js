'use strict';

const Controller = require('egg').Controller;



const createRule = {

};


class LoginlogController extends Controller {
  
  async list() {
    const {ctx, service,app} = this;
    const params = ctx.request.body;
    const res = await service.loginlog.list(params);

  }

  

}

module.exports = LoginlogController;
