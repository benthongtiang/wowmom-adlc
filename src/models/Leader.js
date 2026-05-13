'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { LEADER_STATUS_VALUES, LEADER_STATUSES } = require('./constants');

const Leader = sequelize.define(
  'Leader',
  {
    leader_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 255],
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    leader_status: {
      type: DataTypes.ENUM(...LEADER_STATUS_VALUES),
      allowNull: false,
      defaultValue: LEADER_STATUSES.PENDING_APPROVAL,
    },
    approved_by_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    approved_by_admin_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'Leaders',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['email'] },
    ],
  }
);

module.exports = Leader;
