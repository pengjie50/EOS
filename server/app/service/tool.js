// app/service/tool.js

'use strict';

const Service = require('egg').Service;
// 引入nodemailer
const nodemailer = require('nodemailer');
const user_email = '504475705@qq.com';// 账号
const auth_code = 'adiclzwfzscxbggi';// 授权码
// 封装发送者信息
const transporter = nodemailer.createTransport({
    service: 'qq',// 调用qq服务器
    secureConnection: true,// 启动SSL
    port: 465,// 端口就是465
    auth: {
        user: user_email, // 账号
        pass: auth_code, // 授权码

    },
});

class ToolService extends Service {

    async sendMail(email, subject, html) {
        // 邮件参数及内容
        const mailOptions = {
            from: user_email, // 发送者,与上面的user一致
            to: email,   // 接收者,可以同时发送多个,以逗号隔开
            subject,   // 标题
            html,
        };

        try {
            // 调用函数，发送邮件
            var s = await transporter.sendMail(mailOptions);
            console.log(s)
            return true;
        } catch (err) {
            return false;
        }
    }

}

module.exports = ToolService;
