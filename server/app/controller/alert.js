'use strict';

const Controller = require('./base_controller');



const createRule = {

};


class AlertController extends Controller {
  
  async list() {
    const {ctx, service,app} = this;
    const params = ctx.request.body;
    const res = await service.alert.list(params);

    }

    async getUserUnreadAlertCount() {
        const { ctx, service, app } = this;
        const params = ctx.request.body;
        const res = await service.alert.getUserUnreadAlertCount(params);

    }
    
  async info() {
    const {ctx, service,app} = this;
    const params = {id:ctx.alert.alert_id};
    const res = await service.alert.findOne(params);

  }

  async add() {
    const {ctx, service} = this;
    var params = ctx.request.body;
    console.log(params)
    const result = await service.alert.add(params);
      this.addOperlog()
  }
  
    async mod() {

      
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.alert.mod(params);
      this.addOperlog()
  }

  async del() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.alert.del(params);
      this.addOperlog()
    
  }

}

module.exports = AlertController;
