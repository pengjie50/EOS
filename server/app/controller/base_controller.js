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

      } else {
          operlog.status = 0
      }

      var arr = operlog.url.split("/")
      operlog.module = arr[2]
      operlog.action = arr[3]
      operlog.request_method = ctx.request.method
      var os = function () {
          var ua = ctx.request.header['user-agent'],
              isWindowsPhone = /(?:Windows Phone)/.test(ua),
              isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
              isAndroid = /(?:Android)/.test(ua),
              isFireFox = /(?:Firefox)/.test(ua),
              isChrome = /(?:Chrome|CriOS)/.test(ua),
              isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
              isPhone = /(?:iPhone)/.test(ua) && !isTablet,
              isPc = !isPhone && !isAndroid && !isSymbian;
          return {
              isTablet: isTablet,
              isPhone: isPhone,
              isAndroid: isAndroid,
              isPc: isPc
          };
      }();

      if (os.isAndroid || os.isPhone) {
          operlog.device_type = 'Mobile'
          
      } else if (os.isTablet) {
          operlog.device_type = 'Laptop'
         
      } else if (os.isPc) {
          operlog.device_type = 'PC'
         
      }
      
      operlog.company_id = ctx.user.company_id
      operlog.user_id = ctx.user.user_id
      if (ctx.user.role_type == "Super") {
          operlog.type = 1
      } else {
          operlog.type =2
      }
      operlog.oper_time = new Date()
      console.log(operlog)
      const result = await service.operlog.add(operlog);
   
  }
  
    async addAPILog(params) {
        const { ctx, service } = this;
      
        var operlog = {}
        operlog.request_method = params.method
       // operlog.ip = ctx.request.ip
        operlog.url = params.url
        operlog.param = JSON.stringify(params.data)
       operlog.result = JSON.stringify(params.result)
        
        operlog.status = params.status
        operlog.err_code = params.errorCode

        

        operlog.device_type = "PC"
       
        operlog.type = 3
        operlog.oper_time = new Date()
        console.log("ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd")
        const result = await service.operlog.add(operlog);

    }

}

module.exports = BaseController;
