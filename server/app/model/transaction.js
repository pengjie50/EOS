/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, TINYINT, UUID, TEXT, DataTypes } = app.Sequelize;
    const Model = app.model.define('transaction', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
           
        },
        eos_id: {
            type: INTEGER,
            allowNull: false,
            autoIncrement: true
            
        },
        status: {
            type: TINYINT
            
        }, 
        start_of_transaction: {
            type: DATE
           
        },
        end_of_transaction: {
            type: DATE
         
        },
      
        arrival_id: {
            type: STRING(100)
           
        },
        product_type: {
            type: STRING(200)
          
        },
      
        product_of_volume: {
            type: INTEGER
           
        },
        size_of_vessel: {
            type: INTEGER
           
        },
        flow_id: {
            type: STRING(200)
            
        },
        imo_number: {
            type: STRING(200)
            
        },
        vessel_name: {
            type: STRING(200)
        },
        terminal_id: {
            type: UUID
           
        },
        trader_id: {
            type: UUID

        },
        jetty_id: {
            type: UUID
            
        },
        total_duration: {
            type: INTEGER
        },
        
        total_nominated_quantity_b: {
            type: INTEGER
          
        },
       total_nominated_quantity_m: {
            type: INTEGER
           
        },
        bliockchain_hex_key: {
            type: STRING(200)
           
        },
        remarks: {
            type: TEXT
           
        }
        

    }, {
        indexes: [
            {
                unique: true,
                fields: ['eos_id']
            },
        {
                fields: ['start_of_transaction', 'end_of_transaction', 'imo_number', 'vessel_name', 'jetty_id', 'terminal_id']
        }],
        
        timestamps: false,
        tableName: 'transaction'
        
    });
    
    return Model;
};
