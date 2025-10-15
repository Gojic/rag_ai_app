'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Collection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Collection.hasMany(models.Document, { foreignKey: 'collectionId' });
      Collection.belongsTo(models.User, { foreignKey: 'userId' })

    }
  }
  Collection.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    orgid: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Collection',
  });
  return Collection;
};