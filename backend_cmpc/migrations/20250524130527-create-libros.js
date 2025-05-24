'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createSchema('cmpc');

    await queryInterface.createTable(
      { schema: 'cmpc', tableName: 'libros' },
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        titulo: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        autor_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: 'cmpc', tableName: 'autores' },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        editorial_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: 'cmpc', tableName: 'editoriales' },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        genero_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: 'cmpc', tableName: 'generos' },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        precio: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        disponible: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        imagen_url: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        deletedat: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ schema: 'cmpc', tableName: 'libros' });
  },
};
