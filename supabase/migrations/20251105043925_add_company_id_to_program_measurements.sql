-- Add 'company_id' UUID column to 'program_measurements' table

ALTER TABLE program_measurements
ADD COLUMN company_id UUID NOT NULL;

-- Add foreign key constraint linking 'company_id' to 'companies' table
ALTER TABLE program_measurements
ADD CONSTRAINT fk_company
FOREIGN KEY (company_id) REFERENCES companies(id);