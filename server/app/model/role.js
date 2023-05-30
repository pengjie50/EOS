/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, DataTypes } = app.Sequelize;
    const Model = app.model.define('role', {
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
        description: {
          type: TEXT
        
        }
       
    }, {
        indexes: [
        {
          fields: ['name']
        }],
        timestamps: false,
        tableName: 'role',
       
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
