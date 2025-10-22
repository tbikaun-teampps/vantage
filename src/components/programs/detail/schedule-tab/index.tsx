import { InterviewSchedule } from "@/components/programs/detail/schedule-tab/interview-schedule";

export function ScheduleTab({ programId }: { programId: number }) {
  return <InterviewSchedule programId={programId} />;
}
