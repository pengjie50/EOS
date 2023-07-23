/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {

    const { DATE, STRING, INTEGER, UUID, TEXT, TINYINT, DataTypes } = app.Sequelize;
    const Model = app.model.define('company', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        company_id: {
            type: INTEGER,
            allowNull: false,
            autoIncrement: true

        },
        name: {
            type: STRING(200)

        },
        alias: {
            type: STRING(200)

        },

        contacts: {
            type: STRING(100)

        },
        email: {
            type: STRING(100)

        },
        type: {
            type: STRING(100)

        },
        phone: {
            type: STRING(12)

        },
        pid: {
            type: UUID

        },
        description: {
            type: TEXT

        }
    }, {
        indexes: [
            {
                fields: ['name', 'phone', 'email', 'alias']
            }],
        tableName: 'company'
    });

    Model.associate = function () {

        // app.model.Company.belongsTo(app.model.Company, {foreignKey: 'pid',as:'pc'});


    };

    return Model;
};
