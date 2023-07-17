/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, DataTypes } = app.Sequelize;
    const Model = app.model.define('permission', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        pid: {
            type: UUID

        },
        sort: {
            type: INTEGER

        },
        name: {
            type: STRING(200)

        },
        permission_key: {
            type: STRING(100)

        },
        description: {
            type: TEXT

        }



    }, {
        indexes: [
            {
                fields: ['name', 'permission_key']
            }],

        timestamps: false,
        tableName: 'permission'

    });

    return Model;
};
