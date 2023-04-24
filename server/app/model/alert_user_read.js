/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, TINYINT } = app.Sequelize;
    const Model = app.model.define('alert_user_read', {
        id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
           
        },
        user_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        },
        alert_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        }
       
    }, {
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'alert_id']
        }],
        
        timestamps: false,
        tableName: 'alert_user_read'
        
    });
    
    return Model;
};
