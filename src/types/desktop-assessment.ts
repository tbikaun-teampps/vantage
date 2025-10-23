/**
 * Desktop Assessment Types
 * Types specific to desktop assessments, measurements, and data mapping
 */

import type { AssessmentStatus, CreateAssessmentData } from '@/types/domains/assessment';

// Core desktop assessment types
export interface Measurement {
  id: number;
  assessment_categories: string[];
  name: string;
  objective: string;
  definition: string;
  latex?: string;
  terms: MeasurementTerm[];
  required_columns: RequiredColumn[];
  data_sources: string[];
}

interface MeasurementTerm {
  id: number;
  description: string;
  term: string;
}

interface RequiredColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  description: string;
  required: boolean;
  validation?: ColumnValidation;
}

export interface ColumnValidation {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: string[];
}

export interface DataSource {
  id: number;
  name: string;
  description?: string;
  tables: DataTable[];
}

export interface DataTable {
  id: number;
  name: string;
  description?: string;
  columns: TableColumn[];
}

export interface TableColumn {
  name: string;
  type: string;
  description?: string;
}

// Data mapping types
export interface DataMapping {
  measurement_id: number;
  file_name: string;
  file_size: number;
  upload_date: string;
  column_mappings: ColumnMapping[];
  validation_status: 'pending' | 'valid' | 'invalid';
  validation_errors: ValidationError[];
  preview_data?: PreviewRow[];
}

export interface ColumnMapping {
  required_column: string;
  user_column: string;
  data_type: string;
  sample_values: (string | number)[];
  is_valid: boolean;
}

export interface ValidationError {
  type: 'missing_column' | 'invalid_data_type' | 'invalid_values' | 'missing_data';
  column?: string;
  message: string;
  row_count?: number;
}

export interface PreviewRow {
  [key: string]: string | number | null;
}

// File upload types
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  uploaded_at: string;
  processed: boolean;
  headers?: string[];
  preview_rows?: Record<string, string | number | null>[];
  validation_status?: 'pending' | 'valid' | 'invalid';
  errors?: ValidationError[];
}

// Form data types
export interface DesktopAssessmentFormData {
  // Basic information
  name: string;
  description: string;
  status: AssessmentStatus;
  
  // Measurements
  selected_measurements: number[];
  measurement_data: Record<number, MeasurementData>;
  
  // Validation
  is_valid: boolean;
  validation_errors: Record<string, string>;
}

export interface MeasurementData {
  measurement: Measurement;
  data_mapping?: DataMapping;
  uploaded_files: UploadedFile[];
  completion_status: 'not_started' | 'files_uploaded' | 'mapped' | 'validated' | 'complete';
}

// Create data for desktop assessments
export interface CreateDesktopAssessmentData extends Omit<CreateAssessmentData, 'questionnaire_id' | 'business_unit_id' | 'region_id' | 'site_id' | 'asset_group_id'> {
  measurements: CreateMeasurementAssignment[];
}

export interface CreateMeasurementAssignment {
  measurement_id: number;
  data_mapping: CreateDataMapping;
}

export interface CreateDataMapping {
  file_name: string;
  file_data: string; // Base64 encoded file content
  column_mappings: CreateColumnMapping[];
}

export interface CreateColumnMapping {
  required_column: string;
  user_column: string;
  data_type: string;
}

// Saved mapping templates
export interface MappingTemplate {
  id: string;
  name: string;
  description?: string;
  company_id: string;
  measurement_id: number;
  column_mappings: ColumnMapping[];
  created_at: string;
  updated_at: string;
  usage_count: number;
}

// Form validation types
export interface FormValidationState {
  basic_info: {
    name: boolean;
    description: boolean;
  };
  measurements: {
    has_selections: boolean;
    all_mapped: boolean;
    all_validated: boolean;
  };
  overall_valid: boolean;
  errors: Record<string, string[]>;
}

// Component props types
export interface MeasurementSelectionProps {
  measurements: Measurement[];
  selectedMeasurements: number[];
  onSelectionChange: (measurementIds: number[]) => void;
  onMeasurementView: (measurement: Measurement) => void;
  isLoading?: boolean;
}

export interface DataMappingProps {
  measurement: Measurement;
  measurementData: MeasurementData;
  onFileUpload: (files: File[]) => void;
  onColumnMapping: (mappings: ColumnMapping[]) => void;
  onValidation: (isValid: boolean, errors: ValidationError[]) => void;
  savedTemplates?: MappingTemplate[];
  onSaveTemplate?: (template: Omit<MappingTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => void;
}

export interface BasicInformationProps {
  formData: Pick<DesktopAssessmentFormData, 'name' | 'description' | 'status'>;
  errors: Record<string, string>;
  onInputChange: (field: string, value: string | number | boolean | AssessmentStatus) => void;
}