/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, DataTypes } = app.Sequelize;
    const Model = app.model.define('jetty', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        company_id: {
            type: UUID

        },
        name: {
            type: STRING(100)

        },
        depth_alongside: {
            type: STRING(100)

        },
        depth_approaches: {
            type: STRING(100)

        },
        max_loa: {
            type: STRING(100)

        },
        min_loa: {
            type: STRING(100)

        },
        max_displacement: {
            type: STRING(100)

        },
        mla_envelop_at_mhws_3m: {
            type: STRING(100)

        },
        terminal_id: {
            type: UUID

        },
         remarks: {
            type: TEXT

        }
    }, {
        indexes: [
            {
                fields: ['name']
            }],

        timestamps: false,
        tableName: 'jetty'

    });

    return Model;
};
