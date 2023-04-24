/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER,UUID,TEXT } = app.Sequelize;
    const Model = app.model.define('role', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false
        },
        name: {
          type: STRING(100),
          allowNull: false,
          defaultValue: ''
        },
        company_id: {
          type: UUID,
          allowNull: false,
          defaultValue: ''
        },
        description: {
          type: TEXT,
          allowNull: false,
          defaultValue: ''
        }
       
    }, {
        indexes: [
        {
          fields: ['name']
        }],
          charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
        freezeTableName: true,
        timestamps: false,
        tableName: 'role',
        underscored: true,
    });

     Model.associate = function () {
       
        app.model.Role.belongsToMany(app.model.Permission, {
            as:'p',
            through: app.model.Rolepermission,
            foreignKey: 'role_id',
            otherKey: 'permission_id'
        });
        app.model.Role.belongsTo(app.model.Company, {foreignKey: 'company_id',as:'c'});
        
    };
    
    return Model;
};
