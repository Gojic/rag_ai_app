'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentChunks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DocumentChunks.belongsTo(models.Document, { foreignKey: 'documentId' })
    }
  }
  DocumentChunks.init({

    documentId: { type: DataTypes.INTEGER, allowNull: false },
    chunkIndex: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT('long'), allowNull: false },
    page: { type: DataTypes.INTEGER, allowNull: true },
    heading: { type: DataTypes.STRING, allowNull: true },
  }, {
    sequelize,
    modelName: 'DocumentChunks',
  });
  return DocumentChunks;
};