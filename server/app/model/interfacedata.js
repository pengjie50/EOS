/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, TINYINT, DataTypes } = app.Sequelize;
    const Model = app.model.define('interfacedata', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        transaction_id: {
            type: UUID,
        },
        eos_id: {
            type: INTEGER,
        },
        imo_number: {
            type: STRING(20)

        },
        work_order_id: {
            type: STRING(20)
        },
        type: {
            type: TINYINT   //DE1  DE2  DE3  DE4 
        },
        json_string: {
            type: TEXT

        },
        already_used: {
            type: TINYINT

        }
    }, {
        indexes: [
            {
                fields: ['imo_number', 'work_order_id', 'type']
            }],

        timestamps: true,
        paranoid: false,
        tableName: 'interfacedata'
    });

    return Model;
};
