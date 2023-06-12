// app/service/tool.js

'use strict';

const Service = require('egg').Service;
// ����nodemailer
const nodemailer = require('nodemailer');
const user_email = '504475705@qq.com';// �˺�
const auth_code = 'adiclzwfzscxbggi';// ��Ȩ��
// ��װ��������Ϣ


class ToolService extends Service {
   
    async sendMail(email, subject, html) {
       
        const { ctx, service, app } = this;
        const transporter = nodemailer.createTransport({
            service: 'qq',// ����qq������
            secureConnection: true,// ����SSL
            port: 465,// �˿ھ���465
            auth: {
                user: app.config.user_email, // �˺�
                pass: app.config.auth_code, // ��Ȩ��

            },
        });
       
        // �ʼ�����������
        const mailOptions = {
            from: app.config.user_email, // ������,�������userһ��
            to: email,   // ������,����ͬʱ���Ͷ��,�Զ��Ÿ���
            subject,   // ����
            html,
        };
       
        try {
            // ���ú����������ʼ�
            var s = await transporter.sendMail(mailOptions);
           
            console.log(s)
            return true;
        } catch (err) {
            console.log(err)
            return false;
        }
    }

}

module.exports = ToolService;
