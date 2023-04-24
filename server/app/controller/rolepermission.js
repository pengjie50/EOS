'use strict';

const Controller = require('egg').Controller;

class RolepermissionController extends Controller {
  

  async list() {
    const {ctx, service,app} = this;
    const params = ctx.request.body;
    const res = await service.rolepermission.list(params);
  }

  async add() {
    const {ctx, service} = this;
    const params = ctx.request.body;
    const result = await service.rolepermission.add(params);
  }

  async del() {
    const {ctx, service} = this;
    const params = ctx.request.body;
    const result = await service.rolepermission.del(params);
  }

  
}

module.exports = RolepermissionController;
