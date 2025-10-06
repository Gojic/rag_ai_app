'use strict';
const {
  Model,
  Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Document.belongsTo(models.Collection, { foreignKey: 'collectionId' });
      Document.hasMany(models.DocumentChunks, { foreignKey: 'documentId' });

    }
  }
  Document.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PENDING'
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    checksum: {
      type: Sequelize.STRING,
      allowNull: true
    },
    orgid: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'ORG_DEMO'
    },
    collectionId: { type: DataTypes.INTEGER, allowNull: true },
    s3Key: { type: DataTypes.STRING, allowNull: false },
    s3Url: { type: DataTypes.STRING, allowNull: true },


  }, {
    sequelize,
    modelName: 'Document',
  });
  return Document;
};