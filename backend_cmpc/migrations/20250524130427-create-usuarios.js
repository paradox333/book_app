'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createSchema('cmpc');

    await queryInterface.createTable(
      { schema: 'cmpc', tableName: 'usuarios' },
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        email: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false,
        },
        password_hash: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        deletedat: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ schema: 'cmpc', tableName: 'usuarios' });
    // No borramos schema para evitar errores si otros usan cmpc
  },
};
