'use strict';

require('dotenv').config();

/**
 * Centralized application configuration.
 * All values are read from process.env so behavior can vary per environment.
 * Never hardcode these values inline elsewhere in the codebase.
 */
const appConfig = {
  maxConcurrentApps: parseInt(process.env.MAX_CONCURRENT_APPS_PER_MOTHER, 10) || 3,
  groupMinCapacity: parseInt(process.env.GROUP_MIN_CAPACITY, 10) || 2,
  groupMaxCapacity: parseInt(process.env.GROUP_MAX_CAPACITY, 10) || 15,
  reappCooldownDays: parseInt(process.env.REAPP_COOLDOWN_DAYS, 10) || 30,
  interviewSlaDays: parseInt(process.env.INTERVIEW_SLA_DAYS, 10) || 7,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  appName: process.env.APP_NAME || 'WoW Mom App',
};

module.exports = appConfig;
