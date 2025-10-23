import type { DatabaseRow, CreateInput, UpdateInput} from "./utils";

// export type ProgramPhaseStatusEnum = Enums["program_phase_statuses"];

export type Program = DatabaseRow<"programs">;
export type ProgramPhase = DatabaseRow<"program_phases">;
export type ProgramObjective = DatabaseRow<"program_objectives">;
// export type ProgramMetric = DatabaseRow<"program_metrics">;

// export interface ProgramMetricWithDefinition extends ProgramMetric {
//   metric_definition: MetricDefinition;
// }

export interface ProgramWithRelations extends Program {
  onsite_questionnaire?: {
    id: number;
    name: string;
    description?: string;
  };
  presite_questionnaire?: {
    id: number;
    name: string;
    description?: string;
  };
  company?: {
    id: number;
    name: string;
  };
  phases?: ProgramPhase[];
  objectives?: ProgramObjective[];
  objective_count?: number;
  metrics_count?: number;
}

// export type CreateProgramData = CreateInput<"programs">;
// export type UpdateProgramData = UpdateInput<"programs">;

export interface CreateProgramFormData {
  name: string;
  description?: string;
  company_id: string;
}
