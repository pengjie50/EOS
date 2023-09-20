/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, DataTypes, DOUBLE } = app.Sequelize;
    const Model = app.model.define('transaction_event', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        transaction_id: UUID,
        flow_id: UUID,
        flow_pid: UUID,
        event_time: {
            type: DATE

        },
        work_order_id: {
            type: STRING(50)

        },
        work_order_status: {
            type: STRING(50)

        },


        work_order_operation_type: {
            type: STRING(100)

        },
        product_name: {
            type: STRING(100)

        },
        "product_quantity_in_l_obs": {
            type: DOUBLE

        },
        "product_quantity_in_l_15_c": {
            type: DOUBLE

        },
        "product_quantity_in_mt": {
            type: DOUBLE

        },
        "product_quantity_in_mtv": {
            type: DOUBLE

        },
        "product_quantity_in_bls_60_f": {
            type: DOUBLE

        },
        tank_number: {
            type: STRING(50)

        },


        work_order_sequence_number_status: {
            type: STRING(50)

        },
        work_order_sequence_number: {
            type: STRING(50)

        },
        order_no: {
            type: STRING(50)

        },
        work_order_surveyor: {
            type: STRING(200)

        },
        cancellation_requestor: {
            type: STRING(200)

        },
        location_to: {
            type: STRING(200)

        },
        location_from: {
            type: STRING(200)

        },
        delay_duration: {
            type: INTEGER

        },
        delay_reason: {
            type: STRING(200)

        },
        arrival_id_status: {
            type: STRING(50)

        },
        blockchain_hex_key: {
            type: STRING(200)

        },
        blockchain_hex_key: {
            type: STRING(200)

        },
        event_sub_stage: {
            type: INTEGER

        }
        

    }, {
        indexes: [
            {

                fields: ['flow_id', 'transaction_id']
            },
            {
                fields: ['flow_pid']
            },
            {
                fields: ['event_time']
            },
            {
                fields: ['event_sub_stage']
            }
        ],

        timestamps: true,
        paranoid: false,

        tableName: 'transaction_event',

    });
    Model.associate = function () {

        app.model.Transactionevent.belongsTo(app.model.Transaction, { foreignKey: 'transaction_id', as: 't' });
        app.model.Transactionevent.belongsTo(app.model.Flow, { foreignKey: 'flow_id', as: 'f' });

    };
    return Model;
};
