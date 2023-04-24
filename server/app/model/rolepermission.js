/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER,UUID } = app.Sequelize;
    const Model = app.model.define('role_permission', {
        id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        role_id: UUID,
        permission_id:UUID
       
    }, {
          charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
        freezeTableName: true,
        timestamps: false,
        tableName: 'role_permission',
        underscored: true,
    });
    Model.associate = function () {
       
        app.model.Rolepermission.belongsTo(app.model.Permission, {foreignKey: 'permission_id',as:'p'});
        app.model.Rolepermission.belongsTo(app.model.Role, {foreignKey: 'role_id',as:'r'});
        
    };
    return Model;
};
