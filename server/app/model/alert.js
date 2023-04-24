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
        alert_rule_id: {
            type: UUID,
            allowNull: false,
            defaultValue: ''
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
        app.model.Alert.belongsTo(app.model.Alertrule, { foreignKey: 'alert_rule_id', as: 'a' });
    };
    return Model;
};
