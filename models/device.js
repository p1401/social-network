const db = require('../db/config');
const User = require('./user');
const { Sequelize, DataTypes, Deferrable } = require('sequelize');

const Device = db.define(
  'device',
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    deleted: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    index: [
      {
        name: 'index_device',
        fields: ['user_id'],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);

User.hasMany(Device, { foreignKey: 'user_id' });
Device.belongsTo(User);

module.exports = Device;
