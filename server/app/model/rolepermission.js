/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, DataTypes } = app.Sequelize;
    const Model = app.model.define('role_permission', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        role_id: UUID,
        permission_id: UUID

    }, {
        indexes: [
            {
                fields: ['role_id', 'permission_id']
            }],
        timestamps: false,
        tableName: 'role_permission',

    });
    Model.associate = function () {

        app.model.Rolepermission.belongsTo(app.model.Permission, { foreignKey: 'permission_id', as: 'p' });
        app.model.Rolepermission.belongsTo(app.model.Role, { foreignKey: 'role_id', as: 'r' });

    };
    return Model;
};
