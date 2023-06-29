/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, DataTypes } = app.Sequelize;
    const Model = app.model.define('transaction_event_detail', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        transaction_event_id: UUID,
       
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
                
                fields: [ 'transaction_event_id']
            },
           
        ],
       
        timestamps: false,
        tableName: 'transaction_event_detail',
      
    });
   
    return Model;
};
