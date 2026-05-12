-- 005-create-notifications.sql
-- Creates the Notifications delivery queue table.

CREATE TABLE IF NOT EXISTS "Notifications" (
  notification_id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('Mother', 'Leader')),
  notification_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
