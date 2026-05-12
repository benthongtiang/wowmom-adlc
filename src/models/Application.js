'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { APPLICATION_STATE_VALUES, APPLICATION_STATES } = require('./constants');

const Application = sequelize.define(
  'Application',
  {
    application_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mother_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Mothers',
        key: 'mother_id',
      },
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Groups',
        key: 'group_id',
      },
    },
    application_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM(...APPLICATION_STATE_VALUES),
      allowNull: false,
      defaultValue: APPLICATION_STATES.PENDING,
      validate: {
        isIn: {
          args: [APPLICATION_STATE_VALUES],
          msg: `status must be one of: ${APPLICATION_STATE_VALUES.join(', ')}`,
        },
      },
    },
    interview_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    interview_time_slot: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interview_confirmed_by_mother: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    rejection_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accepted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    activated_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    leader_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'Applications',
    timestamps: true,
    indexes: [
      { fields: ['mother_id'] },
      { fields: ['group_id'] },
      { fields: ['status'] },
      { fields: ['mother_id', 'status'] },
    ],
  }
);

module.exports = Application;
