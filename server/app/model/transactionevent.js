/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER,UUID } = app.Sequelize;
    const Model = app.model.define('transaction_event', {
        id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        transaction_id: UUID,
        flow_id: UUID,
        flow_pid: UUID,
        event_time: {
            type: DATE,
            allowNull: false,
            defaultValue: ''
        },
        work_order_id: {
            type: STRING(50),
            allowNull: true,
            defaultValue: ''
        },
        product_type: {
            type: STRING(100),
            allowNull: true,
            defaultValue: ''
        },
        tank_id: {
            type: STRING(50),
            allowNull: true,
            defaultValue: ''
        },
        volume: {
            type: INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        unit_of_Measurement: {
            type: STRING(20),
            allowNull: true,
            defaultValue: ''
        },
        bliockchain_hex_key: {
            type: STRING(200),
            allowNull: true,
            defaultValue: ''
        }
       
    }, {
        indexes: [
            {
                unique: true,
                fields: ['flow_id', 'transaction_id']
            },
            {
                fields: [ 'flow_pid', 'event_time']
            }],
          charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
        freezeTableName: true,
        timestamps: false,
        tableName: 'transaction_event',
        underscored: true,
    });
    Model.associate = function () {
       
        app.model.Transactionevent.belongsTo(app.model.Transaction, {foreignKey: 'transaction_id',as:'t'});
        
        
    };
    return Model;
};
