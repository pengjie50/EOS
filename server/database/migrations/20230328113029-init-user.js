'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        
        const { DATE, STRING, INTEGER, UUID, TINYINT } = Sequelize;
        await queryInterface.createTable('user', {
            id: {
                type: UUID,
                primaryKey: true,
                allowNull: false

            },
            username: {
                type: STRING(100),
                allowNull: false,
                defaultValue: ''
            },
            nickname: {
                type: STRING(100),
                allowNull: false,
                defaultValue: ''
            },
            password: {
                type: STRING(100),
                allowNull: false,
                defaultValue: ''
            },
            email: {
                type: STRING(100),
                allowNull: false,
                defaultValue: ''
            },
            phone: {
                type: STRING(100),
                allowNull: false,
                defaultValue: ''
            },
            role_id: UUID,
            company_id: UUID,
            status: {
                type: TINYINT,
                allowNull: false,
                defaultValue: 1
            },
            created_at: DATE,
            updated_at: DATE,
        }, {
            indexes: [
                {
                    fields: ['username', 'phone']
                }],
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            freezeTableName: true,
            timestamps: false,
            tableName: 'user',
            underscored: true,
        });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
