/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    
    const { DATE, STRING, INTEGER,UUID,TEXT,TINYINT } = app.Sequelize;
    const Model = app.model.define('company', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false
        },
        name: {
          type: STRING(100),
          allowNull: false,
          defaultValue: ''
        },
        contacts: {
          type: STRING(100),
          allowNull: false,
          defaultValue: ''
        },
        email: {
          type: STRING(100),
          allowNull: false,
          defaultValue: ''
        },
        phone: {
          type: STRING(12),
          allowNull: false,
          defaultValue: ''
        },
        pid: {
          type: UUID,
          allowNull: false,
          defaultValue: ''
        },
        description: {
          type: TEXT,
          allowNull: false,
          defaultValue: ''
        }
    }, {
        indexes: [
        {
          fields: ['name','phone']
        }],
        tableName: 'company'
    });

    Model.associate = function () {
       
        app.model.Company.belongsTo(app.model.Company, {foreignKey: 'pid',as:'pc'});
       
        
    };
    
    return Model;
};
