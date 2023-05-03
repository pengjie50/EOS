/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, TINYINT,UUID,TEXT } = app.Sequelize;
    const Model = app.model.define('transaction', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false
           
        },
        status: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        }, 
        start_of_transaction: {
            type: DATE,
            allowNull: true,
            defaultValue: ''
        },
        end_of_transaction: {
            type: DATE,
            allowNull: true,
            defaultValue: null
        },
      
        arrival_id: {
            type: STRING(100),
            allowNull: true,
            defaultValue: null
        },
      
        product_type_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        },
        product_of_volume: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        size_of_vessel: {
            type: INTEGER,
            allowNull: true,
            defaultValue: null
        },
        flow_id: {
            type: STRING(200),
            allowNull: false,
            defaultValue: ''
        },
        imo_number: {
            type: STRING(200),
            allowNull: false,
            defaultValue: ''
        },
        vessel_name: {
            type: STRING(200),
            allowNull: false,
            defaultValue: ''
        },
        terminal_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        },
        jetty_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        },
        total_duration: {
            type: INTEGER,
            allowNull: true,
            defaultValue: null
        },
        
        total_nominated_quantity_b: {
            type: INTEGER,
            allowNull: true,
            defaultValue: null
        },
       total_nominated_quantity_m: {
            type: INTEGER,
            allowNull: true,
           defaultValue: null
        },
        bliockchain_hex_key: {
            type: STRING(200),
            allowNull: true,
            defaultValue: ''
        }
    }, {
        indexes: [
        {
                fields: ['start_of_transaction', 'end_of_transaction', 'product_type_id', 'imo_number', 'vessel_name', 'jetty_id','terminal_id']
        }],
        
        timestamps: false,
        tableName: 'transaction'
        
    });
    
    return Model;
};
