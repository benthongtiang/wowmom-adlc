'use strict';

const { Notification, Mother, Leader } = require('../models');
const { USER_TYPES } = require('../models/constants');
const { logger } = require('../utils/logger');

/**
 * Service handling dispatch of event-driven notifications/emails.
 * Implements persistent tracking in the database and mock SMTP dispatch.
 */
class NotificationService {
  /**
   * Dispatches an event-driven notification asynchronously in the background.
   * Ensures high responsiveness for caller API endpoints.
   *
   * @param {Object} params
   * @param {string} params.userId - Target UUID
   * @param {string} params.userType - 'Mother' or 'Leader'
   * @param {string} params.notificationType - Event identifier
   * @param {string} params.message - Body content
   * @returns {Promise<Object>} Created notification instance
   */
  static async dispatch({ userId, userType, notificationType, message }) {
    logger.info(`Queueing notification dispatch for ${userType} ${userId}`, { notificationType });

    // Persist notification record immediately
    const notification = await Notification.create({
      user_id: userId,
      user_type: userType,
      notification_type: notificationType,
      message,
      email_sent: false,
    });

    // Fire asynchronous background worker/queue dispatch without blocking the return
    setImmediate(async () => {
      try {
        await this._mockSmtpSend({ userId, userType, notificationType, message });
        await notification.update({ email_sent: true });
        logger.info(`Successfully dispatched email notification ${notification.notification_id}`);
      } catch (error) {
        logger.error(`Failed to send mock email notification ${notification.notification_id}`, { error: error.message });
      }
    });

    return notification;
  }

  /**
   * Simulates mock SMTP transit with specific template composition based on notificationType.
   * @private
   */
  static async _mockSmtpSend({ userId, userType, notificationType, message }) {
    // Lookup target email address
    let recipientEmail = 'mock@example.com';
    try {
      if (userType === USER_TYPES.MOTHER) {
        const mother = await Mother.findByPk(userId);
        if (mother) recipientEmail = mother.email;
      } else if (userType === USER_TYPES.LEADER) {
        const leader = await Leader.findByPk(userId);
        if (leader) recipientEmail = leader.email;
      }
    } catch (err) {
      logger.warn(`Could not resolve concrete email for ${userType} ${userId}, falling back to default`);
    }

    logger.debug(`[SMTP] Sending ${notificationType} email to ${recipientEmail}`);
    logger.debug(`[SMTP] Content:\n${message}`);

    // Simulate network transit latency
    await new Promise((resolve) => setTimeout(resolve, 50));
    return true;
  }
}

module.exports = NotificationService;
