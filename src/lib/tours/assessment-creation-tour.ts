// Assessment creation tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const assessmentCreationSteps: DriveStep[] = [
  {
    element: '[data-tour="assessment-creation-main"]',
    popover: {
      title: 'Create New Assessment',
      description: 'Welcome to the assessment creation wizard! This is where you can set up comprehensive onsite assessments based on questionnaire templates.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-template-selector"]',
    popover: {
      title: 'Select Questionnaire Template',
      description: 'Click this dropdown to choose the questionnaire template that will guide your assessment. This determines what questions and sections will be included.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessment-basic-info"]',
    popover: {
      title: 'Assessment Name & Description',
      description: 'Provide a clear name and optional description for your assessment. The name should clearly identify this specific assessment instance and help you distinguish it from others.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessment-location-hierarchy"]',
    popover: {
      title: 'Location Hierarchy',
      description: 'Define exactly where this assessment will be conducted. The hierarchy flows from Business Unit → Region → Site → Asset Group. Each level filters the options for the next level.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessment-objectives"]',
    popover: {
      title: 'Assessment Objectives',
      description: 'Define the key objectives and goals for this assessment. At least one objective is required for your assessment.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessment-objectives-actions"]',
    popover: {
      title: 'Add Objectives',
      description: 'Use these buttons to add objectives. "Add Custom" lets you create your own objectives, while "From Library" provides pre-defined objectives you can select from.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="assessment-actions"]',
    popover: {
      title: 'Create Your Assessment',
      description: 'Once you\'ve completed all required fields including objectives, click "Create Assessment" to set up your new onsite assessment.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="help-icon"]',
    popover: {
      title: 'Assessment Creation Tour Complete!',
      description: 'You now know how to create comprehensive onsite assessments with objectives! Use this help icon anytime to restart the tour or access tours on other pages.',
      side: 'bottom',
      align: 'end'
    }
  }
];

// Register the assessment creation tour
tourManager.registerTour({
  id: 'assessment-creation',
  steps: assessmentCreationSteps
});