/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    
    const { DATE, STRING, INTEGER,UUID,TEXT,TINYINT } = app.Sequelize;
    const Model = app.model.define('flow', {
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
        icon: {
            type: STRING(100),
            allowNull: false,
            defaultValue: ''
        },
        type: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        sort: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0
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
          fields: ['name']
        }],
        tableName: 'flow'
    });

    Model.associate = function () {
       
       // app.model.Company.belongsTo(app.model.Company, {foreignKey: 'pid',as:'pc'});
       
        
    };
    
    return Model;
};
