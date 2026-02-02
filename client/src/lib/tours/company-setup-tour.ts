// Company setup tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const companySetupSteps: DriveStep[] = [
  {
    element: 'body',
    popover: {
      title: 'Welcome to Vantage! 🎉',
      description: 'Let\'s get you started by setting up your first company. You need a company to access all features of the platform.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="company-selector"]',
    popover: {
      title: 'Company Selector',
      description: 'This is where you\'ll manage your companies. Currently, you have no companies set up. Let\'s create your first one!',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-tour="company-selector-trigger"]',
    popover: {
      title: 'Opening Selector...',
      description: 'We\'ll open the company selector for you so you can see the "Add Company" option.',
      side: 'right',
      align: 'center'
    },
    onHighlighted: () => {
      // Auto-click the selector trigger to open the dropdown
      const trigger = document.querySelector('[data-tour="company-selector-trigger"]') as HTMLElement;
      if (trigger) {
        setTimeout(() => trigger.click(), 500);
      }
    }
  },
  {
    element: '[data-tour="add-company-option"]',
    popover: {
      title: 'Add Company Option',
      description: 'Perfect! Here\'s the "Add Company" option. Click this to go to the company creation page.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: 'body',
    popover: {
      title: 'Next: Company Creation',
      description: 'When you click "Add Company", you\'ll be taken to a dedicated page where you can fill out your company details. This provides a better experience than a modal popup!',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the company setup tour
tourManager.registerTour({
  id: 'company-setup',
  steps: companySetupSteps
});