'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createSchema('cmpc');

    await queryInterface.createTable(
      { schema: 'cmpc', tableName: 'autores' },
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        nombre: {
          type: Sequelize.STRING(255),
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
    await queryInterface.dropTable({ schema: 'cmpc', tableName: 'autores' });
  },
};
