/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, TINYINT } = app.Sequelize;
    const Model = app.model.define('alert', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false
           
        },
        transaction_id: {
          type: STRING(100),
          allowNull: false,
          defaultValue: ''
        },
        flow_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
        },
        flow_id_to: {
            type: UUID,
            allowNull: true,
            defaultValue: ''
        },
        alertrule_type: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        type: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 0
        },

        
       
    }, {
        indexes: [
            {
                unique: true,
                fields: ['transaction_id', 'alert_rule_id']
        }],
        
        timestamps: false,
        tableName: 'alert'
        
    });
    Model.associate = function () {
        app.model.Alert.belongsTo(app.model.Transaction, { foreignKey: 'transaction_id', as: 't' });
        
    };
    return Model;
};
