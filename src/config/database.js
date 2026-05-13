'use strict';

require('dotenv').config();
const { Sequelize } = require('sequelize');

/**
 * Sequelize instance shared across all models.
 * In test mode, uses an in-memory SQLite store so unit tests run hermetically.
 * In production, uses DATABASE_URL (Postgres) with pool configuration.
 */
let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    sequelize = new Sequelize('sqlite::memory:', { logging: false });
  } else {
    sequelize = new Sequelize(databaseUrl, {
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  }
}

module.exports = sequelize;
