// Questionnaire editor tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const questionnaireEditorSteps: DriveStep[] = [
  {
    element: '[data-tour="questionnaire-tab-switcher"]',
    popover: {
      title: 'Questionnaire Editor',
      description: 'Welcome to the questionnaire editor! The interface is now organized into tabs for better navigation. Use these tabs to switch between Settings, Rating Scales, and Questions.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-general-settings"]',
    popover: {
      title: 'Settings Tab',
      description: 'Start here to configure basic questionnaire information like name, description, guidelines, and status. You can also duplicate or delete the questionnaire from this tab.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="questionnaire-rating-scales"]',
    popover: {
      title: 'Rating Scales Tab',
      description: 'Switch to this tab to define the rating scales that will be used for responses. You can add multiple rating scales and configure their values and labels.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="questionnaire-rating-actions"]',
    popover: {
      title: 'Rating Scale Actions',
      description: 'Use the "Add Rating" button to create new rating scales for your questionnaire responses.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-question-actions"]',
    popover: {
      title: 'Questions Tab',
      description: 'In the Questions tab, you can build the structure of your questionnaire with sections, steps, and questions. Import from the template library or add sections manually.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-tab-switcher"]',
    popover: {
      title: 'Navigation Tips',
      description: 'The tabs show completion status and counts. Green checkmarks indicate completed sections, and badges show the number of items in each tab.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-tab-switcher"]',
    popover: {
      title: 'Questionnaire Editor Complete!',
      description: 'You now know how to navigate the tabbed questionnaire editor! Build comprehensive questionnaires by working through each tab: Settings → Rating Scales → Questions.',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the questionnaire editor tour
tourManager.registerTour({
  id: 'questionnaire-editor',
  steps: questionnaireEditorSteps
});