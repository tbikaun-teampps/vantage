// Interview detail tour configuration
import { type DriveStep } from "driver.js";
import { tourManager } from "./tour-manager";

const interviewDetailSteps: DriveStep[] = [
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
    element: '[data-tour="interview-role-selection"]',
    popover: {
      title: "Applicable Role(s) Selection",
      description:
        "Select the role(s) you are assessing. This helps to contextualize the feedback and ensure it is relevant to the specific position.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-navigation"]',
    popover: {
      title: "Question Navigation",
      description:
        "Jump directly to any question in the interview. Questions are organized by sections, and answered questions are marked with a green checkmark. You can also search for specific questions using the search bar, or filter for roles to see only relevant questions.",
      side: "right",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-question-save-button"]',
    popover: {
      title: "Question Saving",
      description:
        "Save your answer for the current question by clicking the 'Save' button. This ensures your response is recorded.",
      side: "right",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-comments"]',
    popover: {
      title: "Comments",
      description:
        "Provide specific examples to support your rating. Detailed comments help clarify your assessment and provide valuable context.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-evidence"]',
    popover: {
      title: "Evidence",
      description:
        "Upload evidence to support your rating. This could include documents, screenshots, photos, or any other relevant files that substantiate your assessment.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="interview-follow-up-actions"]',
    popover: {
      title: "Follow-up Actions",
      description:
        "Create actionable follow-up items based on your assessment findings. Actions can track improvements needed, compliance issues, or other next steps discovered during the interview.",
      side: "left",
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

// Register the interview detail tour
tourManager.registerTour({
  id: "interview-detail",
  steps: interviewDetailSteps,
});