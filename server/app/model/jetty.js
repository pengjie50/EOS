/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER,UUID,TEXT } = app.Sequelize;
    const Model = app.model.define('jetty', {
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
        depth_alongside: {
            type: STRING(100),
            allowNull: true,
            defaultValue: ''
        },
        depth_approaches: {
            type: STRING(100),
            allowNull: true,
            defaultValue: ''
        },
        max_loa: {
            type: STRING(100),
            allowNull: true,
            defaultValue: ''
        },
        min_loa: {
            type: STRING(100),
            allowNull: true,
            defaultValue: ''
        },
        max_displacement: {
            type: STRING(100),
            allowNull: true,
            defaultValue: ''
        },
        mla_envelop_at_mhws_3m: {
            type: STRING(100),
            allowNull: true,
            defaultValue: ''
        },
        terminal_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        }
       
    }, {
        indexes: [
        {
          fields: ['name']
        }],
        
        timestamps: false,
        tableName: 'jetty'
        
    });

    return Model;
};
