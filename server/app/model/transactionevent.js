/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, DataTypes } = app.Sequelize;
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
        work_order_status:{
            type: STRING(50)

        },
        product_name: {
            type: STRING(100)
         
        },
        "product_quantity_in_l_obs": {
            type: INTEGER

        },
        "product_quantity_in_l_15_c": {
            type: INTEGER

        },
        "product_quantity_in_mt": {
            type: INTEGER

        },
        "product_quantity_in_mtv": {
            type: INTEGER

        },
        "product_quantity_in_bls_60_f": {
            type: INTEGER

        },
        tank_number: {
            type: STRING(50)

        },
        order_sequence_number:{
            type: STRING(50)

        },
     
        surveyor: {
            type: STRING(200)

        },
        location_to: {
            type: STRING(200)

        },
        location_from: {
            type: STRING(200)

        },
        delay_duration: {
            type: STRING(200)

        },
        delay_reason: {
            type: STRING(200)

        },
        
        blockchain_hex_key: {
            type: STRING(200)
           
        }
       
    }, {
        indexes: [
            {
                unique: true,
                fields: ['flow_id', 'transaction_id']
            },
            {
                fields: [ 'flow_pid']
            },
            {
                fields: [ 'event_time']
            }
        ],
       
        timestamps: false,
        tableName: 'transaction_event',
      
    });
    Model.associate = function () {
       
        app.model.Transactionevent.belongsTo(app.model.Transaction, {foreignKey: 'transaction_id',as:'t'});
        
        
    };
    return Model;
};
