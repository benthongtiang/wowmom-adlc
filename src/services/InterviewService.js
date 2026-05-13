'use strict';

const { Application, Group, Mother } = require('../models');
const { APPLICATION_STATES, USER_TYPES } = require('../models/constants');
const NotificationService = require('./NotificationService');
const appConfig = require('../config/appConfig');
const { logger } = require('../utils/logger');

/**
 * Service managing interview proposal dispatches, selection link construction,
 * and mother confirmation mapping.
 */
class InterviewService {
  /**
   * Proposes interview time slots to a Mother for a pending application.
   * Updates state to INTERVIEW_SCHEDULED and dispatches structured selection link emails.
   *
   * @param {string} applicationId - Target application UUID
   * @param {Array<string>} proposedSlots - Array of ISO strings or descriptive time ranges
   * @returns {Promise<Object>} Updated application instance
   */
  static async proposeSlots(applicationId, proposedSlots) {
    logger.info(`Proposing interview slots for application ${applicationId}`, { slotsCount: proposedSlots.length });

    const application = await Application.findByPk(applicationId, {
      include: [
        { model: Mother, as: 'mother' },
        { model: Group, as: 'group' },
      ],
    });

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    if (application.status !== APPLICATION_STATES.PENDING) {
      throw new Error(`Cannot propose interview slots for application in ${application.status} state`);
    }

    // Update state to Interview Scheduled
    await application.update({
      status: APPLICATION_STATES.INTERVIEW_SCHEDULED,
      interview_confirmed_by_mother: false,
    });

    // Construct dynamic selection paths capturing slots
    const selectionLinks = proposedSlots.map((slot) => {
      const encodedSlot = encodeURIComponent(slot);
      return `${appConfig.appUrl}/applications/${applicationId}/interview/confirm?slot=${encodedSlot}`;
    });

    // Compose personalized email template for the Mother
    const messageBody = `Hello ${application.mother.full_name},\n\n` +
      `Good news! The Leader of "${application.group.group_name}" would like to schedule an interview with you.\n\n` +
      `Please select one of the following available time blocks by clicking the corresponding link:\n` +
      selectionLinks.map((link, idx) => `${idx + 1}. ${proposedSlots[idx]}:\n   ${link}`).join('\n\n') +
      `\n\nThank you,\n${appConfig.appName} Team`;

    // Trigger event-driven notification dispatch
    await NotificationService.dispatch({
      userId: application.mother_id,
      userType: USER_TYPES.MOTHER,
      notificationType: 'INTERVIEW_PROPOSAL',
      message: messageBody,
    });

    return application;
  }

  /**
   * Confirms a specific interview slot selected by the Mother.
   *
   * @param {string} applicationId - Target application UUID
   * @param {string} selectedSlot - Confirmed time block string
   * @returns {Promise<Object>} Updated application instance
   */
  static async confirmSlot(applicationId, selectedSlot) {
    logger.info(`Confirming interview slot for application ${applicationId}`, { selectedSlot });

    const application = await Application.findByPk(applicationId, {
      include: [
        { model: Mother, as: 'mother' },
        { model: Group, as: 'group' },
      ],
    });

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    if (application.status !== APPLICATION_STATES.INTERVIEW_SCHEDULED) {
      throw new Error(`Application is not expecting an interview confirmation`);
    }

    await application.update({
      interview_time_slot: selectedSlot,
      interview_confirmed_by_mother: true,
      interview_date: new Date(), // Set relevant tracking timestamp
    });

    // Notify Group Leader of confirmation
    const messageBody = `Hello Leader,\n\n` +
      `Mother ${application.mother.full_name} has confirmed her interview slot for "${application.group.group_name}".\n\n` +
      `Confirmed Block: ${selectedSlot}\n\n` +
      `Best regards,\n${appConfig.appName} Team`;

    await NotificationService.dispatch({
      userId: application.group.leader_id,
      userType: USER_TYPES.LEADER,
      notificationType: 'INTERVIEW_CONFIRMED',
      message: messageBody,
    });

    return application;
  }
}

module.exports = InterviewService;
