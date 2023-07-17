/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TINYINT, DataTypes } = app.Sequelize;
    const Model = app.model.define('login_log', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        user_id: {
            type: UUID

        },
        company_id: {
            type: UUID

        },
        url: {
            type: STRING(255)

        },
        ip: {
            type: STRING(128)

        },
        browser: {
            type: STRING(50)

        },
        os: {
            type: STRING(50)

        },
        device_type: {
            type: STRING(20)

        },
        invalid_attempts:
        {
            type: TINYINT

        },
        logout_time: {
            type: DATE

        },
        active_duration: {
            type: INTEGER
        },
        status: {
            type: TINYINT

        },
        err_code: {
            type: INTEGER

        },
        login_time: {
            type: DATE

        }

    }, {
        indexes: [
            {
                fields: ['username', 'login_time', 'status', 'user_id']
            }],
        timestamps: false,
        tableName: 'login_log'

    });
    Model.associate = function () {
        app.model.Loginlog.belongsTo(app.model.User, { foreignKey: 'user_id', as: 'u' });
        app.model.Loginlog.belongsTo(app.model.Company, { foreignKey: 'company_id', as: 'c' });
    };
    return Model;
};
