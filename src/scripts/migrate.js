'use strict';

const { sequelize } = require('../models');
const { logger } = require('../utils/logger');

async function migrate() {
  try {
    logger.info('Starting database synchronization...');
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized successfully.');
    process.exit(0);
  } catch (err) {
    logger.error('Database migration/sync failed:', err);
    process.exit(1);
  }
}

migrate();
