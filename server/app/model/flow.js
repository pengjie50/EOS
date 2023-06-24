/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    
    const { DATE, STRING, INTEGER, UUID, TEXT, TINYINT, DataTypes } = app.Sequelize;
    const Model = app.model.define('flow', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
          type: STRING(100)
         
        },
        icon: {
            type: STRING(100)
          
        },
        type: {
            type: TINYINT
         
        },
        code: {
            type: INTEGER

        },
        sort: {
            type: INTEGER
          
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
                fields: ['name','code']
        }],
        tableName: 'flow'
    });

    Model.associate = function () {
       
       // app.model.Company.belongsTo(app.model.Company, {foreignKey: 'pid',as:'pc'});
       
        
    };
    
    return Model;
};
