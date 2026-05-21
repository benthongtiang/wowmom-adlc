'use strict';

const { sequelize, Application, Group, Mother, Leader, Notification } = require('../../../src/models');
const { APPLICATION_STATES, GROUP_STATUSES } = require('../../../src/models/constants');
const { ApplicationService } = require('../../../src/services');
const appConfig = require('../../../src/config/appConfig');

describe('ApplicationService Unit & Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean tables before each test
    await Application.destroy({ where: {} });
    await Group.destroy({ where: {} });
    await Leader.destroy({ where: {} });
    await Mother.destroy({ where: {} });
  });

  test('enforces concurrency ceiling: blocks 4th active application', async () => {
    const mother = await Mother.create({
      full_name: 'Jane Doe',
      phone: '555-0100',
      address: '123 Main St',
      zip_code: '90210',
      email: 'jane@example.com',
      password_hash: 'hashed',
      children_ages: [2, 4],
    });

    const leader = await Leader.create({
      full_name: 'Leader One',
      phone: '555-0200',
      email: 'leader@example.com',
      password_hash: 'hashed',
      approved_by_admin: true,
    });

    const group = await Group.create({
      group_name: 'Group 1',
      description: 'Test Group',
      leader_id: leader.leader_id,
      meeting_time: 'Morning',
      max_capacity: 5,
      meeting_frequency: 'Weekly',
    });

    // Create 3 active applications
    for (let i = 0; i < appConfig.maxConcurrentApps; i++) {
      await Application.create({
        mother_id: mother.mother_id,
        group_id: group.group_id,
        status: APPLICATION_STATES.PENDING,
      });
    }

    // 4th submission must reject
    await expect(
      ApplicationService.submitApplication({
        motherId: mother.mother_id,
        groupId: group.group_id,
      })
    ).rejects.toThrow(/exceed maximum limit/);
  });

  test('capacity gate: blocks submission to a full group', async () => {
    const mother = await Mother.create({
      full_name: 'Jane Doe',
      phone: '555-0101',
      address: '123 Main St',
      zip_code: '90210',
      email: 'jane2@example.com',
      password_hash: 'hashed',
      children_ages: [1],
    });

    const leader = await Leader.create({
      full_name: 'Leader Two',
      phone: '555-0201',
      email: 'leader2@example.com',
      password_hash: 'hashed',
      approved_by_admin: true,
    });

    const group = await Group.create({
      group_name: 'Full Group',
      description: 'Test Group',
      leader_id: leader.leader_id,
      meeting_time: 'Afternoon',
      max_capacity: 2,
      current_member_count: 2,
      group_status: GROUP_STATUSES.FULL,
      meeting_frequency: 'Weekly',
    });

    await expect(
      ApplicationService.submitApplication({
        motherId: mother.mother_id,
        groupId: group.group_id,
      })
    ).rejects.toThrow(/maximum capacity limit/);
  });

  test('activation atomically increments member count', async () => {
    const mother = await Mother.create({
      full_name: 'Jane Doe',
      phone: '555-0102',
      address: '123 Main St',
      zip_code: '90210',
      email: 'jane3@example.com',
      password_hash: 'hashed',
      children_ages: [3],
    });

    const leader = await Leader.create({
      full_name: 'Leader Three',
      phone: '555-0202',
      email: 'leader3@example.com',
      password_hash: 'hashed',
      approved_by_admin: true,
    });

    const group = await Group.create({
      group_name: 'Active Group',
      description: 'Test Group',
      leader_id: leader.leader_id,
      meeting_time: 'Evening',
      max_capacity: 5,
      current_member_count: 0,
      meeting_frequency: 'Monthly',
    });

    const application = await Application.create({
      mother_id: mother.mother_id,
      group_id: group.group_id,
      status: APPLICATION_STATES.ACCEPTED,
    });

    await ApplicationService.activateParticipant(application.application_id);

    const updatedGroup = await Group.findByPk(group.group_id);
    expect(updatedGroup.current_member_count).toBe(1);

    const updatedApp = await Application.findByPk(application.application_id);
    expect(updatedApp.status).toBe(APPLICATION_STATES.ACTIVE_PARTICIPANT);
  });

  test('leader approval validation: blocks submission if leader not approved', async () => {
    const mother = await Mother.create({
      full_name: 'Jane Doe',
      phone: '555-0103',
      address: '123 Main St',
      zip_code: '90210',
      email: 'jane4@example.com',
      password_hash: 'hashed',
    });

    const leader = await Leader.create({
      full_name: 'Unapproved Leader',
      phone: '555-0203',
      email: 'unapproved@example.com',
      password_hash: 'hashed',
      approved_by_admin: false,
    });

    const group = await Group.create({
      group_name: 'Group Unapproved',
      description: 'Test Group',
      leader_id: leader.leader_id,
      meeting_time: 'Morning',
      max_capacity: 5,
      meeting_frequency: 'Weekly',
    });

    await expect(
      ApplicationService.submitApplication({
        motherId: mother.mother_id,
        groupId: group.group_id,
      })
    ).rejects.toThrow(/must be approved by an admin/);
  });

  test('capacity limit: triggers GROUP_FULL notification on activating final member', async () => {
    const mother = await Mother.create({
      full_name: 'Jane Doe',
      phone: '555-0104',
      address: '123 Main St',
      zip_code: '90210',
      email: 'jane5@example.com',
      password_hash: 'hashed',
    });

    const leader = await Leader.create({
      full_name: 'Leader Four',
      phone: '555-0204',
      email: 'leader4@example.com',
      password_hash: 'hashed',
      approved_by_admin: true,
    });

    const group = await Group.create({
      group_name: 'Capacity Group',
      description: 'Test Group',
      leader_id: leader.leader_id,
      meeting_time: 'Evening',
      max_capacity: 2,
      current_member_count: 1,
      meeting_frequency: 'Monthly',
    });

    const application = await Application.create({
      mother_id: mother.mother_id,
      group_id: group.group_id,
      status: APPLICATION_STATES.ACCEPTED,
    });

    await ApplicationService.activateParticipant(application.application_id);

    const updatedGroup = await Group.findByPk(group.group_id);
    expect(updatedGroup.current_member_count).toBe(2);
    expect(updatedGroup.group_status).toBe(GROUP_STATUSES.FULL);

    const notification = await Notification.findOne({
      where: {
        user_id: leader.leader_id,
        notification_type: 'GROUP_FULL',
      },
    });
    expect(notification).not.toBeNull();
    expect(notification.message).toContain('reached its maximum capacity');
  });
});
