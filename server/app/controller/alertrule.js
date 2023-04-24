'use strict';

const Controller = require('./base_controller');



const createRule = {

};


class AlertruleController extends Controller {
  
  async list() {
    const {ctx, service,app} = this;
    const params = ctx.request.body;
    const res = await service.alertrule.list(params);

  }

  async info() {
    const {ctx, service,app} = this;
      const params = { id: ctx.alert.alertrule_id};
      const res = await service.alertrule.findOne(params);

  }

  async add() {
    const {ctx, service} = this;
    var params = ctx.request.body;
    console.log(params)
      const result = await service.alertrule.add(params);
      this.addOperlog()
  }
  
  async mod() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.alertrule.mod(params);
      this.addOperlog()
  }

  async del() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.alertrule.del(params);
      this.addOperlog()
    
  }

}

module.exports = AlertruleController;
