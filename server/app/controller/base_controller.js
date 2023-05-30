'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid');



class BaseController extends Controller {
  
  

  async addOperlog() {
    const {ctx, service} = this;
      var params = ctx.request.body;
      var operlog = {}
      
      operlog.ip = ctx.request.ip
      operlog.url = ctx.request.url
      operlog.param = JSON.stringify(params)
      operlog.result = JSON.stringify(ctx.body)
      if (!ctx.body.success) {
          operlog.status = 1
          operlog.err_code = ctx.body.errorCode
          
      }

      var arr = operlog.url.split("/")
      operlog.module = arr[2]
      operlog.action = arr[3]
      operlog.request_method = ctx.request.method
      operlog.username = ctx.user.username
      operlog.user_id = ctx.user.user_id
      operlog.oper_time = new Date()
      console.log(operlog)
      const result = await service.operlog.add(operlog);
   
  }
  
  

}

module.exports = BaseController;
