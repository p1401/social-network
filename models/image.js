const db = require('../db/config');
const Post = require('./post');
const { Sequelize, DataTypes, Deferrable } = require('sequelize');

const Image = db.define(
  'image',
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: 'id',
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    }
  }, {
    index: [
      {
        name: 'index_image',
        fields: ['post_id'],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);

Post.hasMany(Image, { foreignKey: 'post_id' });
Image.belongsTo(Post);

module.exports = Image;
