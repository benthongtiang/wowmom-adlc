'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const appConfig = require('../config/appConfig');
const {
  MEETING_TIME_VALUES,
  GROUP_STATUS_VALUES,
  GROUP_STATUSES,
  MEETING_FREQUENCY_VALUES,
} = require('./constants');

const Group = sequelize.define(
  'Group',
  {
    group_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    group_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    leader_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Leaders',
        key: 'leader_id',
      },
    },
    meeting_time: {
      type: DataTypes.ENUM(...MEETING_TIME_VALUES),
      allowNull: false,
      validate: {
        isIn: {
          args: [MEETING_TIME_VALUES],
          msg: `meeting_time must be one of: ${MEETING_TIME_VALUES.join(', ')}`,
        },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    max_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [appConfig.groupMinCapacity],
          msg: `max_capacity must be at least ${appConfig.groupMinCapacity}`,
        },
        max: {
          args: [appConfig.groupMaxCapacity],
          msg: `max_capacity must be at most ${appConfig.groupMaxCapacity}`,
        },
      },
    },
    current_member_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    meeting_frequency: {
      type: DataTypes.ENUM(...MEETING_FREQUENCY_VALUES),
      allowNull: false,
    },
    group_status: {
      type: DataTypes.ENUM(...GROUP_STATUS_VALUES),
      allowNull: false,
      defaultValue: GROUP_STATUSES.ACTIVE,
    },
  },
  {
    tableName: 'Groups',
    timestamps: true,
    indexes: [
      { fields: ['leader_id'] },
      { fields: ['meeting_time'] },
      { fields: ['group_status'] },
    ],
  }
);

module.exports = Group;
