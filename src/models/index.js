'use strict';

const sequelize = require('../config/database');
const Mother = require('./Mother');
const Leader = require('./Leader');
const Group = require('./Group');
const Application = require('./Application');
const Notification = require('./Notification');

// Associations
Mother.hasMany(Application, { foreignKey: 'mother_id', as: 'applications' });
Application.belongsTo(Mother, { foreignKey: 'mother_id', as: 'mother' });

Group.hasMany(Application, { foreignKey: 'group_id', as: 'applications' });
Application.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

Leader.hasMany(Group, { foreignKey: 'leader_id', as: 'groups' });
Group.belongsTo(Leader, { foreignKey: 'leader_id', as: 'leader' });

module.exports = {
  sequelize,
  Mother,
  Leader,
  Group,
  Application,
  Notification,
};
