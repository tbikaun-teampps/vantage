// Questionnaire creation tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const questionnaireCreationSteps: DriveStep[] = [
  {
    element: '[data-tour="questionnaire-creation-main"]',
    popover: {
      title: 'Create New Questionnaire',
      description: 'Welcome to the questionnaire creation wizard! This is where you can build comprehensive assessment questionnaires from scratch or using templates.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-creation-tabs"]',
    popover: {
      title: 'Creation Methods',
      description: 'Choose between starting from scratch with a blank questionnaire or using pre-built templates from our library.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-form"]',
    popover: {
      title: 'Questionnaire Details',
      description: 'Fill in the basic information for your questionnaire including name, description, guidelines, and initial status.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="questionnaire-company-info"]',
    popover: {
      title: 'Company Context',
      description: 'This shows which company the questionnaire will be created for. The questionnaire will be associated with your selected company.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-next-steps"]',
    popover: {
      title: 'Next Steps Guide',
      description: 'This helpful guide shows you what happens after creating your questionnaire - adding structure, sections, questions, and rating scales.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-actions"]',
    popover: {
      title: 'Create Your Questionnaire',
      description: 'Once you\'ve filled in the details, click "Create Questionnaire" to build your new questionnaire and start adding sections and questions.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-creation-main"]',
    popover: {
      title: 'Questionnaire Creation Complete!',
      description: 'You now know how to create questionnaires! Start building comprehensive assessments for your organization.',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the questionnaire creation tour
tourManager.registerTour({
  id: 'questionnaire-creation',
  steps: questionnaireCreationSteps
});