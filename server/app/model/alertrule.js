/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, TINYINT } = app.Sequelize;
    const Model = app.model.define('alert_rule', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false
           
        },
        flow_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        },
        flow_id_to: {
            type: UUID,
            allowNull: true,
            defaultValue: ''
        },
        total_nominated_quantity_from_m: {
            type: INTEGER,
            allowNull: true,
            defaultValue: null
        },
        total_nominated_quantity_to_m: {
            type: INTEGER,
            allowNull: true,
            defaultValue: null
        },
        total_nominated_quantity_from_b: {
            type: INTEGER,
            allowNull: true,
            defaultValue: null
        },
        total_nominated_quantity_to_b: {
            type: INTEGER,
            allowNull: true,
            defaultValue: null
        },
        
        size_of_vessel_from: {
            type: INTEGER,
            allowNull: true,
            defaultValue: null
        },
        size_of_vessel_to: {
            type: INTEGER,
            allowNull: true,
            defaultValue: null
        },
        amber_hours: {
            type: INTEGER,
            allowNull: false,
            defaultValue: ''
        },
        amber_mins: {
            type: INTEGER,
            allowNull: false,
            defaultValue: ''
        },
        red_hours: {
            type: INTEGER,
            allowNull: false,
            defaultValue: ''
        },
        red_mins: {
            type: INTEGER,
            allowNull: false,
            defaultValue: ''
        },
        email: {
            type: STRING(2000),
            allowNull: true,
            defaultValue: ''
        },
        send_email_select: {
            type: STRING(100),
            allowNull: true,
            defaultValue: ''
        },
        type: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        }, 
        
       
    }, {
        indexes: [
        {
                fields: ['flow_id']
        }],
        
        timestamps: false,
        tableName: 'alert_rule'
        
    });
   /* Model.associate = function () {
        app.model.User.belongsTo(app.model.Role, { foreignKey: 'role_id', as: 'r' });
        app.model.User.belongsTo(app.model.Company, { foreignKey: 'company_id', as: 'c' });
    };*/
    return Model;
};
