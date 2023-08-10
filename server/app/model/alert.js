/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, TINYINT, DataTypes } = app.Sequelize;
    const Model = app.model.define('alert', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        alert_id: {
            type: INTEGER,
            allowNull: false,
            autoIncrement: true

        },
        company_id: {
            type: UUID

        },
        transaction_id: {
            type: UUID

        },
        alert_rule_transaction_id: {
            type: UUID

        },

        flow_id: {
            type: UUID,

        },
        user_id: {
            type: UUID

        },
        flow_id_to: {
            type: UUID

        },
        alertrule_type: {
            type: TINYINT

        },

        type: {
            type: TINYINT

        },
        total_duration: {
            type: INTEGER
        },
        work_order_id: {
            type: STRING(50)

        },
        transaction_event_id_to: {
            type: UUID

        },
        transaction_event_id_from: {
            type: UUID

        },

        work_order_sequence_number: {
            type: STRING(50)

        },
        remarks: {
            type: TEXT

        }


    }, {
        initialAutoIncrement: 1000,
        indexes: [
            {

                fields: ['transaction_id', 'user_id', 'company_id', 'type', 'alert_rule_transaction_id', 'flow_id', 'flow_id_to']
            }],

        timestamps: true,
        paranoid: false,
        tableName: 'alert'

    });
    Model.associate = function () {
        app.model.Alert.belongsTo(app.model.Transaction, { foreignKey: 'transaction_id', as: 't' });
       
        app.model.Alert.belongsTo(app.model.AlertruleTransaction, { foreignKey: 'alert_rule_transaction_id', as: 'ar' });

    };
    return Model;
};
