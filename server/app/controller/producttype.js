'use strict';

const Controller = require('./base_controller');



const createRule = {

};


class ProducttypeController extends Controller {
  
  async list() {
    const {ctx, service,app} = this;
    const params = ctx.request.body;
    const res = await service.producttype.list(params);

  }

  async info() {
    const {ctx, service,app} = this;
    const params = {id:ctx.producttype.producttype_id};
    const res = await service.producttype.findOne(params);

  }

  async add() {
    const {ctx, service} = this;
    var params = ctx.request.body;
    console.log(params)
    const result = await service.producttype.add(params);
      this.addOperlog()
  }
  
  async mod() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.producttype.mod(params);
      this.addOperlog()
  }

  async del() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.producttype.del(params);
      this.addOperlog()
    
  }

}

module.exports = ProducttypeController;
