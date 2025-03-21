/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, TINYINT, UUID, TEXT, DataTypes } = app.Sequelize;
    const Model = app.model.define('user_config', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        name: {
            type: STRING(100)

        },
        company_id: {
            type: UUID

        },
        user_id: {
            type: UUID

        },
        type: {
            type: TINYINT

        },
        value: {
            type: TEXT

        }



    }, {
        indexes: [
            {
                fields: ['name', 'user_id', 'type']
            }],

        timestamps: false,
        tableName: 'user_config'

    });

    return Model;
};
