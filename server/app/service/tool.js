// app/service/tool.js

'use strict';

const Service = require('egg').Service;
// import nodemailer
const nodemailer = require('nodemailer');
const user_email = '504475705@qq.com';// account number
const auth_code = 'adiclzwfzscxbggi';// AUTHORIZE CODE



class ToolService extends Service {
    createTitle(alert, alertrule, transaction, flowMap) {
        var pstr = ""
        if (alertrule.type == 2) {
            pstr = 'Entire Transaction Process'
        } else if (alertrule.type == 0) {
            pstr = 'Single Process ' + flowMap[alertrule.flow_id].name
        } else if (alertrule.type == 1) {
            pstr = 'Between Two Events ' + flowMap[alertrule.flow_id].name + " To " + flowMap[alertrule.flow_id_to].name
        }

        var str = '[EOS E' + transaction.eos_id + '] ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr

        return str
    }
    createContent(alert, alertrule, transaction, flowMap) {
        var pstr = ""
        if (alertrule.type == 2) {
            pstr = 'Entire Transaction Process'
        } else if (alertrule.type == 0) {
            pstr = 'Single Process ' + flowMap[alertrule.flow_id].name
        } else if (alertrule.type == 1) {
            pstr = 'Between Two Events ' + flowMap[alertrule.flow_id].name + " To " + flowMap[alertrule.flow_id_to].name
        }
        var str = '<div>'

        var str = '<div>'
        str += '<div><a href="https://eosuat.southeastasia.cloudapp.azure.com/#/user/login?redirect=/transactions?eos_id=' + transaction.eos_id + '"> E' + transaction.eos_id + '</a></div>'
       
        str += '<br/>'
        str += '<div> ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr + ' is triggered.</div>'
        str += '<br/>'
        str += '<br/>'
        str += '<table border="1" cellspacing="0">'
        str += '<tr>'
        str += '<td>Alert ID </td><td>' + alert.alert_id + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Alert Type </td><td>' + (alert.type == 0 ? 'Amber' : 'Red') + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>IMO Number </td><td>' + transaction.imo_number + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Vessel Name</td><td>' + transaction.vessel_name + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Terminal Name</td><td>' + transaction.terminal_name + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Jetty Number</td><td>' + transaction.jetty_name + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Product</td><td>' + (transaction.product_name || "") + '</td>'
        str += '</tr>'
        str += '</table>'
        str += '<br/>'
        str += '<br/>'
        str += '<div><a href="https://eosuat.southeastasia.cloudapp.azure.com/#/user/login?redirect=/threshold/alert?alert_id=' + alert.alert_id + '"> Please Login to EOS system for more details.</a></div>'
        str += '<br/>'
        str += '<div>I am an auto-generated email alert from the EOS system. Please do not reply to me.</div>'
        str += '<br/>'
       

        str += '</div>'
        return str
    }


    createUpdateTitle(alert, alertrule, transaction, flowMap) {
        var pstr = ""
        if (alertrule.type == 2) {
            pstr = 'Entire Transaction Process'
        } else if (alertrule.type == 0) {
            pstr = 'Single Process ' + flowMap[alertrule.flow_id].name
        } else if (alertrule.type == 1) {
            pstr = 'Between Two Events ' + flowMap[alertrule.flow_id].name + " To " + flowMap[alertrule.flow_id_to].name
        }

        var str = '[EOS E' + transaction.eos_id + '] Updated ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr

        return str
    }
    createUpdateContent(alert, alertrule, transaction, flowMap) {
        var pstr = ""
        if (alertrule.type == 2) {
            pstr = 'Entire Transaction Process'
        } else if (alertrule.type == 0) {
            pstr = 'Single Process ' + flowMap[alertrule.flow_id].name
        } else if (alertrule.type == 1) {
            pstr = 'Between Two Events ' + flowMap[alertrule.flow_id].name + " To " + flowMap[alertrule.flow_id_to].name
        }
        var str = '<div>'

        var str = '<div>'

        str += '<div><a href="https://eosuat.southeastasia.cloudapp.azure.com/#/user/login?redirect=/transactions?eos_id=' + transaction.eos_id + '"> E' + transaction.eos_id + '</a></div>'

        str += '<br/>'
        str += '<div> ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr + ' is triggered.</div>'
        str += '<br/>'
        str += '<br/>'
        str += '<table border="1" cellspacing="0">'
        str += '<tr>'
        str += '<td>Alert ID </td><td>' + alert.alert_id + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Alert Type </td><td>' + (alert.type == 0 ? 'Amber' : 'Red') + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>IMO Number </td><td>' + transaction.imo_number + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Vessel Name</td><td>' + transaction.vessel_name + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Terminal Name</td><td>' + transaction.terminal_name + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Jetty Number</td><td>' + transaction.jetty_name + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Product</td><td>' + (transaction.product_name || "") + '</td>'
        str += '</tr>'
        str += '</table>'
        str += '<br/>'
        str += '<br/>'
        str += '<div><a href="https://eosuat.southeastasia.cloudapp.azure.com/#/user/login?redirect=/threshold/alert?alert_id=' + alert.alert_id + '"> Please Login to EOS system for more details.</a></div>'
        str += '<br/>'
        str += '<div>I am an auto-generated email alert from the EOS system. Please do not reply to me.</div>'
        str += '<br/>'
       

        str += '</div>'
        return str
    }



    createClearContent(alert, alertrule, transaction, flowMap) {


        var pstr = ""
        if (alertrule.type == 2) {
            pstr = 'Entire Transaction Process'
        } else if (alertrule.type == 0) {
            pstr = 'Single Process ' + flowMap[alertrule.flow_id].name
        } else if (alertrule.type == 1) {
            pstr = 'Between Two Events ' + flowMap[alertrule.flow_id].name + " To " + flowMap[alertrule.flow_id_to].name
        }
        var str = '<div>'

        str += '<div><a href="https://eosuat.southeastasia.cloudapp.azure.com/#/user/login?redirect=/transactions?eos_id=' + transaction.eos_id + '"> E' + transaction.eos_id + '</a></div>'

        str += '<br/>'
        str += '<div> ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr + ' is no longer valid due to an update in Transaction Information. This alert has been removed.</div>'
        str += '<br/>'
        str += '<br/>'
        str += '<table border="1" cellspacing="0">'
        str += '<tr>'
        str += '<td>Alert ID </td><td>' + alert.alert_id + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Alert Type </td><td>' + (alert.type == 0 ? 'Amber' : 'Red') + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>IMO Number </td><td>' + transaction.imo_number + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Vessel Name</td><td>' + transaction.vessel_name + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Terminal Name</td><td>' + transaction.terminal_name + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Jetty Number</td><td>' + transaction.jetty_name + '</td>'
        str += '</tr>'
        str += '<tr>'
        str += '<td>Product</td><td>' + (transaction.product_name || "") + '</td>'
        str += '</tr>'
        str += '</table>'
        str += '<br/>'
        str += '<br/>'
        str += '<div><a href="https://eosuat.southeastasia.cloudapp.azure.com/#/user/login?redirect=/threshold/alert?alert_id=' + alert.alert_id + '"> Please Login to EOS system for more details.</a></div>'
        str += '<br/>'
        str += '<div>I am an auto-generated email alert from the EOS system. Please do not reply to me.</div>'
        str += '<br/>'
       

        str += '</div>'



        return str
    }
    createClearTitle(alert, alertrule, transaction, flowMap) {
        var pstr = ""
        if (alertrule.type == 2) {
            pstr = 'Entire Transaction Process'
        } else if (alertrule.type == 0) {
            pstr = 'Single Process ' + flowMap[alertrule.flow_id].name
        } else if (alertrule.type == 1) {
            pstr = 'Between Two Events ' + flowMap[alertrule.flow_id].name + " To " + flowMap[alertrule.flow_id_to].name
        }

        var str = '[EOS E' + transaction.eos_id + '] Removed ' + (alert.type == 0 ? 'Amber' : 'Red') + ' Alert for ' + pstr

        return str
    }
    async sendMailDo(ar, alert, transaction, flowMap,type) {
        if (ar.email) {
            try {
                var emailArr = ar.email.split(";")
                var sendEmail = []
                emailArr.forEach((c) => {
                    var v = c.split(',')
                    if (v.some((f) => {
                        return f == (alert.type == 0 ? 'a' : 'r')

                    })) {
                        sendEmail.push(v[0])
                    }


                })
                if (sendEmail.length > 0) {
                    if (type == "Update") {
                        await this.sendMail(sendEmail.join(","), this.createUpdateTitle(alert, ar, transaction, flowMap), this.createUpdateContent(alert, ar, transaction, flowMap))
                    } else if (type == "Clear") {
                        await this.sendMail(sendEmail.join(","), this.createClearTitle(alert, ar, transaction, flowMap), this.createClearContent(alert, ar, transaction, flowMap))
                    } else {
                        await this.sendMail(sendEmail.join(","), this.createTitle(alert, ar, transaction, flowMap), this.createContent(alert, ar, transaction, flowMap))
                    }
                    
                }


            } catch (e) {

            }

        }

    }
   

    getDurationInfo(transactioneventList, flowMap_) {

        if (transactioneventList && transactioneventList.length > 0) {

        } else {
            return { ee:null, se:null }
        }
        
        var pMap = {}
        var pArr = []
        transactioneventList.forEach((te) => {
            if (!pMap[te.flow_pid]) {
                pArr.push(te.flow_pid)
                pMap[te.flow_pid] = []
            }
            pMap[te.flow_pid].push(te)


        })
        pArr = pArr.sort((j, k) => {
            return flowMap_[j].sort - flowMap_[k].sort
        })
        var eArr = pMap[pArr[pArr.length - 1]]


        var sArr = pMap[pArr[0]]


        var ee = eArr[eArr.length - 1]
        var se = sArr[0]
        return { ee, se }
        
    }

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
           
            if (s.accepted.length > 0) {
                return true;
            } else {
                return false;
            }





        } catch (err) {
           
            return false;
        }
    }

}

module.exports = ToolService;
