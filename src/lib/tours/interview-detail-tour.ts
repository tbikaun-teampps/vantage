// Interview detail tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const interviewDetailSteps: DriveStep[] = [
  {
    element: '[data-tour="interview-main"]',
    popover: {
      title: 'Interview Overview',
      description: 'Welcome to the interview session! This is where you conduct detailed assessments by answering questions and providing ratings for each item.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-navigation"]',
    popover: {
      title: 'Question Navigation',
      description: 'Jump directly to any question in the interview. Questions are organized by sections, and answered questions are marked with a green checkmark.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-search-filter"]',
    popover: {
      title: 'Search & Filter Questions',
      description: 'Use the search bar to quickly find specific questions by keywords. Filter questions by role to focus on items relevant to specific positions in your organization.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="interview-question"]',
    popover: {
      title: 'Current Question',
      description: 'This displays the current question you\'re answering, including the question text, context, and your answer status.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-rating"]',
    popover: {
      title: 'Rating Scale',
      description: 'Select a rating for the current question. Each rating has a specific meaning - hover over the buttons to see detailed descriptions.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-comments"]',
    popover: {
      title: 'Comments & Evidence',
      description: 'Provide specific examples and evidence to support your rating. This is crucial for documenting the rationale behind your assessment.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-roles"]',
    popover: {
      title: 'Applicable Roles',
      description: 'Select which roles this question and rating applies to. You can select multiple roles if the assessment item is relevant to different positions.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-actions"]',
    popover: {
      title: 'Follow-up Actions',
      description: 'Create actionable follow-up items based on your assessment findings. Actions can track improvements needed, compliance issues, or other next steps discovered during the interview.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-main"]',
    popover: {
      title: 'Interview Tour Complete!',
      description: 'You now know how to conduct thorough interviews with ratings, evidence, role assignments, and follow-up actions! Use the search and filter features to navigate efficiently through complex assessments.',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the interview detail tour
tourManager.registerTour({
  id: 'interview-detail',
  steps: interviewDetailSteps
});

export { interviewDetailSteps };