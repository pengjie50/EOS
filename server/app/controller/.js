'use strict';

const Controller = require('./base_controller');



const createRule = {

};


class JettyController extends Controller {
  
  async list() {
    const {ctx, service,app} = this;
    const params = ctx.request.body;
    const res = await service.jetty.list(params);

  }

  async info() {
    const {ctx, service,app} = this;
    const params = {id:ctx.jetty.jetty_id};
    const res = await service.jetty.findOne(params);

  }

  async add() {
    const {ctx, service} = this;
    var params = ctx.request.body;
    console.log(params)
    const result = await service.jetty.add(params);
      this.addOperlog()
  }
  
  async mod() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.jetty.mod(params);
      this.addOperlog()
  }

  async del() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.jetty.del(params);
      this.addOperlog()
    
  }

}

module.exports = JettyController;
