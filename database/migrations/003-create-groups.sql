-- 003-create-groups.sql
-- Creates the Groups table with capacity bounds enforced at the schema level.

CREATE TABLE IF NOT EXISTS "Groups" (
  group_id UUID PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES "Leaders"(leader_id),
  meeting_time VARCHAR(20) NOT NULL
    CHECK (meeting_time IN ('Morning', 'Afternoon', 'Evening')),
  address VARCHAR(255),
  max_capacity INTEGER NOT NULL CHECK (max_capacity >= 2 AND max_capacity <= 15),
  current_member_count INTEGER NOT NULL DEFAULT 0 CHECK (current_member_count >= 0),
  meeting_frequency VARCHAR(20) NOT NULL
    CHECK (meeting_frequency IN ('Weekly', 'Bi-weekly', 'Monthly')),
  group_status VARCHAR(20) NOT NULL DEFAULT 'Active'
    CHECK (group_status IN ('Active', 'Inactive', 'Full')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
