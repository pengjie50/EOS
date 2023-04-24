/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TINYINT } = app.Sequelize;
    const Model = app.model.define('user', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false
            
        },
        username: {
          type: STRING(100),
          allowNull: false,
          defaultValue: ''
        },
        nickname: {
          type: STRING(100),
          allowNull: false,
          defaultValue: ''
        },
        sex: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        }, 
        avatar: {
            type: STRING(100),
            allowNull: false,
            defaultValue: ''
        },
        password: {
          type: STRING(100),
          allowNull: false,
          defaultValue: ''
        },
        email: {
          type: STRING(100),
          allowNull: true,
          defaultValue: ''
        },
        phone: {
          type: STRING(100),
          allowNull: true,
          defaultValue: ''
        },
        phone: {
            type: STRING(100),
            allowNull: true,
            defaultValue: ''
        },
        role_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        },
        company_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        },
        status: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        }, 
        profile: {
            type: STRING(500),
            allowNull: true,
            defaultValue: ''
        },
        del_flag: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        login_time: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0
        }, 
        
       
    }, {
        indexes: [
            {
                unique: true,
                fields: ['id', 'email']
            }, {
                unique: true,
                fields: ['id', 'phone']
            }, {
               
                fields: ['username', 'email','phone']
            }],
        tableName: 'user'
    });
    Model.associate = function () {
        app.model.User.belongsTo(app.model.Role, {foreignKey: 'role_id',as:'r'});
        app.model.User.belongsTo(app.model.Company, {foreignKey: 'company_id',as:'c'});
    };
    return Model;
};
