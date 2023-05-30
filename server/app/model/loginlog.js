/*
* @ author Administrator
* @ time   2018/11/14/014 12:58
* @ description
* @ param
*/
'use strict'
module.exports = app => {
    const { DATE, STRING, INTEGER, UUID, TINYINT, DataTypes } = app.Sequelize;
    const Model = app.model.define('login_log', {
        id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4

        },
        user_id: {
            type: UUID
           
        },
        username: {
          type: STRING(100)
         
        },
        ip: {
            type: STRING(128)
           
        },
        browser: {
            type: STRING(50)
           
        },
        os: {
            type: STRING(50)
          
        },
        status: {
            type: TINYINT
           
        },
        err_code: {
            type: INTEGER
           
        },
        login_time: {
            type: DATE
           
        }
   
    }, {
        indexes: [
        {
                fields: ['username', 'login_time', 'status','user_id']
        }],
        timestamps: false,
        tableName: 'login_log'
      
    });
    Model.associate = function () {
       app.model.Loginlog.belongsTo(app.model.User, { foreignKey: 'user_id',as:'u'});
        
    };
    return Model;
};
