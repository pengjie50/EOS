/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, TINYINT, DataTypes } = app.Sequelize;
    const Model = app.model.define('alert_rule', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        alertrule_id: {
            type: INTEGER,
            allowNull: false,
            autoIncrement: true

        },
        user_id: {
            type: UUID

        },
        company_id: {
            type: UUID

        },
        flow_id: {
            type: UUID

        },
        flow_id_to: {
            type: UUID

        },
       

        product_quantity_from: {
            type: INTEGER,

        },
        product_quantity_to: {
            type: INTEGER,

        },
        uom: {
            type: STRING(20)

        },
        vessel_size_dwt_from: {
            type: INTEGER,

        },
        vessel_size_dwt_to: {
            type: INTEGER,

        },
        amber_hours: {
            type: INTEGER,

        },
        amber_mins: {
            type: INTEGER,

        },
        red_hours: {
            type: INTEGER,

        },
        red_mins: {
            type: INTEGER,

        },
        email: {
            type: TEXT,

        },

        type: {
            type: TINYINT


        },


    }, {
        indexes: [
            {
                fields: ['company_id', 'alertrule_id']
            },
            {
                fields: ['flow_id', 'type', 'user_id', 'vessel_size_dwt_from', 'vessel_size_dwt_to']
            },
            {
                fields: ['product_quantity_from', 'product_quantity_to']
            }
           

        ],

        timestamps: true,
        paranoid: false,
        tableName: 'alert_rule'

    });
    Model.associate = function () {
        app.model.Alertrule.belongsTo(app.model.User, { foreignKey: 'user_id', as: 'u' });
        app.model.Alertrule.belongsTo(app.model.Company, { foreignKey: 'company_id', as: 'c' });
    };
    return Model;
};
