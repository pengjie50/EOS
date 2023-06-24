'use strict';

const Controller = require('./base_controller')



const createRule = {

};


class CompanyController extends Controller {
  
  async list() {
    const {ctx, service,app} = this;
      const params = ctx.request.body;
      
    const res = await service.company.list(params);

  }
  async organization() {
    const { ctx, service, app } = this;
    const params = ctx.request.body;

      const res = await service.company.organization(params);

  }

    
  async info() {
    const {ctx, service,app} = this;
    const params = {id:ctx.company.company_id};
    const res = await service.company.findOne(params);

  }

  async add() {
    const {ctx, service} = this;
    var params = ctx.request.body;
    console.log(params)
      const result = await service.company.add(params);
      this.addOperlog()
   
  }
  
  async mod() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.company.mod(params);
      this.addOperlog()
  }

  async del() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.company.del(params);
      this.addOperlog()
    
  }

}

module.exports = CompanyController;
