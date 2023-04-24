/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TINYINT } = app.Sequelize;
    const Model = app.model.define('login_log', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false
            
        },
        user_id: {
            type: UUID,
            allowNull: true,
            defaultValue: ''
        },
        username: {
          type: STRING(100),
          allowNull: false,
          defaultValue: ''
        },
        ip: {
            type: STRING(128),
            allowNull: false,
            defaultValue: ''
        },
        browser: {
            type: STRING(50),
            allowNull: true,
            defaultValue: ''
        },
        os: {
            type: STRING(50),
            allowNull: true,
            defaultValue: ''
        },
        status: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        err_code: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        login_time: {
            type: DATE,
            allowNull: false,
            defaultValue: ''
        }
   
    }, {
        indexes: [
        {
                fields: ['username', 'login_time', 'status']
        }],
        timestamps: false,
        tableName: 'login_log'
      
    });
    Model.associate = function () {
       app.model.Loginlog.belongsTo(app.model.User, { foreignKey: 'user_id',as:'u'});
        
    };
    return Model;
};
