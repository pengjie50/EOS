// app/service/tool.js

'use strict';

const Service = require('egg').Service;
// ����nodemailer
const nodemailer = require('nodemailer');
const user_email = '504475705@qq.com';// �˺�
const auth_code = 'adiclzwfzscxbggi';// ��Ȩ��
// ��װ��������Ϣ
const transporter = nodemailer.createTransport({
    service: 'qq',// ����qq������
    secureConnection: true,// ����SSL
    port: 465,// �˿ھ���465
    auth: {
        user: user_email, // �˺�
        pass: auth_code, // ��Ȩ��

    },
});

class ToolService extends Service {

    async sendMail(email, subject, html) {
        // �ʼ�����������
        const mailOptions = {
            from: user_email, // ������,�������userһ��
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
            return false;
        }
    }

}

module.exports = ToolService;
