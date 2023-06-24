/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TINYINT, DataTypes, TEXT } = app.Sequelize;
    const Model = app.model.define('oper_log', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        request_method: {
            type: STRING(10)
          
        },
        type: {
            type: STRING(10)
         
        },
        param: {
          type: STRING(2000)
         
        },
        result: {
            type: STRING(2000)
           
        },
        module: {
            type: STRING(50)
           
        },
        action: {
            type: STRING(50)
           
        },
        url: {
          type: STRING(255)
          
        },
        ip: {
          type: STRING(128)
        
        },
        user_id: {
            type: UUID
          
        },
        
        status: {
            type: TINYINT
           
        },
        err_code: {
            type: INTEGER
           
        },
        username: {
            type: STRING(100)
           
        },
        oper_time: {
            type: DATE
           
        },
        remarks: {
            type: TEXT

        }

    }, {
        indexes: [
        {
                fields: ['type', 'oper_time', 'status', 'user_id', 'module','action']
        }],
        timestamps: false,
        tableName: 'oper_log',
       
    });
    Model.associate = function () {
        app.model.Operlog.belongsTo(app.model.User, { foreignKey: 'user_id',as:'u'});
       
    };
    return Model;
};
