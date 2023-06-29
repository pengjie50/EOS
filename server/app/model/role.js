/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, DataTypes, TINYINT } = app.Sequelize;
    const Model = app.model.define('role', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        role_id: {
            type: INTEGER,
            allowNull: false,
            autoIncrement: true

        },
        name: {
          type: STRING(100)
          
        },
        type: {
            type: STRING(100)

        },
        company_id: {
          type: UUID
        
        },
        accessible_organization: {
            type: TEXT

        },
        accessible_feature: {
            type: TEXT

        },
        
        
        accessible_timestamp: {
            type: TEXT

        },
        description: {
          type: TEXT
        
        }
       
    }, {
        indexes: [
        {
          fields: ['name','type']
        }],
        timestamps: true,
        paranoid: false,
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
