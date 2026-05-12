-- 001-create-mothers.sql
-- Creates the Mothers table.

CREATE TABLE IF NOT EXISTS "Mothers" (
  mother_id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  num_children INTEGER CHECK (num_children >= 0),
  children_ages JSON,
  preferred_times JSON,
  preferred_locations JSON,
  account_status VARCHAR(20) NOT NULL DEFAULT 'Active'
    CHECK (account_status IN ('Active', 'Inactive', 'Suspended')),
  registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mothers_email ON "Mothers"(email);
CREATE INDEX IF NOT EXISTS idx_mothers_zip_code ON "Mothers"(zip_code);
