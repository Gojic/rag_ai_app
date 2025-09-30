'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // 1) Menjamo tip kolone collectionId u Documents (STRING → INTEGER)
    //    jer želimo da bude FK ka Collections.id (koji je int).
    await queryInterface.changeColumn('Documents', 'collectionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 2) Dodajemo foreign key constraint na Documents.collectionId
    //    - povezuje se sa Collections.id
    //    - ako obrišemo kolekciju → obrišu se svi njeni dokumenti (ON DELETE CASCADE)
    //    - ako se update-uje PK u Collections → update-uje se i ovde (ON UPDATE CASCADE)
    await queryInterface.addConstraint('Documents', {
      fields: ['collectionId'],
      type: 'foreign key',
      name: 'fk_documents_collection',
      references: {
        table: 'Collections',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    // 3) Dodajemo UNIQUE constraint na kombinaciju (orgid, name) u Collections
    //    - garantuje da unutar jedne organizacije ne može postojati
    //      više kolekcija sa istim imenom
    await queryInterface.addConstraint('Collections', {
      fields: ['orgid', 'name'],
      type: 'unique',
      name: 'unique_orgid_name',
    });
    // 4) Dodajemo index na Documents.collectionId
    //    - brže pretrage dokumenata po kolekciji
    await queryInterface.addIndex('Documents', ['collectionId'], {
      name: 'idx_documents_collectionId',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Documents', 'idx_documents_collectionId').catch(() => { });

    await queryInterface.removeConstraint('Documents', 'fk_documents_collection').catch(() => { });

    await queryInterface.changeColumn('Documents', 'collectionId', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.removeConstraint('Collections', 'unique_orgid_name').catch(() => { });
  }
};
