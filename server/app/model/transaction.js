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
           // type: STRING(100)
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
        product_name: {
            type: STRING(200)
          
        },
      
       
        vessel_size_dwt: {
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
        
        agent: {
            type: STRING(200)
        },
        "product_quantity_in_l_obs" : {
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
        blockchain_hex_key: {
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
