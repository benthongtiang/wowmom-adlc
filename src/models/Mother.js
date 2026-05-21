'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { ACCOUNT_STATUS_VALUES, ACCOUNT_STATUSES } = require('./constants');

const Mother = sequelize.define(
  'Mother',
  {
    mother_id: {
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
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    num_children: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    children_ages: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    preferred_times: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    preferred_locations: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    account_status: {
      type: DataTypes.ENUM(...ACCOUNT_STATUS_VALUES),
      allowNull: false,
      defaultValue: ACCOUNT_STATUSES.ACTIVE,
    },
    registration_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'Mothers',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['email'] },
      { fields: ['zip_code'] },
    ],
  }
);

module.exports = Mother;
