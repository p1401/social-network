const db = require('../db/config');
const User = require('./user');
const PostComment = require('./post_comment');
const { Sequelize, DataTypes, Deferrable } = require('sequelize');

const CommentLike = db.define(
  'comment_likes',
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
      },
    },
    comment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PostComment,
        key: 'id',
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    }
  }, {
    index: [
      {
        name: 'index_cmt1',
        fields: ['user_id'],
      },
      {
        name: 'index_cmt2',
        fields: ['comment_id'],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);

PostComment.hasMany(CommentLike, { foreignKey: 'comment_id' });
CommentLike.belongsTo(PostComment, { foreignKey: 'user_id' });
User.hasMany(CommentLike, { foreignKey: 'user_id' });
CommentLike.belongsTo(User);

module.exports = CommentLike;

