import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { IconExternalLink } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { InterviewResponseAction } from "@/types/assessment";

// Extended type to include the joined data from our service
type ActionWithRelations = InterviewResponseAction & {
  interview_response?: {
    questionnaire_question?: {
      id: number;
      title: string;
      questionnaire_step?: {
        id: number;
        title: string;
        questionnaire_section?: {
          id: number;
          title: string;
        };
      };
    };
    interview?: {
      id: number;
      interviewee_email?: string;
      assessment?: {
        id: number;
        name: string;
        site?: {
          id: number;
          name: string;
          region?: {
            id: number;
            name: string;
            business_unit?: {
              id: number;
              name: string;
            };
          };
        };
      };
    };
  };
};

interface CompanyRoutes {
  assessmentOnsiteDetail: (id: string | number) => string;
  assessmentDesktopDetail: (id: string | number) => string;
}

export function createActionsColumns(routes: CompanyRoutes): ColumnDef<ActionWithRelations>[] {
  return [
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const site = row.original.interview_response?.interview?.assessment?.site;
        const region = site?.region;
        const businessUnit = region?.business_unit;
        
        // Build location hierarchy similar to dashboard
        const locationParts = [];
        if (businessUnit?.name) locationParts.push(businessUnit.name);
        if (region?.name) locationParts.push(region.name);
        if (site?.name) locationParts.push(site.name);
        
        const location = locationParts.join(" > ") || "Unknown Location";
        const siteName = site?.name || "Unknown Site";

        return (
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm mb-1.5">{siteName}</div>
            <div
              className="text-xs text-muted-foreground/80 truncate leading-relaxed"
              title={location}
            >
              {location}
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "domain",
      header: "Domain",
      cell: ({ row }) => {
        const question = row.original.interview_response?.questionnaire_question;
        const section = question?.questionnaire_step?.questionnaire_section;
        const questionTitle = question?.title || "Unknown Question";
        const domain = section?.title || "Unknown Domain";

        return (
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm mb-1.5">
              {questionTitle}
            </div>
            <div className="text-xs text-muted-foreground/80 truncate leading-relaxed">
              {domain}
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.original.title;
        return (
          <div className="font-medium whitespace-normal">
            {title || "Untitled"}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.original.description;
        return (
          <div className="max-w-xs text-sm text-muted-foreground whitespace-normal" title={description}>
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "assessment_name",
      header: "Assessment",
      cell: ({ row }) => {
        const assessment = row.original.interview_response?.interview?.assessment;
        const assessmentName = assessment?.name || "N/A";
        
        if (!assessment?.id) {
          return <div className="text-sm max-w-xs truncate" title={assessmentName}>{assessmentName}</div>;
        }
        
        // For now, default to onsite - in the future we could determine type from data
        const assessmentUrl = routes.assessmentOnsiteDetail(assessment.id);
        
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 hover:bg-muted cursor-pointer text-left justify-start max-w-xs"
            asChild
          >
            <Link to={assessmentUrl}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-sm truncate" title={assessmentName}>{assessmentName}</div>
                <IconExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              </div>
            </Link>
          </Button>
        );
      },
    },
    {
      accessorKey: "interviewee_email",
      header: "Interviewee",
      cell: ({ row }) => {
        const intervieweeEmail = row.original.interview_response?.interview?.interviewee_email;
        return (
          <div className="text-sm">
            {intervieweeEmail || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: () => <div className="text-center">Created</div>,
      cell: ({ row }) => {
        const createdAt = row.original.created_at;
        return (
          <div className="flex justify-center">
            <Badge variant="outline">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </Badge>
          </div>
        );
      },
    },
  ];
}