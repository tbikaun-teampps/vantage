import {
  ThemeModeDropdownMenuItem,
  ThemeModeToggle,
} from "@/components/theme-mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  IconBuilding,
  IconCalendar,
  IconEye,
  IconEyeOff,
  IconMenu2,
  IconQuestionMark,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tourManager, useTourManager, type TourId } from "@/lib/tours";
import { Badge } from "@/components/ui/badge";
import {
  FeedbackButton,
  FeedbackDropdownMenuItem,
} from "@/components/feedback/feedback-button";
import { FeedbackDialogProvider } from "@/contexts/FeedbackDialogContext";
import { formatDistance } from "date-fns";

interface InterviewLayoutHeaderProps {
  interviewData?: {
    name: string;
    assessment: {
      name: string;
    };
    due_at: string | null;
    is_individual: boolean;
    interviewer: {
      full_name: string;
      email: string;
    } | null;
    interviewee: {
      full_name: string;
      email: string;
    } | null;
    company: {
      name: string;
      icon_url: string | null;
    };
  };
  showExitDialog: () => void;
}

export function InterviewLayoutHeader({
  interviewData,
  showExitDialog,
}: InterviewLayoutHeaderProps) {
  const isMobile = useIsMobile();
  const { hasTourForPage } = useTourManager();

  const pathname = location.pathname;
  const hasTour = hasTourForPage(pathname);
  const showTourButton = hasTour;

  const handleTourClick = () => {
    const baseTourId = tourManager.getTourForPage(pathname);
    const tourId =
      isMobile && baseTourId === "interview-detail"
        ? "interview-detail-mobile"
        : baseTourId;

    if (tourId) {
      tourManager.startTour(tourId as TourId, true);
    }
  };

  console.log('interviewData: ', interviewData)

  if (!interviewData) {
    return null;
  }

  const username = interviewData.is_individual
    ? interviewData.interviewee?.full_name ||
      interviewData.interviewee?.email.split("@")[0] ||
      "Interviewee"
    : interviewData.interviewer?.full_name ||
      interviewData.interviewer?.email.split("@")[0] ||
      "Interviewer";

  return (
    <FeedbackDialogProvider>
      <header className="sticky top-[var(--demo-banner-height)] z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-w-[1600px] mx-auto w-full">
        <div className="mx-auto px-6">
          <div className={`flex items-center justify-between h-16`}>
            {/* Left side - Logo and title */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <img
                src="/assets/logos/vantage-logo.svg"
                height={isMobile ? 30 : 40}
                width={isMobile ? 30 : 40}
                alt="Vantage logo"
                className="flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1
                  className={cn(
                    "font-semibold",
                    isMobile ? "truncate text-md" : "text-lg"
                  )}
                >
                  {interviewData.name || "Interview"}
                </h1>
                <p
                  className={cn(
                    "text-muted-foreground",
                    isMobile ? "truncate text-xs" : "text-sm"
                  )}
                >
                  {interviewData.assessment?.name || "Unknown"}
                </p>
              </div>
            </div>

            {/* Right side - User info and actions */}
            {isMobile ? (
              <div data-tour="interview-menu-mobile">
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <IconMenu2 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Interview Info</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <IconUser className="h-3 w-3 mr-2" />
                        {username}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {interviewData.company.name && (
                          <div className="flex items-center gap-4">
                            {interviewData.company.icon_url ? (
                              <img
                                src={interviewData.company.icon_url}
                                alt="Company Icon"
                                className="h-3 w-3 mr-1 rounded-sm object-cover"
                              />
                            ) : (
                              <IconBuilding className="h-3 w-3 mr-1" />
                            )}
                            {interviewData.company.name || "Company"}
                          </div>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <IconCalendar className="h-3 w-3 mr-2" />
                        Due{" "}
                        {interviewData.due_at
                          ? formatDistance(
                              new Date(interviewData.due_at),
                              new Date(),
                              { addSuffix: true }
                            )
                          : "Not available"}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      {showTourButton && (
                        <DropdownMenuItem onClick={handleTourClick}>
                          Take Page Tour
                        </DropdownMenuItem>
                      )}

                      <ThemeModeDropdownMenuItem />
                      <FeedbackDropdownMenuItem />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={showExitDialog}
                        className="text-destructive align-center"
                      >
                        Exit Interview
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {interviewData.is_individual ? (
                      <IconEye className="h-3 w-3 mr-1" />
                    ) : (
                      <IconEyeOff className="h-3 w-3 mr-1" />
                    )}

                    {interviewData.is_individual ? "Individual" : "Group"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <IconUser className="h-3 w-3 mr-1" />
                    {username}
                  </Badge>
                  {interviewData.company?.name && (
                    <Badge variant="outline" className="text-xs">
                      {interviewData.company.icon_url ? (
                        <img
                          src={interviewData.company.icon_url}
                          alt="Company Icon"
                          className="h-3 w-3 mr-1 rounded-sm object-cover"
                        />
                      ) : (
                        <IconBuilding className="h-3 w-3 mr-1" />
                      )}
                      {interviewData.company.name || "Company"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {showTourButton && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleTourClick}
                            className="h-8 w-8 p-0 cursor-help"
                          >
                            <IconQuestionMark className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Take a tour of this page</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <FeedbackButton />
                  <ThemeModeToggle />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={showExitDialog}
                    data-interview-exit
                    className="h-8 w-8 p-0"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </FeedbackDialogProvider>
  );
}
