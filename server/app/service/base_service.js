/*
* @ author Administrator
* @ time   2018/11/14/014 15:58
* @ description
* @ param
*/
'use strict'

const Service = require('egg').Service;



class BaseService extends Service {


    access(permissionKey) {
        const { ctx, service } = this;
        return ctx.user.permissions.some((a) => {
            return a == permissionKey
        })
    }





}

module.exports = BaseService;

