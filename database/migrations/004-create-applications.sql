-- 004-create-applications.sql
-- Creates the Applications table tying Mothers to Groups with the strict state machine.

CREATE TABLE IF NOT EXISTS "Applications" (
  application_id UUID PRIMARY KEY,
  mother_id UUID NOT NULL REFERENCES "Mothers"(mother_id),
  group_id UUID NOT NULL REFERENCES "Groups"(group_id),
  application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Interview Scheduled', 'Accepted', 'Rejected', 'Active Participant')),
  interview_date TIMESTAMP,
  interview_time_slot VARCHAR(50),
  interview_confirmed_by_mother BOOLEAN NOT NULL DEFAULT FALSE,
  rejection_reason VARCHAR(255),
  accepted_date TIMESTAMP,
  activated_date TIMESTAMP,
  leader_notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
