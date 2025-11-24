import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconCalendar, IconClock, IconUser } from "@tabler/icons-react";

// Mock data for demonstration
const mockInterviews = [
  {
    id: 1,
    title: "Department Manager Interview",
    date: "2025-08-25",
    time: "14:00",
    interviewee: "John Smith",
    role: "Operations Manager",
    status: "scheduled" as const,
  },
  {
    id: 2,
    title: "Safety Officer Interview",
    date: "2025-08-26",
    time: "10:30",
    interviewee: "Sarah Johnson",
    role: "HSE Coordinator",
    status: "confirmed" as const,
  },
  {
    id: 3,
    title: "Team Lead Interview",
    date: "2025-08-27",
    time: "16:00",
    interviewee: "Mike Wilson",
    role: "Production Lead",
    status: "pending" as const,
  },
];

const statusColors = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  completed: "bg-gray-50 text-gray-700 border-gray-200",
};

export function InterviewSchedule() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Interview Schedule</CardTitle>
            <CardDescription>
              Manage and track scheduled interviews for this program
            </CardDescription>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Interview
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockInterviews.map((interview) => (
            <div
              key={interview.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{interview.title}</h4>
                    <Badge
                      variant="outline"
                      className={statusColors[interview.status]}
                    >
                      {interview.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <IconCalendar className="h-4 w-4" />
                      <span>{interview.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconClock className="h-4 w-4" />
                      <span>{interview.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconUser className="h-4 w-4" />
                      <span>{interview.interviewee} ({interview.role})</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {mockInterviews.length === 0 && (
            <div className="text-center py-8">
              <IconCalendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                No interviews scheduled
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start by adding your first interview to the schedule.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}