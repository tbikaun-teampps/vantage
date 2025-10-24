export interface InterviewResponseData {
  id: number;
  rating_score: number | null;
  interview_id: number;
  program_phase_id: number;
  phase_name: string | null;
  phase_sequence: number;
  questionnaire_question_id: number;
  section_title: string;
  question_title: string;
}

export interface ProgramInterviewHeatmapDataPoint {
  section: string;
  phaseTransition: string;
  difference: number;
  percentChange: number;
  fromValue: number;
  toValue: number;
  fromPhase: string;
  toPhase: string;
  responseCountChange: number;
  interviewCountChange: number;
}