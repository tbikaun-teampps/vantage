// Company form tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const companyFormSteps: DriveStep[] = [
  {
    element: 'body',
    popover: {
      title: 'Company Creation Form',
      description: 'Great! You\'re now on the company creation page. Let\'s walk through filling out your company details.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="company-name-input"]',
    popover: {
      title: 'Company Name',
      description: 'Enter your company name here. This is the only required field to create a company.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="create-company-button"]',
    popover: {
      title: 'Create Your Company',
      description: 'Once you\'ve filled in the company name, click this button to create your company and unlock all of Vantage\'s features!',
      side: 'top',
      align: 'center'
    }
  }
];

// Register the company form tour
tourManager.registerTour({
  id: 'company-form',
  steps: companyFormSteps
});