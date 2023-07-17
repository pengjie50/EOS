/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, DataTypes } = app.Sequelize;
    const Model = app.model.define('sys_config', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        name: {
            type: STRING(100)

        },
        config_key: {
            type: STRING(100)

        },
        value: {
            type: STRING(500)

        },
        description: {
            type: TEXT

        }



    }, {
        indexes: [
            {
                fields: ['name']
            }],

        timestamps: false,
        tableName: 'sys_config'

    });

    return Model;
};
