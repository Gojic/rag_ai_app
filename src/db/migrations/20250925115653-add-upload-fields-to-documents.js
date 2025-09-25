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

    await queryInterface.addColumn('Documents', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PENDING'
    });
    await queryInterface.addColumn('Documents', 'mimeType', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Documents', 'size', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Documents', 'path', {
      type: Sequelize.STRING,
      allowNull: true
    });
    // priprema za deduplikaciju (opciono odmah, preporuka) korisika sprecavamo da slucajno uplajduje dva ista dokumenta
    await queryInterface.addColumn('Documents', 'checksum', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Documents', 'orgId', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'ORG_DEMO'
    })
    //„Za svaku organizaciju (orgId), kombinacija (orgId, checksum) mora biti jedinstvena.“
    //Praktično: u okviru jedne organizacije ne mogu postojati dva dokumenta sa istim checksum-om.
    //Indeks = brza pretraga + zabrana duplikata (ako je unique).
    await queryInterface.addIndex('Documents', ['orgId', 'checksum'],
      {
        unique: true,
        name: 'documents_org_checksum_unique'
      }
    )
  },

  async down(queryInterface, Sequelize) {


    await queryInterface.removeIndex('Documents', 'documents_org_checksum_unique');
    await queryInterface.removeColumn('Documents', 'checksum');
    await queryInterface.removeColumn('Documents', 'orgId');
    await queryInterface.removeColumn('Documents', 'path');
    await queryInterface.removeColumn('Documents', 'size');
    await queryInterface.removeColumn('Documents', 'mimeType');
    await queryInterface.removeColumn('Documents', 'status');

  }
};
