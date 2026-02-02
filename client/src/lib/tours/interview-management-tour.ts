// Interview management tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const interviewSteps: DriveStep[] = [
  {
    element: '[data-tour="interviews-main"]',
    popover: {
      title: 'Interview Management',
      description: 'Welcome to your interview management dashboard! This is where you can track and manage all your assessment interviews.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interviews-header"]',
    popover: {
      title: 'Interview Actions',
      description: 'Use these buttons to refresh your interview list or create new interviews. Manage your interview workflow from here.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interviews-table"]',
    popover: {
      title: 'Interview Data Table',
      description: 'View all your interviews with detailed information including completion rates, scores, interviewee roles, and status. You can sort and filter to find specific interviews.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interviews-main"]',
    popover: {
      title: 'Interview Management Complete!',
      description: 'You now know how to navigate and manage your interviews. Start conducting interviews to gather comprehensive assessment data!',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the interview management tour
tourManager.registerTour({
  id: 'interview-management',
  steps: interviewSteps
});