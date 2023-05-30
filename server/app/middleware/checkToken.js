module.exports = (options, app) => {
    return async function checkToken(ctx, next) {
       
        if (!app) {
            await next();

        } else {

            var Authorization = ctx.get('Authorization')

            console.log("ddddddd===================================================", Authorization)
           
            let decoded;
            if (Authorization) {
                decoded = app.jwt.decode(Authorization, app.config.jwt.secret);
                if (!decoded) {
                    ctx.body = { success: false, errorCode: 1006, errorMessage: "Token error", showType: 2, data: {} }
                    return
                }
                console.log(decoded)        // 验证token是否过期
               

                var token_timeout = parseInt(await ctx.service.sysconfig.getValueByKey("token_timeout"));
                var login_user = await ctx.service.user.getUserInfo(decoded.user_id)
              
                ctx.user = login_user
                ctx.user.user_id = login_user.id
                if (login_user.role_id =='rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr') {
                    ctx.user.isAdmin=true
                }


                var login_time = login_user['login_time']
                var login_token = login_user['login_token']
               
              
                if (ctx.request.url != '/api/user/logout' && login_token != Authorization) {
                   
                    ctx.body = { success: false, errorCode: 1011, errorMessage: "Account logged in on another device, you have been logged out", showType: 2, data: {} }

                    return
                } 
               
                if (ctx.request.url != '/api/user/logout' && decoded && (login_time + token_timeout) <= ((new Date()).getTime()) / 1000) {
                    ctx.body = { success: false, errorCode: 1005, errorMessage: "Login status has expired", showType: 2, data: {} }
                    return
                } else {


                   

                    await next();
                }

            } else {


                console.log("vvvvvvvvvvvvvvvvvvvvvvvv===", Authorization)
                await next();
            }
            
        }



    }
};