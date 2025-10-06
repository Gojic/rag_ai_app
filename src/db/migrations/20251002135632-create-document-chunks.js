'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DocumentChunks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      documentId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Documents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      chunkIndex: { type: Sequelize.INTEGER, allowNull: false },
      text: { type: Sequelize.TEXT('long'), allowNull: false },
      page: { type: Sequelize.INTEGER, allowNull: true },
      heading: { type: Sequelize.STRING, allowNull: true },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex("DocumentChunks", ["documentId", "chunkIndex"], {
      unique: true, name: "docchunks_docid_idx"
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DocumentChunks');
  }
};