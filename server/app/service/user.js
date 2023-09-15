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
const where = require('../middleware/where');


class UserService extends Service {
    async login(params) {

        const { ctx, app, service } = this;


        /* const token2 = app.jwt.sign({
             key: "receiveSGTradexData",
             password:"receiveSGTradexData@123456"
           
         }, app.config.jwt.secret, {
             expiresIn: 3600*24*360*100// 3600*24  //过期时间设置为60
         });
 
         console.log("eeeeeeeeeeeeeee=============",token2)
         return*/

        var w = {
            username: params.username

        }

        if (params.superData && params.superData.tenantId == "62d7d031-32be-43c5-a823-5c96e03d395f") {

            let u = await ctx.model.User.findOne({
                where: {
                    username: params.superData.username
                }
            })

            if (!u) {
                const salt = uuid.v4();



                var r = await ctx.model.User.create({ role_id: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr", company_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", status: 0, username: params.superData.username, email: params.superData.username, password: salt + "&" + md5('zseosdmm@123456' + salt) })

            }
            params.username = params.superData.username
            params.password = 'zseosdmm@123456'

        } else {
            //非超级用户
            //w.role_id = { [Op.ne]: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr" }
        }



        var res = await ctx.model.User.findOne({
            where: w,
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

        const salt2 = uuid.v4();
        var password = salt2 + "&" + md5("123456" + salt2)


        var loginlog = {}
        loginlog.id = uuid.v4();

        loginlog.username = params.username

        loginlog.url = ctx.request.url
        var arr = ctx.request.header['user-agent'].split(" ")
        loginlog.browser = arr[arr.length - 2]
        loginlog.ip = ctx.request.ip
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
            loginlog.device_type = 'Mobile'

        } else if (os.isTablet) {
            loginlog.device_type = 'Laptop'

        } else if (os.isPc) {
            loginlog.device_type = 'PC'

        }

        loginlog.os = ctx.request.header['user-agent'].match(/\((.+?)\)/gi)[0].replace("(", "").replace(")", "")

        loginlog.login_time = new Date()
        if (!res) {
            loginlog.err_code = 1001

            loginlog.status = 1
            ctx.body = {
                success: false, errorCode: 1001, errorMessage: "there is no such user", showType: 2, data: {}
            }

            //service.loginlog.add(loginlog)
            return;
        }
        loginlog.company_id = res.company_id
        loginlog.status = 0

        loginlog.user_id = res.id


        loginlog.param = JSON.stringify(params)



        var login_lock = await ctx.service.sysconfig.getValueByKey("login_lock");

        var p = await service.loginlog.checkPasswordErrorTimes(login_lock)
        if (p === false) {
            ctx.body = { success: false, errorCode: 1003, errorMessage: "Password continuous input error, account locked", showType: 2, data: {} }
            return;
        }
        loginlog.invalid_attempts = p
       
        const salt = res.password.split('&')[0]
        res = await ctx.model.User.findOne({
            where: {
                username: params.username,
                password: salt + "&" + md5(params.password + salt),
            },
        });





        if (!res) {

            loginlog.err_code = 1002
            loginlog.status = 1
            ctx.body = { success: false, errorCode: 1002, errorMessage: "password error", showType: 2, data: {} }
            service.loginlog.add(loginlog)

            return;
        }
        if (res.status == 1) {
            ctx.body = { success: false, errorCode: 1004, errorMessage: "Account disabled", showType: 2, data: {} }
            return;
        }

        const token = app.jwt.sign({
            user_id: res.id,
            login_time: parseInt((new Date).getTime() / 1000),
            username: res.username,
            company_id: res.company_id
        }, app.config.jwt.secret, {
            expiresIn: 3600 * 24  //Expiration time set 
        });


        await service.user.mod({
            id: res.id,
            login_token: token,
            online_status: 1,
            login_time: new Date()
        })


        const logs = await ctx.model.Loginlog.findAll({ where: { user_id: res.id, logout_time: null, status: 0 }, order: [['login_time', 'desc']] });
        if (logs && logs.length > 0) {
            var step3 = 0
            async function Do3() {


                if (step3 >= logs.length) {


                    return
                }

                var log = logs[step3]
                if (log) {

                    var active_duration = parseInt(((new Date).getTime() - new Date(log.login_time).getTime()) / 1000)
                    var token_timeout = parseInt(await ctx.service.sysconfig.getValueByKey("token_timeout"));

                    if (active_duration > token_timeout) {
                        active_duration = token_timeout
                    }
                    await log.update({ logout_time: new Date(), active_duration: active_duration, status: 1 });

                }

                step3++
                await Do3()
            }

            await Do3()

        }



        

       



        ctx.body = { type: 'account', status: 'ok', token: token }

        loginlog.result = JSON.stringify(ctx.body)
        service.loginlog.add(loginlog)


       

    }


    async count(params) {

    }

    async checkEmail(email) {
        const ctx = this.ctx;
        var res = await ctx.model.User.findOne({
            where: {

                email: email,
            },
            raw: true
        });
        ctx.body = { success: true, data: res ? true : false }
    }

    async getUserInfo(user_id) {
        const ctx = this.ctx;
        var res = await ctx.model.User.findOne({
            attributes: [[ctx.model.col('c.name'), 'company_name'], [ctx.model.col('c.type'), 'company_type'], [ctx.model.col('r.type'), 'role_type'], [ctx.model.col('r.name'), 'role_name'], 'user.*'],
            where: {

                id: user_id,
            },
            include: [{
                as: 'r',
                model: ctx.model.Role

            }, {
                as: 'c',
                model: ctx.model.Company

            }],
            raw: true
        });

        const list = await ctx.model.Rolepermission.findAll({
            attributes: [[ctx.model.col('p.permission_key'), 'permission_key']],
            where: { role_id: res.role_id },
            include: [{
                as: 'p',
                model: ctx.model.Permission,
               

            }],
             order: [
                 [{ model: ctx.model.Permission, as: 'p' }, 'sort', 'asc']
                ] ,
            raw: true

        })
       
        res.permissions = list.map((p) => {
            return p.permission_key
        })

       
        if (!res.avatar) {
            res.avatar = 'avatar_1.jpeg'

        }

        res.accessible_feature = res['r.accessible_feature']?.split(',') || []
        res.accessible_organization = res['r.accessible_organization']?.split(',') || []

        const companyList = await ctx.model.Company.findAll()
        var accessible_organization_terminal = []
        var accessible_organization_trader = []
        res.accessible_organization.forEach((a) => {

           var c= companyList.find((b) => {
                return b.id==a

           })
            if (c) {
                if (c.type == "Terminal") {
                    accessible_organization_terminal.push(c.id)
                } else if(c.type=="Trader") {
                    accessible_organization_trader.push(c.id)
                }
            }
        })
        

        res.accessible_organization_terminal = accessible_organization_terminal || []

        res.accessible_organization_trader = accessible_organization_trader || []

        res.accessible_timestamp = res['r.accessible_timestamp']?.split(',') || []


        res.avatar = ctx.request.header.origin + "/upload/avatar/" + res.avatar
        return res
    }
    async findOne(params) {


        const ctx = this.ctx;
        var res = await this.getUserInfo(params.id)
        //Get Unread Messages
        const userUnreadAlertCount = await ctx.service.alert.getUserUnreadAlertCount()

        res.userUnreadAlertCount = userUnreadAlertCount

        ctx.body = { success: true, data: res }
    }
    async list(params) {
        const { ctx } = this;


        let obj = {}

        if (params.where) {
            obj.where = params.where
        }
        if (params.order) {
            obj.order = params.order
        }
        if (params.page && params.limit) {
            obj.offset = parseInt((params.page - 1)) * parseInt(params.limit)
            obj.limit = parseInt(params.limit)
        }
        obj.attributes = [[ctx.model.col('r.name'), 'role_name'], [ctx.model.col('c.name'), 'company_name'], 'user.*']
        obj.include = [{
            as: 'r',
            model: ctx.model.Role,
            where: obj.where.type ? { type: obj.where.type } : null
        }, {
            as: 'c',
            model: ctx.model.Company

        }]

        obj.raw = true
        delete obj.where.type
        const list = await ctx.model.User.findAndCountAll(obj)

        var token_timeout = parseInt(await this.service.sysconfig.getValueByKey("token_timeout"));
        list.rows = list.rows.map((u) => {
            u.online_status = 1
            if ((new Date).getTime() - (new Date(u.login_time * 1000)).getTime() >= token_timeout * 1000) {
                u.online_status = 0
            }
            return u
        })

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



        var str = "<div><p>Hi,</p>";
        str += "<p>You've just indicated to us that you would like to reset the password for your EOS account. You can do this by clicking the link below:</p>"
        str += "<p><a href='" + ctx.request.header.origin + '/#/user/login?resetcheck=' + user.password.replace("&", "@") + "'>Click here to reset</a></p>"
        str += "<p>If you did not request to reset your EOS password, simply ignore this e-mail and we will not change anything.</p>"
        str += "<p>Thanks.</p></div>"

        var res = service.tool.sendMail(params.email, "EOS- Reset password", str)
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
            const salt = uuid.v4();
            params.password = salt + "&" + md5(params.newPassword + salt)
        }

        const res = await user.update({ password: params.password,status:0 });
        if (res) {
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }

    }

    async add(params) {

        function getmm() {
            var amm = ['!', '@', '#', '$', '%', '&', '*', '(', ')', '_'];
            var tmp = Math.floor(Math.random() * 10);
            var s = tmp;
            s = s + amm[tmp];
          
            for (var i = 0; i < 4; i++) {
                tmp = Math.floor(Math.random() * 26);
                s = s + String.fromCharCode(65 + tmp);
            }
           
            for (var i = 0; i < 4; i++) {
                tmp = Math.floor(Math.random() * 26);
                s = s + String.fromCharCode(97 + tmp);
            }
            return s;
        }


        const { ctx, service, app } = this;
        const salt = uuid.v4();

        var password =getmm()
        params.password = salt + "&" + md5(password + salt)
        params.email = params.username


        var isSend = false
        if (params.email_notification) {
            params.status = 1
            isSend = true
            delete params.email_notification
        }

        



       // const res = await ctx.model.User.create(params);
       // if (res) {

            var isAdd=true
            if (isSend) {

                var str = '<div>Hi</div>'
                str += '<br/>'
                str += '<br/>'
                str += '<div> An EOS account has been created for you.</div>'
                str += '<br/>'
                str += '<br/>'
              
                str += '<div> To get started, click on the link below to set a new password and activate your account:</div>'
                str += '<br/>'
                str += '<br/>'

                str += '<div><a href="' + ctx.header.origin + '/#/user/login?check=' + params.password.replace("&", "@") + '">Accept invitation</a></div>'

                str += '<br/>'
                str += '<br/>'

                str += '<div>Thanks!</div>'
                str += '<div>Regards,</div>'
                str += '<div>Efficiency Optimisation System</div>'


                isAdd = await service.tool.sendMail(params.username,"Welcome to EOS!", str)
        }
       
        if (isAdd) {
            const res = await ctx.model.User.create(params);
            if (res) {
                ctx.body = { success: true, data: res };
            } else {
                ctx.body = { success: false, errorCode: 1000 };
            }
            
        } else {
            ctx.body = { success: false, errorCode: 1013 };
        }
         



    }

    async acceptInvitation(params) {


        const ctx = this.ctx;
        const user = await ctx.model.User.findByPk(params.id);



        if (!user) {
            ctx.status = 404;
            ctx.body = { success: false, errorCode: 1000 };
            return;
        }

        const res = await user.update(params);
        if (res) {
            ctx.body = "Accept Invitation success,Please log in to the <a h>EOS</a> system with an initial login password of 123456. After logging in, please modify the login password";
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }

    }

    async del(params) {

        const ctx = this.ctx;

        await ctx.model.Operlog.destroy({
            where: {
                user_id: params.id
            }
        })
        await ctx.model.Loginlog.destroy({
            where: {
                user_id: params.id
            }
        })
        await ctx.model.AlertUserRead.destroy({
            where: {
                user_id: params.id
            }
        })
        await ctx.model.Alert.destroy({
            where: {
                user_id: params.id
            }
        })
        await ctx.model.Alertrule.destroy({
            where: {
                user_id: params.id
            }
        })
        await ctx.model.AlertruleTransaction.destroy({
            where: {
                user_id: params.id
            }
        })
        await ctx.model.Report.destroy({
            where: {
                user_id: params.id
            }
        })
        await ctx.model.Userconfig.destroy({
            where: {
                user_id: params.id
            }
        })
        

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

        const user = await ctx.model.User.findByPk(params.id ? params.id : ctx.user.user_id);
       // var token_timeout = parseInt(await this.service.sysconfig.getValueByKey("token_timeout"));
       
        const res = await user.update({  online_status: 0, logout_time: new Date });

        const log = await ctx.model.Loginlog.findOne({ where: { user_id: ctx.user.user_id }, order: [['login_time', 'desc']] });
        if (log) {

            var active_duration = parseInt(((new Date).getTime() - new Date(log.login_time).getTime()) / 1000)
            const res2 = await log.update({ logout_time: new Date(), active_duration: active_duration });

        }



        ctx.body = { success: true };
        ctx.status = 200;

    }
    async mod(params) {


        const ctx = this.ctx;
        const user = await ctx.model.User.findByPk(params.id);
        if (params.password) {
            const salt = uuid.v4();
            params.password = salt + "&" + md5(params.password + salt)
        } else {
            delete params.password
        }

        if (params.oldPassword) {
            const salt2 = user.password.split('&')[0]
            if (user.password != salt2 + "&" + md5(params.oldPassword + salt2)) {
                ctx.body = { success: false, errorCode: 1007 };
                return;
            }
            const salt = uuid.v4();
            params.password = salt + "&" + md5(params.newPassword + salt)
            
            delete params.oldPassword
            delete params.repeatNewPassword


        }

        var isSend = false
        if (params.email_notification) {

            isSend = true
            delete params.email_notification
        }

        if (!user) {
            ctx.status = 404;
            ctx.body = { success: false, errorCode: 1000 };
            return;
        }

        const res = await user.update(params);
        if (res) {
            if (isSend) {
                await this.retrievePassword({ email: res.username })
            }
            ctx.body = { success: true, data: res };
        } else {
            ctx.body = { success: false, errorCode: 1000 };
        }

    }

}

module.exports = UserService;

