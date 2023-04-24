/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER,TINYINT,UUID,TEXT } = app.Sequelize;
    const Model = app.model.define('user_config', {
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
        user_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        },
        type: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        value: {
          type: TEXT,
          allowNull: false,
          defaultValue: ''
        }
        
        
       
    }, {
        indexes: [
        {
                fields: ['name', 'user_id','type']
        }],
        
        timestamps: false,
        tableName: 'user_config'
        
    });

    return Model;
};
