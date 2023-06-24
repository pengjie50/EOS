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
        product_type: {
            type: STRING(100)
         
        },
        tank_id: {
            type: STRING(50)
           
        },
        volume: {
            type: INTEGER
           
        },
        unit_of_measurement: {
            type: STRING(20)
           
        },
        bliockchain_hex_key: {
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
