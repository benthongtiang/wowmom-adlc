'use strict';

const { sequelize, Mother, Leader, Group } = require('./models');
const { APPLICATION_STATES } = require('./models/constants');
const { ApplicationService, InterviewService } = require('./services');
const { logger } = require('./utils/logger');

/**
 * Main application entry point demonstrating the live intake orchestration pipeline.
 */
async function main() {
  logger.info('========================================================');
  logger.info('🚀 WoW Mom Platform Demo Initialization');
  logger.info('========================================================');

  try {
    // 1. Sync DB in-memory or sqlite file
    await sequelize.sync({ force: true });
    logger.info('Database schema successfully synchronized.');

    // 2. Create Sample Approved Group Leader
    const leader = await Leader.create({
      full_name: 'Grace Hopper',
      email: 'grace.leader@wowmom.org',
      password_hash: '$2b$10$samplehashedpasswordstringhere',
      phone: '555-0199',
      approved_by_admin: true,
      leader_status: 'Active',
    });
    logger.info(`Created Verified Leader: ${leader.full_name} (${leader.email})`);

    // Geocode and calculate distance demo
    const GeocodingService = require('./services/GeocodingService');
    const { getDistance } = require('./utils/distance');

    const groupCoords = await GeocodingService.geocode('100 Peace Plaza');
    // 3. Create Sample Local Support Group
    const group = await Group.create({
      group_name: 'Downtown Sunrise Circle',
      description: 'A cozy, supportive community for early rising mothers in the downtown metro area.',
      leader_id: leader.leader_id,
      meeting_time: 'Morning',
      address: '100 Peace Plaza, Suite 4B',
      latitude: groupCoords.latitude,
      longitude: groupCoords.longitude,
      max_capacity: 5,
      current_member_count: 0,
      meeting_frequency: 'Weekly',
    });
    logger.info(`Scaffolded Group: "${group.group_name}" [Capacity: ${group.max_capacity}] at coordinates [${group.latitude}, ${group.longitude}]`);

    // 4. Create Registering Mother
    const motherCoords = await GeocodingService.geocode('42 Babbage Way');
    const mother = await Mother.create({
      full_name: 'Ada Lovelace',
      email: 'ada.lovelace@example.com',
      password_hash: '$2b$10$samplehashedpasswordstringhere',
      phone: '555-0122',
      address: '42 Babbage Way',
      zip_code: '94102',
      latitude: motherCoords.latitude,
      longitude: motherCoords.longitude,
      num_children: 1,
      children_ages: [1],
    });
    logger.info(`Registered Mother Candidate: ${mother.full_name} at coordinates [${mother.latitude}, ${mother.longitude}]`);

    const distance = getDistance(mother.latitude, mother.longitude, group.latitude, group.longitude);
    logger.info(`Determined geodesic distance between mother and group: ${distance} miles`);

    logger.info('\n--- [PIPELINE STAGE 1: SUBMISSION] ---');
    // 5. Submit Application
    const application = await ApplicationService.submitApplication({
      motherId: mother.mother_id,
      groupId: group.group_id,
    });
    logger.info(`Application submitted. Current status: [${application.status}]`);

    logger.info('\n--- [PIPELINE STAGE 2: INTERVIEW PROPOSAL] ---');
    // 6. Propose Interview Slots
    await InterviewService.proposeSlots(application.application_id, [
      'Thursday at 10:00 AM',
      'Friday at 11:30 AM',
    ]);
    await application.reload();
    logger.info(`Leader proposed times. Status advanced to: [${application.status}]`);

    logger.info('\n--- [PIPELINE STAGE 3: INTERVIEW CONFIRMATION] ---');
    // 7. Mother Confirms Slot
    await InterviewService.confirmSlot(application.application_id, 'Thursday at 10:00 AM');
    await application.reload();
    logger.info(`Mother locked slot: "${application.interview_time_slot}". Confirmed flag: ${application.interview_confirmed_by_mother}`);

    logger.info('\n--- [PIPELINE STAGE 4: LEADER ACCEPTANCE] ---');
    // 8. Leader Accepts Application post-interview
    await ApplicationService.acceptApplication(application.application_id);
    await application.reload();
    logger.info(`Leader approved candidate. Status advanced to: [${application.status}]`);

    logger.info('\n--- [PIPELINE STAGE 5: ACTIVATION & ROSTER HYDRATION] ---');
    // 9. Final Activation on First Meeting Attendance
    await ApplicationService.activateParticipant(application.application_id);
    await application.reload();
    await group.reload();
    logger.info(`🎉 Candidate activated! Status: [${application.status}]`);
    logger.info(`Updated Group Member Count: ${group.current_member_count} / ${group.max_capacity}`);

    logger.info('\n========================================================');
    logger.info('✨ Demonstration Completed Successfully!');
    logger.info('========================================================');
  } catch (error) {
    logger.error('Fatal error during execution:', { error: error.message });
  } finally {
    await sequelize.close();
  }
}

// Execute demo if run directly via node
if (require.main === module) {
  main();
}

module.exports = main;
