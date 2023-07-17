/* eslint valid-jsdoc: "off" */

'use strict';
const fs = require('fs'); // Introducing fs module
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
            delegate: 'model', // Load all models into app. Model and ctx. Model
            baseDir: 'model', // Model directory to load `app/model/*.js`
            dialect: 'mssql', // support: mysql, mariadb, postgres, mssql
            database: 'eos_development',
            host: 'woke.qinqinwater.cn',
            port: 1433,
            timezone: '+08:00',// Save as local time zone
            define: {
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                // Cancel the plural of data table names
                freezeTableName: true,
                // Automatically write timestamp created_at updated_at
                timestamps: true,
                // Field generation soft delete timestamp deleted_at
                paranoid: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                //deletedAt: 'deleted_at',
                // All Hump Naming Formats
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
        dir: [path.join(appInfo.baseDir, 'public/dist')]// Multiple static file entries
    };
    //Project Static Template Settings
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
        writetoBCUrl: "http://165.232.172.190:3011/eos/WritetoBC",
        validateBCUrl: "http://165.232.172.190:3011/eos/ValidateBC",
        user_email: "504475705@qq.com",
        auth_code: "gatvtdmruiwjbiih"
        // myAppName: 'egg',
    };

    config.siteFile = {



        '/favicon.ico': fs.readFileSync('favicon.ico'),
    };
    config.multipart = {
        whitelist: [
            '.png', '.jpg', '.mp4'
        ],
        mode: 'file',
        fileSize: '100mb'
    };


    config.logger = {
        outputJSON: true,

        dir: 'c:/eoslog',
        level: 'DEBUG',
    };
    return {
        ...config,
        ...userConfig,
    };
};
