'use strict';

const Controller = require('./base_controller');



const createRule = {

};


class RoleController extends Controller {
  
  async list() {
    const {ctx, service,app} = this;
    const params = ctx.request.body;
    const res = await service.role.list(params);

    }

   
    
  async info() {
    const {ctx, service,app} = this;
    const params = {id:ctx.role.role_id};
    const res = await service.role.findOne(params);
      this.addOperlog()
  }

  async add() {
    const {ctx, service} = this;
    var params = ctx.request.body;
    
      params.accessible_organization = params.accessible_organization.join(",")
      params.accessible_timestamp = params.accessible_timestamp.join(",")
      params.accessible_feature = params.accessible_feature.join(",")
    const result = await service.role.add(params);
      this.addOperlog()
  }
  
  async mod() {
    const {ctx, service} = this;
      const params = ctx.request.body;
      params.accessible_organization = params.accessible_organization.join(",")
      params.accessible_timestamp = params.accessible_timestamp.join(",")
      params.accessible_feature = params.accessible_feature.join(",")
      const result = await service.role.mod(params);
      this.addOperlog()
  }

  async del() {
    const {ctx, service} = this;
    const params = ctx.request.body;
      const result = await service.role.del(params);
      this.addOperlog()
    
  }

}

module.exports = RoleController;
