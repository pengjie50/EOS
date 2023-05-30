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

        
       
    }, {
        indexes: [
            {
                
                fields: ['transaction_id', 'user_id', 'company_id','type']
        }],
        
        timestamps: false,
        tableName: 'alert'
        
    });
    Model.associate = function () {
        app.model.Alert.belongsTo(app.model.Transaction, { foreignKey: 'transaction_id', as: 't' });
        
    };
    return Model;
};
