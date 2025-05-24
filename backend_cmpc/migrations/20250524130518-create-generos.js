'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createSchema('cmpc');

    await queryInterface.createTable(
      { schema: 'cmpc', tableName: 'generos' },
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ schema: 'cmpc', tableName: 'generos' });
  },
};
