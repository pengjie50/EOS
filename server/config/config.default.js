/* eslint valid-jsdoc: "off" */

'use strict';
const fs = require('fs'); // 引入fs模块
const path = require('path');
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
    const config = exports = {};

    config.sequelize = {
        datasources: [{
            delegate: 'model', // 加载所有的模型到 app.Model and ctx.Model
            baseDir: 'model', // 要加载的模型目录 `app/model/*.js`
            dialect: 'mssql', // support: mysql, mariadb, postgres, mssql
            database: 'dms_development',
            host: 'woke.qinqinwater.cn',
            port: 1433,
            timezone: '+08:00',// 保存为本地时区
            define: {
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                // 取消数据表名复数
                freezeTableName: true,
                // 自动写入时间戳 created_at updated_at
                timestamps: true,
                // 字段生成软删除时间戳 deleted_at
                paranoid: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                //deletedAt: 'deleted_at',
                // 所有驼峰命名格式化
                underscored: true
            },

            dialectOptions: {
                options: {
                    encrypt: false,
                    enableArithAbort: false
                },
                decimalNumbers: true,
                
                dateStrings: true,
                typeCast(field, next) {
                    // for reading from database
                    if (field.type === "DATETIME") {


                        return field.string();
                    }
                    return next();
                }
            },
           
            username: 'dms',
            password: 'zsdmsdmm@123456'
        }]
        
    };
    config.middleware = ['checkToken', 'where', 'errorHandler'];
    config.jwt = {
        secret: '123456',
    };
   
    config.security = {
        csrf: {
            useSession: false,
            enable: false,
            ignoreJSON: false,
            cookieName: 'csrfToken',
            sessionName: 'csrfToken',
            headerName: 'x-csrf-token',
            bodyName: '_csrf',
            queryName: '_csrf',
        },
        domainWhiteList: ['http://localhost:7001'],
    };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1679991408758_103';

    config.static = {
        prefix: '/',
        dir: [path.join(appInfo.baseDir, 'public/dist')]// 多静态文件入口
    };
    //项目静态模板设置
    config.view = {
        root: [
            path.join(appInfo.baseDir, 'public/dist'),
        ].join(','),
        defaultViewEngine: 'nunjucks',
        mapping: {
            '.html': 'nunjucks',
        },
    };
  // add your user config here
    const userConfig = {
        writetoBCUrl: "http://165.232.172.190:3010/eos/batch-WritetoBCV2",
        validateBCUrl: "http://165.232.172.190:3010/eos/batch-ValidateBCV2",
        user_email: "504475705@qq.com",
        auth_code:"adiclzwfzscxbggi"
    // myAppName: 'egg',
    };

    config.siteFile = {
      
        
        
        '/favicon.ico': fs.readFileSync('favicon.ico'),
    };
    config.multipart = {
        whitelist: [
            '.png', '.jpg'
        ],
        mode: 'file',
        fileSize: '100mb'
    };
   

    config.logger = {
        level: 'DEBUG',
    };
  return {
    ...config,
    ...userConfig,
  };
};
