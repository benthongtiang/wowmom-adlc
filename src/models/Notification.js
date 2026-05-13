'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { USER_TYPE_VALUES } = require('./constants');

const Notification = sequelize.define(
  'Notification',
  {
    notification_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_type: {
      type: DataTypes.ENUM(...USER_TYPE_VALUES),
      allowNull: false,
    },
    notification_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'Notifications',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['user_id', 'user_type'] },
      { fields: ['email_sent'] },
    ],
  }
);

module.exports = Notification;
