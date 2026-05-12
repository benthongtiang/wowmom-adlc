'use strict';

/**
 * Canonical string constants used across the platform.
 * These values match the spec exactly and MUST be referenced via this module —
 * never inline string literals when checking application states or meeting times.
 */

const APPLICATION_STATES = Object.freeze({
  PENDING: 'Pending',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  ACTIVE_PARTICIPANT: 'Active Participant',
});

const APPLICATION_STATE_VALUES = Object.freeze(Object.values(APPLICATION_STATES));

const MEETING_TIMES = Object.freeze({
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
});

const MEETING_TIME_VALUES = Object.freeze(Object.values(MEETING_TIMES));

const ACCOUNT_STATUSES = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
});

const ACCOUNT_STATUS_VALUES = Object.freeze(Object.values(ACCOUNT_STATUSES));

const LEADER_STATUSES = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING_APPROVAL: 'Pending Approval',
});

const LEADER_STATUS_VALUES = Object.freeze(Object.values(LEADER_STATUSES));

const GROUP_STATUSES = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  FULL: 'Full',
});

const GROUP_STATUS_VALUES = Object.freeze(Object.values(GROUP_STATUSES));

const MEETING_FREQUENCIES = Object.freeze({
  WEEKLY: 'Weekly',
  BI_WEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
});

const MEETING_FREQUENCY_VALUES = Object.freeze(Object.values(MEETING_FREQUENCIES));

const USER_TYPES = Object.freeze({
  MOTHER: 'Mother',
  LEADER: 'Leader',
});

const USER_TYPE_VALUES = Object.freeze(Object.values(USER_TYPES));

module.exports = {
  APPLICATION_STATES,
  APPLICATION_STATE_VALUES,
  MEETING_TIMES,
  MEETING_TIME_VALUES,
  ACCOUNT_STATUSES,
  ACCOUNT_STATUS_VALUES,
  LEADER_STATUSES,
  LEADER_STATUS_VALUES,
  GROUP_STATUSES,
  GROUP_STATUS_VALUES,
  MEETING_FREQUENCIES,
  MEETING_FREQUENCY_VALUES,
  USER_TYPES,
  USER_TYPE_VALUES,
};
