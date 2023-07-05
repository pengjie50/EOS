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
        alert_rule_id: {
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
        
        alertrule_id: {
            type: INTEGER,
            allowNull: false,
            autoIncrement: true

        },
        company_id: {
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
        product_quantity_in_mt_from: {
            type: INTEGER,

        },
        product_quantity_in_mt_to: {
            type: INTEGER,

        },
        product_quantity_in_bls_60_f_from: {
            type: INTEGER,

        },
        product_quantity_in_bls_60_f_to: {
            type: INTEGER,

        },

        vessel_size_dwt_from: {
            type: INTEGER,

        },
        vessel_size_dwt_to: {
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
                fields: ['transaction_id', 'alert_rule_id','alertrule_id']
            },
            
            {
                fields: ['flow_id', 'type', 'user_id', 'vessel_size_dwt_from', 'vessel_size_dwt_to']
            },
            {
                fields: ['product_quantity_in_mt_from', 'product_quantity_in_mt_to']
            },
            {
                fields: ['product_quantity_in_bls_60_f_from', 'product_quantity_in_bls_60_f_to']
            }

        ],

        timestamps: true,
        paranoid: false,
        tableName: 'alert_rule_transaction'
        
    });
   
    return Model;
};
