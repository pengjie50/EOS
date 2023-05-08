'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;
    app.beforeStart(async () => {
        //await app.model.Transactionevent.sync({ alter: true });//force  false 为不覆盖 true会删除再创建; alter true可以 添加或删除字段;
    });
    
    router.get('/', controller.home.index);
    router.post('/api/user/login', controller.user.login);
    router.post('/api/user/logout', controller.user.logout);
    router.post('/api/user/add', controller.user.add);
    router.post('/api/user/mod', controller.user.mod);
    router.post('/api/user/del', controller.user.del);
    router.post('/api/user/info', controller.user.info);
    router.post('/api/user/list', controller.user.list);
    router.post('/api/user/retrievePassword', controller.user.retrievePassword);
    router.post('/api/user/modifyPassword', controller.user.modifyPassword);
    router.post('/api/user/checkEmail', controller.user.checkEmail);

    
    //router.post('/system/verify', controller.system.verify);

    router.post('/api/role/list', controller.role.list);
    router.post('/api/role/add', controller.role.add);
    router.post('/api/role/mod', controller.role.mod);
    router.post('/api/role/del', controller.role.del);

   // router.post('/api/role/getPermissionsByRoleId', controller.role.getPermissionsByRoleId);

    router.post('/api/upload/avatar', controller.upload.avatar);

    router.post('/api/company/list', controller.company.list);
    router.post('/api/company/add', controller.company.add);
    router.post('/api/company/mod', controller.company.mod);
    router.post('/api/company/del', controller.company.del);

    router.post('/api/permission/list', controller.permission.list);
    router.post('/api/permission/add', controller.permission.add);
    router.post('/api/permission/mod', controller.permission.mod);
    router.post('/api/permission/del', controller.permission.del);



    router.post('/api/terminal/list', controller.terminal.list);
    router.post('/api/terminal/add', controller.terminal.add);
    router.post('/api/terminal/mod', controller.terminal.mod);
    router.post('/api/terminal/del', controller.terminal.del);

    router.post('/api/producttype/list', controller.producttype.list);
    router.post('/api/producttype/add', controller.producttype.add);
    router.post('/api/producttype/mod', controller.producttype.mod);
    router.post('/api/producttype/del', controller.producttype.del);

    router.post('/api/jetty/list', controller.jetty.list);
    router.post('/api/jetty/add', controller.jetty.add);
    router.post('/api/jetty/mod', controller.jetty.mod);
    router.post('/api/jetty/del', controller.jetty.del);

    router.post('/api/permissiontorole/list', controller.rolepermission.list);
    router.post('/api/permissiontorole/add', controller.rolepermission.add);
    router.post('/api/permissiontorole/del', controller.rolepermission.del);

    router.post('/api/loginlog/list', controller.loginlog.list);
    router.post('/api/operlog/list', controller.operlog.list);

    router.post('/api/sysconfig/list', controller.sysconfig.list);
    router.post('/api/sysconfig/add', controller.sysconfig.add);
    router.post('/api/sysconfig/mod', controller.sysconfig.mod);
    router.post('/api/sysconfig/del', controller.sysconfig.del);

    router.post('/api/filterOfTimestamps/list', controller.filterOfTimestamps.list);
    router.post('/api/filterOfTimestamps/add', controller.filterOfTimestamps.add);
    router.post('/api/filterOfTimestamps/mod', controller.filterOfTimestamps.mod);
    router.post('/api/filterOfTimestamps/del', controller.filterOfTimestamps.del);


    router.post('/api/alert/list', controller.alert.list);
    router.post('/api/alert/add', controller.alert.add);
    router.post('/api/alert/mod', controller.alert.mod);
    router.post('/api/alert/del', controller.alert.del);
    router.post('/api/alert/getUserUnreadAlertCount', controller.alert.getUserUnreadAlertCount);
    

    router.post('/api/alertrule/list', controller.alertrule.list);
    router.post('/api/alertrule/add', controller.alertrule.add);
    router.post('/api/alertrule/mod', controller.alertrule.mod);
    router.post('/api/alertrule/del', controller.alertrule.del);


    router.post('/api/flow/list', controller.flow.list);
    router.post('/api/flow/add', controller.flow.add);
    router.post('/api/flow/mod', controller.flow.mod);
    router.post('/api/flow/del', controller.flow.del);


    router.post('/api/transaction/list', controller.transaction.list);
    router.post('/api/transaction/add', controller.transaction.add);
    router.post('/api/transaction/mod', controller.transaction.mod);
    router.post('/api/transaction/del', controller.transaction.del);

    router.post('/api/transactionevent/list', controller.transactionevent.list);
    router.post('/api/transactionevent/add', controller.transactionevent.add);

   


    
};
