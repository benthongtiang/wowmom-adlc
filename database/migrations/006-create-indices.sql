-- 006-create-indices.sql
-- Performance indices for query patterns identified in the architecture spec.
-- These accelerate location-based group discovery, application state lookups,
-- and notification fan-out operations.

-- Group discovery: filter by leader, meeting time, and status.
CREATE INDEX IF NOT EXISTS idx_groups_leader_id ON "Groups"(leader_id);
CREATE INDEX IF NOT EXISTS idx_groups_meeting_time ON "Groups"(meeting_time);
CREATE INDEX IF NOT EXISTS idx_groups_group_status ON "Groups"(group_status);

-- Applications: enforce per-mother concurrent application checks and lookup by group.
CREATE INDEX IF NOT EXISTS idx_applications_mother_id ON "Applications"(mother_id);
CREATE INDEX IF NOT EXISTS idx_applications_group_id ON "Applications"(group_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON "Applications"(status);
CREATE INDEX IF NOT EXISTS idx_applications_mother_status ON "Applications"(mother_id, status);

-- Notifications: efficient per-user feed retrieval and pending email worker scans.
CREATE INDEX IF NOT EXISTS idx_notifications_user ON "Notifications"(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_notifications_email_sent ON "Notifications"(email_sent);
