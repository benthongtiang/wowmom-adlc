'use strict';

const { Op } = require('sequelize');
const { sequelize, Application, Group, Mother } = require('../models');
const { APPLICATION_STATES, GROUP_STATUSES, USER_TYPES } = require('../models/constants');
const NotificationService = require('./NotificationService');
const appConfig = require('../config/appConfig');
const { logger } = require('../utils/logger');

/**
 * Gateway service enforcing transactional business logic, concurrency ceiling rules,
 * capacity boundaries, and state transition lifecycle constraints for Applications.
 */
class ApplicationService {
  /**
   * Submits a new application for a Mother to join a Group.
   * Enforces max concurrent apps, capacity gating, and reapplication cooldown rules.
   *
   * @param {Object} params
   * @param {string} params.motherId - Mother UUID
   * @param {string} params.groupId - Target Group UUID
   * @returns {Promise<Object>} Created Application instance
   */
  static async submitApplication({ motherId, groupId }) {
    logger.info(`Validating application submission for mother ${motherId} to group ${groupId}`);

    // Execute within a serializable/managed transaction to prevent race conditions
    return sequelize.transaction(async (t) => {
      // 1. Concurrency Ceiling Check: Max active applications rule
      const activeAppsCount = await Application.count({
        where: {
          mother_id: motherId,
          status: {
            [Op.in]: [APPLICATION_STATES.PENDING, APPLICATION_STATES.INTERVIEW_SCHEDULED],
          },
        },
        transaction: t,
      });

      if (activeAppsCount >= appConfig.maxConcurrentApps) {
        logger.warn(`Submission blocked: Mother ${motherId} reached concurrency ceiling`);
        throw new Error(`Cannot exceed maximum limit of ${appConfig.maxConcurrentApps} active applications`);
      }

      // 2. Capacity Gate Check: Ensure group is not full
      const group = await Group.findByPk(groupId, {
        lock: t.LOCK.UPDATE, // Row-level lock to securely evaluate counts
        transaction: t,
      });

      if (!group) {
        throw new Error(`Group ${groupId} does not exist`);
      }

      if (group.group_status === GROUP_STATUSES.FULL || group.current_member_count >= group.max_capacity) {
        logger.warn(`Submission blocked: Group ${groupId} is at max capacity`);
        throw new Error(`Group has reached its maximum capacity limit`);
      }

      // 3. 30-Day Reapplication Cooldown Check
      const cooldownThreshold = new Date();
      cooldownThreshold.setDate(cooldownThreshold.getDate() - appConfig.reappCooldownDays);

      const recentRejection = await Application.findOne({
        where: {
          mother_id: motherId,
          group_id: groupId,
          status: APPLICATION_STATES.REJECTED,
          application_date: {
            [Op.gt]: cooldownThreshold,
          },
        },
        transaction: t,
      });

      if (recentRejection) {
        logger.warn(`Submission blocked: Mother ${motherId} under reapplication cooldown for group ${groupId}`);
        throw new Error(`Reapplication cooldown active: Must wait ${appConfig.reappCooldownDays} days after a rejection before applying to the same group again`);
      }

      // 4. Persist Application
      const application = await Application.create(
        {
          mother_id: motherId,
          group_id: groupId,
          status: APPLICATION_STATES.PENDING,
          application_date: new Date(),
        },
        { transaction: t }
      );

      // Trigger notification to the Leader asynchronously
      const mother = await Mother.findByPk(motherId, { transaction: t });
      await NotificationService.dispatch({
        userId: group.leader_id,
        userType: USER_TYPES.LEADER,
        notificationType: 'NEW_APPLICATION',
        message: `Hello Leader,\n\nA new mother (${mother ? mother.full_name : 'Applicant'}) has applied to join your group "${group.group_name}".\n\nPlease review the application in your approval queue.`,
      });

      logger.info(`Successfully submitted application ${application.application_id}`);
      return application;
    });
  }

  /**
   * Accepts an application, transitioning status to ACCEPTED.
   *
   * @param {string} applicationId
   * @returns {Promise<Object>} Updated application instance
   */
  static async acceptApplication(applicationId) {
    logger.info(`Accepting application ${applicationId}`);

    const application = await Application.findByPk(applicationId, {
      include: [{ model: Group, as: 'group' }],
    });

    if (!application) throw new Error(`Application not found`);

    const validPriorStates = [APPLICATION_STATES.PENDING, APPLICATION_STATES.INTERVIEW_SCHEDULED];
    if (!validPriorStates.includes(application.status)) {
      throw new Error(`Cannot transition to Accepted from current state: ${application.status}`);
    }

    await application.update({
      status: APPLICATION_STATES.ACCEPTED,
      accepted_date: new Date(),
    });

    // Notify Mother
    await NotificationService.dispatch({
      userId: application.mother_id,
      userType: USER_TYPES.MOTHER,
      notificationType: 'APPLICATION_ACCEPTED',
      message: `Congratulations!\n\nYour application to join "${application.group.group_name}" has been approved by the leader.\n\nYou are now ready for final activation.`,
    });

    return application;
  }

  /**
   * Activates an accepted application, transitioning to ACTIVE_PARTICIPANT
   * and atomically incrementing group member counts.
   *
   * @param {string} applicationId
   * @returns {Promise<Object>} Updated application instance
   */
  static async activateParticipant(applicationId) {
    logger.info(`Activating participant for application ${applicationId}`);

    return sequelize.transaction(async (t) => {
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Group, as: 'group' }],
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!application) throw new Error(`Application not found`);

      if (application.status !== APPLICATION_STATES.ACCEPTED) {
        throw new Error(`Only accepted applications can be activated into active participants`);
      }

      const group = application.group;

      // Double check boundary constraint securely
      if (group.current_member_count >= group.max_capacity) {
        throw new Error(`Cannot activate participant: Group is currently at full capacity`);
      }

      // Update application state
      await application.update(
        {
          status: APPLICATION_STATES.ACTIVE_PARTICIPANT,
          activated_date: new Date(),
        },
        { transaction: t }
      );

      // Increment member count atomically
      const newCount = group.current_member_count + 1;
      const groupUpdates = { current_member_count: newCount };
      if (newCount >= group.max_capacity) {
        groupUpdates.group_status = GROUP_STATUSES.FULL;
      }

      await group.update(groupUpdates, { transaction: t });

      logger.info(`Successfully activated participant ${applicationId}. New group member count: ${newCount}`);
      return application;
    });
  }

  /**
   * Rejects an application with structured reason feedback.
   *
   * @param {string} applicationId
   * @param {string} reason
   * @returns {Promise<Object>} Updated application instance
   */
  static async rejectApplication(applicationId, reason) {
    logger.info(`Rejecting application ${applicationId}`, { reason });

    const application = await Application.findByPk(applicationId, {
      include: [{ model: Group, as: 'group' }],
    });

    if (!application) throw new Error(`Application not found`);

    await application.update({
      status: APPLICATION_STATES.REJECTED,
      rejection_reason: reason || 'Does not meet current intake parameters',
    });

    // Notify Mother
    await NotificationService.dispatch({
      userId: application.mother_id,
      userType: USER_TYPES.MOTHER,
      notificationType: 'APPLICATION_REJECTED',
      message: `Hello,\n\nThank you for your interest in "${application.group.group_name}". Unfortunately, the leader is unable to accommodate your request at this time.\n\nFeedback: ${application.rejection_reason}\n\nPlease feel free to explore other available groups.`,
    });

    return application;
  }
}

module.exports = ApplicationService;
