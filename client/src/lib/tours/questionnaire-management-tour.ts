// Questionnaire management tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const questionnaireSteps: DriveStep[] = [
  {
    element: '[data-tour="questionnaires-main"]',
    popover: {
      title: 'Questionnaire Management',
      description: 'Welcome to your questionnaire management center! This is where you can create, edit, and manage all your assessment questionnaires.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaires-header"]',
    popover: {
      title: 'Questionnaire Actions',
      description: 'Use these buttons to refresh your questionnaire list, create new questionnaires from scratch, or use library templates to get started quickly.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaires-table"]',
    popover: {
      title: 'Questionnaire Data Table',
      description: 'View all your questionnaires with details like status, creation date, and question count. You can edit, duplicate, or manage individual questionnaires from here.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaires-main"]',
    popover: {
      title: 'Questionnaire Management Complete!',
      description: 'You now know how to navigate and manage your questionnaires. Start creating comprehensive questionnaires to conduct thorough assessments!',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the questionnaire management tour
tourManager.registerTour({
  id: 'questionnaire-management',
  steps: questionnaireSteps
});