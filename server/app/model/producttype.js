/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER,UUID,TEXT } = app.Sequelize;
    const Model = app.model.define('product_type', {
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
        
        timestamps: false,
        tableName: 'product_type'
        
    });

    return Model;
};
