// app/service/tool.js

'use strict';

const Service = require('egg').Service;
// import nodemailer
const nodemailer = require('nodemailer');
const user_email = '504475705@qq.com';// account number
const auth_code = 'adiclzwfzscxbggi';// AUTHORIZE CODE



class ToolService extends Service {

    async sendMail(email, subject, html) {

        const { ctx, service, app } = this;
        const transporter = nodemailer.createTransport({
            service: 'qq',// Call QQ server
            secureConnection: true,// Start SSL
            port: 465,// The port is 465
            auth: {
                user: app.config.user_email, // account number
                pass: app.config.auth_code, // AUTHORIZE CODE

            },
        });

        // Email parameters and content
        const mailOptions = {
            from: app.config.user_email, // Sender, consistent with the user above
            to: email,   // Receiver, can send multiple messages simultaneously, separated by commas
            subject,   // title
            html,
        };

        try {
            // Call function to send email
            var s = await transporter.sendMail(mailOptions);

           
            return true;
        } catch (err) {
            
            return false;
        }
    }

}

module.exports = ToolService;
