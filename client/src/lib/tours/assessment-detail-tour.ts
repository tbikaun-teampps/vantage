// Assessment detail tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const assessmentDetailSteps: DriveStep[] = [
  {
    element: '[data-tour="assessment-detail-main"]',
    popover: {
      title: 'Assessment Detail Overview',
      description: 'Welcome to the assessment detail page! This comprehensive view shows everything about your assessment including details, objectives, interviews, and questionnaire structure.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessment-details-card"]',
    popover: {
      title: 'Assessment Details',
      description: 'Here you can see the basic information about your assessment including the questionnaire template being used, current status, creation date, and schedule.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="quick-overview-card"]',
    popover: {
      title: 'Quick Overview',
      description: 'Get a quick snapshot of your assessment progress with interview counts broken down by status - total, completed, in progress, and pending interviews.',
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '[data-tour="assessment-objectives"]',
    popover: {
      title: 'Assessment Objectives',
      description: 'View the specific objectives defined for this assessment. These objectives guide what the assessment aims to evaluate and achieve.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interviews-list"]',
    popover: {
      title: 'Interviews Management',
      description: 'This section shows all interviews associated with this assessment. You can view interview details, track progress, and create new interviews using the button in the header.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="create-interview-button"]',
    popover: {
      title: 'Create New Interview',
      description: 'Click this button to create a new interview for the assessment. You can add notes and assign interviewers.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-structure"]',
    popover: {
      title: 'Questionnaire Structure',
      description: 'Explore the complete structure of your questionnaire including all sections, steps, and questions. Click on sections to expand and see the detailed question breakdown.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessment-detail-main"]',
    popover: {
      title: 'Assessment Detail Tour Complete!',
      description: 'You now know how to navigate and use all features of the assessment detail page. Start managing your assessments effectively!',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the assessment detail tour
tourManager.registerTour({
  id: 'assessment-detail',
  steps: assessmentDetailSteps
});