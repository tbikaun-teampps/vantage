import type { Database } from "../database";

export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type ProgramWithRelations = Program & {
  company: { id: string; name: string } | null;
  objective_count: number;
  phases?: Database["public"]["Tables"]["program_phases"]["Row"][];
  objectives?: Database["public"]["Tables"]["program_objectives"]["Row"][];
};

export type ProgramStatus = Database["public"]["Enums"]["program_statuses"];

export type ProgramPhaseStatus =
  Database["public"]["Enums"]["program_phase_status"];
