-- Add order indexes to the company structure tables

ALTER TABLE business_units
ADD COLUMN order_index INT DEFAULT 0;

ALTER TABLE regions
ADD COLUMN order_index INT DEFAULT 0;

ALTER TABLE sites
ADD COLUMN order_index INT DEFAULT 0;

ALTER TABLE asset_groups
ADD COLUMN order_index INT DEFAULT 0;

ALTER TABLE work_groups
ADD COLUMN order_index INT DEFAULT 0;

ALTER TABLE roles
ADD COLUMN order_index INT DEFAULT 0;
