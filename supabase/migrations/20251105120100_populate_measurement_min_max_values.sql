-- 20251105120100_populate_measurement_min_max_values.sql

-- Populate min_value and max_value for existing measurement_definitions based on calculation_type

-- Update ratio type measurements: min=0, max=1
UPDATE measurement_definitions
SET
  min_value = 0,
  max_value = 1
WHERE calculation_type = 'ratio'
  AND (min_value IS NULL OR max_value IS NULL);

-- Update average type measurements: min=0, max=9999
UPDATE measurement_definitions
SET
  min_value = 0,
  max_value = 9999
WHERE calculation_type = 'average'
  AND (min_value IS NULL OR max_value IS NULL);

-- Update sum type measurements: min=0, max=9999
UPDATE measurement_definitions
SET
  min_value = 0,
  max_value = 9999
WHERE calculation_type = 'sum'
  AND (min_value IS NULL OR max_value IS NULL);
