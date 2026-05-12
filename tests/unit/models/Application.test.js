'use strict';

process.env.NODE_ENV = 'test';

const { sequelize, Application, Mother, Group, Leader } = require('../../../src/models');
const {
  APPLICATION_STATES,
  MEETING_TIMES,
  MEETING_FREQUENCIES,
} = require('../../../src/models/constants');

const setup = async () => {
  const leader = await Leader.create({
    email: `leader-${Date.now()}-${Math.random()}@example.com`,
    password_hash: 'hashed-password',
    full_name: 'Test Leader',
    phone: '555-0100',
  });

  const mother = await Mother.create({
    email: `mother-${Date.now()}-${Math.random()}@example.com`,
    password_hash: 'hashed-password',
    full_name: 'Test Mother',
    phone: '555-0200',
    address: '123 Test St',
    zip_code: '12345',
  });

  const group = await Group.create({
    group_name: 'Test Group',
    description: 'A test group',
    leader_id: leader.leader_id,
    meeting_time: MEETING_TIMES.MORNING,
    address: '123 Test St',
    max_capacity: 10,
    meeting_frequency: MEETING_FREQUENCIES.WEEKLY,
  });

  return { leader, mother, group };
};

describe('Application model — state defaults and constants', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('status defaults to "Pending" when omitted', async () => {
    const { mother, group } = await setup();
    const application = await Application.create({
      mother_id: mother.mother_id,
      group_id: group.group_id,
    });
    expect(application.status).toBe(APPLICATION_STATES.PENDING);
    expect(application.status).toBe('Pending');
  });

  test('all APPLICATION_STATES values are accepted by the model', async () => {
    const { mother, group } = await setup();
    for (const state of Object.values(APPLICATION_STATES)) {
      const application = await Application.create({
        mother_id: mother.mother_id,
        group_id: group.group_id,
        status: state,
      });
      expect(application.status).toBe(state);
    }
  });

  test('exposes the canonical state strings exactly', () => {
    expect(APPLICATION_STATES.PENDING).toBe('Pending');
    expect(APPLICATION_STATES.INTERVIEW_SCHEDULED).toBe('Interview Scheduled');
    expect(APPLICATION_STATES.ACCEPTED).toBe('Accepted');
    expect(APPLICATION_STATES.REJECTED).toBe('Rejected');
    expect(APPLICATION_STATES.ACTIVE_PARTICIPANT).toBe('Active Participant');
  });

  test('rejects an unknown status value', async () => {
    const { mother, group } = await setup();
    await expect(
      Application.create({
        mother_id: mother.mother_id,
        group_id: group.group_id,
        status: 'Bogus State',
      })
    ).rejects.toThrow();
  });
});
