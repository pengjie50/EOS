/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TEXT, DataTypes } = app.Sequelize;
    const Model = app.model.define('report', {
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
        template_name: {
            type: STRING(100)

        },
        value: {
            type: TEXT

        },
        description: {
          type: TEXT
        
        }
       
    }, {
        indexes: [
        {
          fields: ['name']
        }],
        timestamps: true,
        paranoid: false,
        tableName: 'report',
       
    });

     Model.associate = function () {
       
       
         app.model.Report.belongsTo(app.model.Company, {foreignKey: 'company_id',as:'c'});
        
    };
    
    return Model;
};
