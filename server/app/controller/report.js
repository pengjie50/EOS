'use strict';

const Controller = require('./base_controller');



const createRule = {

};


class ReportController extends Controller {
  
  async list() {
    const {ctx, service,app} = this;
    const params = ctx.request.body;
    const res = await service.report.list(params);

    }

   
    
  async info() {
    const {ctx, service,app} = this;
    const params = {id:ctx.report.report_id};
    const res = await service.report.findOne(params);
      this.addOperlog()
  }

  async add() {
    const {ctx, service} = this;
    var params = ctx.request.body;
    console.log(params)
    const result = await service.report.add(params);
      this.addOperlog()
  }
  
  async mod() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.report.mod(params);
      this.addOperlog()
  }

  async del() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.report.del(params);
      this.addOperlog()
    
  }

}

module.exports = ReportController;
