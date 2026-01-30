-- Migration: Add checked_in column to registrations table
-- Run this on your Neon Postgres database to add the check-in functionality

-- Add checked_in column if it doesn't exist
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster lookups on checked_in status
CREATE INDEX IF NOT EXISTS idx_registrations_checked_in ON registrations(checked_in);

