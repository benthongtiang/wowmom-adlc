'use strict';

process.env.NODE_ENV = 'test';

const { sequelize, Group, Leader } = require('../../../src/models');
const { MEETING_TIMES, MEETING_FREQUENCIES } = require('../../../src/models/constants');

const makeLeader = async () => {
  return Leader.create({
    email: `leader-${Date.now()}-${Math.random()}@example.com`,
    password_hash: 'hashed-password',
    full_name: 'Test Leader',
    phone: '555-0100',
  });
};

const baseGroup = (leader, overrides = {}) => ({
  group_name: 'Test Group',
  description: 'A test group',
  leader_id: leader.leader_id,
  meeting_time: MEETING_TIMES.MORNING,
  address: '123 Test St',
  meeting_frequency: MEETING_FREQUENCIES.WEEKLY,
  ...overrides,
});

describe('Group model — capacity boundaries', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('rejects max_capacity above 15', async () => {
    const leader = await makeLeader();
    await expect(
      Group.create(baseGroup(leader, { max_capacity: 16 }))
    ).rejects.toThrow(/max_capacity/);
  });

  test('rejects max_capacity below 2', async () => {
    const leader = await makeLeader();
    await expect(
      Group.create(baseGroup(leader, { max_capacity: 1 }))
    ).rejects.toThrow(/max_capacity/);
  });

  test('accepts max_capacity at the lower bound (2)', async () => {
    const leader = await makeLeader();
    const group = await Group.create(baseGroup(leader, { max_capacity: 2 }));
    expect(group.max_capacity).toBe(2);
  });

  test('accepts max_capacity at the upper bound (15)', async () => {
    const leader = await makeLeader();
    const group = await Group.create(baseGroup(leader, { max_capacity: 15 }));
    expect(group.max_capacity).toBe(15);
  });

  test('accepts max_capacity within range (e.g. 8)', async () => {
    const leader = await makeLeader();
    const group = await Group.create(baseGroup(leader, { max_capacity: 8 }));
    expect(group.max_capacity).toBe(8);
  });
});
