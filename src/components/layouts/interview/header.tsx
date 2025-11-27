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
import {
  FeedbackButton,
  FeedbackDropdownMenuItem,
} from "@/components/feedback/feedback-button";
import { FeedbackDialogProvider } from "@/contexts/FeedbackDialogContext";
import { formatDistance } from "date-fns";
import type { GetInterviewSummaryResponseData } from "@/types/api/interviews";

interface InterviewLayoutHeaderProps {
  interviewData: GetInterviewSummaryResponseData;
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
      <header className="sticky top-[var(--demo-banner-height)] z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
        <div className="mx-auto px-6 max-w-[1600px]">
          <div className={`flex items-center justify-between h-16`}>
            {/* Left side - Logo */}
            {/* Square logo for very small screens (< 200px width) */}
            <img
              src="/assets/logos/vantage-logo.svg"
              alt="Vantage logo"
              className="flex-shrink-0 h-[30px] w-[30px] min-[200px]:hidden"
            />
            {/* Full rectangular logo for wider screens (>= 200px width) */}
            <img
              src="/assets/logos/vantage-logo-full.svg"
              alt="Vantage logo"
              className={cn("flex-shrink-0 hidden min-[200px]:block h-[30px]")}
            />
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
                        {interviewData.company &&
                          interviewData.company.name && (
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
                {/* Badges moved to sidebar footer - desktop only shows action buttons */}
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
