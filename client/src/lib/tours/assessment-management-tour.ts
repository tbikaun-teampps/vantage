// Assessment management tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const assessmentSteps: DriveStep[] = [
  {
    element: '[data-tour="assessments-main"]',
    popover: {
      title: 'Assessment Management',
      description: 'Welcome to your assessment management hub! This is where you can create, manage, and track all your assessments.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessments-header"]',
    popover: {
      title: 'Assessment Actions',
      description: 'Use these buttons to refresh your assessment list or create new assessments. The "New Assessment" button lets you start fresh evaluations.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessments-table"]',
    popover: {
      title: 'Assessment Data Table',
      description: 'View all your assessments in this comprehensive table. You can sort, filter, and manage individual assessments from here.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessments-main"]',
    popover: {
      title: 'Assessment Management Complete!',
      description: 'You now know how to navigate and manage your assessments. Start creating assessments!',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the assessment management tour
tourManager.registerTour({
  id: 'assessment-management',
  steps: assessmentSteps
});