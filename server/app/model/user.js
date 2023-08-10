/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TINYINT, DataTypes } = app.Sequelize;
    const Model = app.model.define('user', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        username: {
            type: STRING(100)

        },
        nickname: {
            type: STRING(100)

        },
        sex: {
            type: TINYINT

        },
        avatar: {
            type: STRING(100)

        },
        password: {
            type: STRING(100)

        },
        email: {
            type: STRING(100)

        },
        phone: {
            type: STRING(100)

        },
        phone: {
            type: STRING(100)

        },
        role_id: {
            type: UUID

        },
        company_id: {
            type: UUID

        },
        status: {
            type: TINYINT

        },
        online_status: {
            type: TINYINT

        },
        profile: {
            type: STRING(500)

        },

        login_time: {
            type: DATE

        },

        logout_time: {
            type: DATE

        },

        login_token: {
            type: STRING(500)

        },

    }, {
        indexes: [
            {
                unique: true,
                fields: ['id', 'username']
            }, {

                fields: ['username', 'email', 'phone']
            }],
        timestamps: true,
        paranoid: false,
        tableName: 'user'
    });
    Model.associate = function () {
        app.model.User.belongsTo(app.model.Role, { foreignKey: 'role_id', as: 'r' });
        app.model.User.belongsTo(app.model.Company, { foreignKey: 'company_id', as: 'c' });
    };
    return Model;
};
