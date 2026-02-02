// Interview detail (mobile) tour configuration
import { type DriveStep } from "driver.js";
import { tourManager } from "./tour-manager";

const interviewDetailMobileSteps: DriveStep[] = [
  {
    element: '[data-tour="interview-main"]',
    popover: {
      title: "Interview Overview",
      description:
        "Welcome to the interview session! This is where you conduct detailed assessments by answering questions and providing ratings for each item.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-progress"]', // This is the same for both desktop and mobile.
    popover: {
      title: "Interview Progress",
      description:
        "Track your progress through the interview. This section shows how many questions have been answered and how close you are to completing the interview.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="interview-question-breadcrumbs"]', // This is the same for both desktop and mobile.
    popover: {
      title: "Question Breadcrumbs",
      description:
        "This displays information about the current question you're answering, including its section, step, and your answer status. You can scroll horizontally to see the full path.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="interview-question"]',
    popover: {
      title: "Current Question",
      description:
        "This displays the current question you're answering, including the question text and optional context.",
      side: "left",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-rating"]',
    popover: {
      title: "Rating Scale",
      description:
        "Answer the current question by selecting a rating. Simply tap on the option that best reflects your assessment for this question.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-rating-unsure"]',
    popover: {
      title: "Mark as Unknown",
      description:
        'If you are unsure about the answer to this question, you can mark it as "Unknown". This indicates that you do not have enough information to provide a rating at this time.',
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-navigation-mobile"]', // Mobile-specific drawer for comments/evidence
    popover: {
      title: "Question Navigation",
      description:
        'You can navigate between questions by pressing the "/back/" or "next" buttons. If you have unsaved changes, press "Save" to store your response before moving on. At the last question, you can complete the interview by pressing "Complete".',
      side: "right",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-drawer-mobile"]', // Mobile-specific drawer for comments/evidence
    popover: {
      title: "Interview Drawer",
      description:
        "You can open the interview drawer to provide comments and upload evidence supporting your rating. This can be used to document the rationale behind your assessment.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-menu-mobile"]', // Mobile-specific menu
    popover: {
      title: "Interview Menu",
      description:
        "You can open the interview menu to access various options and settings related to the interview process.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-main"]',
    popover: {
      title: "Interview Tour Complete!",
      description:
        "You now know how to conduct thorough interviews with ratings, evidence, role assignments, and follow-up actions! Use the search and filter features to navigate efficiently through complex assessments.",
      side: "bottom",
      align: "center",
    },
  },
];

// Register the interview detail (mobile) tour
tourManager.registerTour({
  id: "interview-detail-mobile",
  steps: interviewDetailMobileSteps,
});