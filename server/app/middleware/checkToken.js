module.exports = (options, app) => {
    return async function checkToken(ctx, next) {

        if (!app) {
            await next();
        } else {
            var Authorization = ctx.get('Authorization')
            ctx.activity_duration_start = new Date
           
            let decoded;
            if (Authorization) {

                if (ctx.request.url.indexOf('data/receive') > -1) {
                    Authorization = Authorization.split(" ")[1]
                }
                

                decoded = app.jwt.decode(Authorization, app.config.jwt.secret);
               
                if (ctx.request.url.indexOf('data/receive') > -1) {
                   
                    
                    if (decoded && decoded.key == "receiveSGTradexData" && decoded.password == "receiveSGTradexData@123456") {

                        ctx.checkToken = true

                    }
                    await next();
                    return
                }

                if (!decoded) {
                    ctx.body = { success: false, errorCode: 1006, errorMessage: "Token error", showType: 2, data: {} }
                    return
                }

                var token_timeout = parseInt(await ctx.service.sysconfig.getValueByKey("token_timeout"));
                var login_user = await ctx.service.user.getUserInfo(decoded.user_id)

                ctx.user = login_user
                ctx.user.user_id = login_user.id
                if (login_user.role_type == 'Super') {
                    ctx.user.isAdmin = true
                }

                var login_time = (new Date(login_user['login_time'])).getTime()/1000
                var login_token = login_user['login_token']

                if (ctx.request.url != '/api/user/logout' && login_token != Authorization) {



                   

                    const user = await ctx.model.User.findByPk(login_user.id);

                    if (user) {
                        const res = await user.update({ logout_time: new Date, online_status: 0 });
                    }
                    


                    

                    ctx.body = { success: false, errorCode: 1011, errorMessage: "Account logged in on another device, you have been logged out", showType: 2, data: {} }

                    return
                }
                if (ctx.request.url != '/api/user/logout' && decoded && (login_time + token_timeout) <= ((new Date()).getTime()) / 1000) {
                   
                    const user = await ctx.model.User.findByPk(login_user.id);

                    if (user) {
                        const res = await user.update({ logout_time: new Date, online_status: 0 });
                    }
                   
                    ctx.body = { success: false, errorCode: 1005, errorMessage: "Login status has expired", showType: 2, data: {} }
                    return
                } else {
                    await next();
                }

            } else {
                await next();
            }

        }



    }
};