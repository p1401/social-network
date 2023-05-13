const db = require('../db/config');
const User = require('./user');
const Post = require('./post');
const { Sequelize, DataTypes, Deferrable } = require('sequelize');

const PostLike = db.define(
  'post_like',
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      }
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: 'id',
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      }
    }
  }, {
    index: [
      {
        name: 'index_post1',
        fields: ['user_id'],
      },
      {
        name: 'index_post2',
        fields: ['post_id'],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);

Post.hasMany(PostLike, { foreignKey: 'post_id' });
PostLike.belongsTo(Post, { foreignKey: 'user_id' });
User.hasMany(PostLike, { foreignKey: 'user_id' });
PostLike.belongsTo(User);

module.exports = PostLike;