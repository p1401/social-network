const db = require('../db/config');
const User = require('./user');
const Post = require('./post');
const { Sequelize, DataTypes, Deferrable } = require('sequelize');

const PostComment = db.define(
  'post_comment',
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    parent_comment_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: 'id',
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    total_like: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_comment: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    index: [
      {
        name: 'index_cmt1',
        fields: ['user_id'],
      },
      {
        name: 'index_cmt2',
        fields: ['post_id'],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);

Post.hasMany(PostComment, { foreignKey: 'post_id' });
PostComment.belongsTo(Post, { foreignKey: 'user_id' });
User.hasMany(PostComment, { foreignKey: 'user_id' });
PostComment.belongsTo(User);

module.exports = PostComment;