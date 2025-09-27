'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Documents', 'collectionId', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addColumn('Documents', 's3Key', {
      type: Sequelize.STRING,
      allowNull: false
    })

    await queryInterface.addColumn('Documents', 's3Url', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    // 3) (Opcionalno, preporuka) indeks za brže pronalaženje i deduplikaciju
    await queryInterface.addIndex('Documents', ['orgid', 's3Key'], {
      unique: true,                   // jedan isti s3Key po organizaciji
      name: 'documents_orgid_s3key_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('Documents', 'documents_orgid_s3key_unique').catch(() => { });
    await queryInterface.removeColumn('Documents', 's3Url');
    await queryInterface.removeColumn('Documents', 's3Key');
    await queryInterface.removeColumn('Documents', 'collectionId');
  }
};
