-- 002-create-leaders.sql
-- Creates the Leaders table.

CREATE TABLE IF NOT EXISTS "Leaders" (
  leader_id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  leader_status VARCHAR(20) NOT NULL DEFAULT 'Pending Approval'
    CHECK (leader_status IN ('Active', 'Inactive', 'Pending Approval')),
  approved_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by_admin_id UUID,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaders_email ON "Leaders"(email);
