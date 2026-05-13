'use strict';

/**
 * Simple structured logger wrapping console output.
 * All log entries include an ISO timestamp and a level tag.
 *
 * Usage:
 *   const { logger } = require('./utils/logger');
 *   logger.info('something happened', { userId: 'x' });
 *
 * Never use console.log directly in the codebase — always use this logger.
 */

const LEVELS = ['debug', 'info', 'warn', 'error'];

function format(level, message, meta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  if (meta !== undefined) {
    entry.meta = meta;
  }
  return JSON.stringify(entry);
}

function emit(level, message, meta) {
  const line = format(level, message, meta);
  // eslint-disable-next-line no-console
  if (level === 'error') {
    process.stderr.write(line + '\n');
  } else if (level === 'warn') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

const logger = LEVELS.reduce((acc, level) => {
  acc[level] = (message, meta) => emit(level, message, meta);
  return acc;
}, {});

module.exports = { logger };
