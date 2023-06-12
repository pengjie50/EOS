/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, TINYINT, DataTypes } = app.Sequelize;
    const Model = app.model.define('AlertruleTransaction', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        company_id: {
            type: UUID

        },
        transaction_id: {
            type: UUID

        },
        amber: {
            type: TINYINT


        },
        red: {
            type: TINYINT


        },
        alert_rule_id: {
            type: UUID

        },
        user_id: {
            type: UUID

        },
        flow_id: {
            type: UUID

        },
        flow_id_to: {
            type: UUID

        },
        total_nominated_quantity_from_m: {
            type: INTEGER,

        },
        total_nominated_quantity_to_m: {
            type: INTEGER,

        },
        total_nominated_quantity_from_b: {
            type: INTEGER,

        },
        total_nominated_quantity_to_b: {
            type: INTEGER,

        },

        size_of_vessel_from: {
            type: INTEGER,

        },
        size_of_vessel_to: {
            type: INTEGER,

        },
        amber_hours: {
            type: INTEGER,

        },
        amber_mins: {
            type: INTEGER,

        },
        red_hours: {
            type: INTEGER,

        },
        red_mins: {
            type: INTEGER,

        },
        email: {
            type: STRING(2000),

        },
        send_email_select: {
            type: STRING(100),

        },

        type: {
            type: TINYINT


        },


    }, {
        indexes: [
            {
                fields: ['transaction_id', 'alert_rule_id']
            },
            
            {
                fields: ['flow_id', 'type', 'user_id', 'size_of_vessel_from', 'size_of_vessel_to']
            },
            {
                fields: ['total_nominated_quantity_from_m', 'total_nominated_quantity_to_m']
            },
            {
                fields: ['total_nominated_quantity_from_b', 'total_nominated_quantity_to_b']
            }

        ],

        timestamps: true,
        paranoid: false,
        tableName: 'alert_rule_transaction'
        
    });
   
    return Model;
};
