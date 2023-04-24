'use strict';

const Controller = require('./base_controller');



const createRule = {

};


class FlowController extends Controller {
  
  async list() {
    const {ctx, service,app} = this;
    const params = ctx.request.body;
    const res = await service.flow.list(params);

  }

  async info() {
    const {ctx, service,app} = this;
    const params = {id:ctx.flow.flow_id};
    const res = await service.flow.findOne(params);

  }

  async add() {
    const {ctx, service} = this;
    var params = ctx.request.body;
    console.log(params)
    const result = await service.flow.add(params);
      this.addOperlog()
  }
  
  async mod() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.flow.mod(params);
      this.addOperlog()
  }

  async del() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.flow.del(params);
      this.addOperlog()
    
  }

}

module.exports = FlowController;
