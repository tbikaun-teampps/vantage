// Platform overview tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const platformOverviewSteps: DriveStep[] = [
  {
    element: '[data-tour="welcome-component"]',
    popover: {
      title: 'Welcome to Vantage! 🎉',
      description: 'Let\'s take a quick tour of the platform to help you get oriented and discover what Vantage can do for you.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="company-selector"]',
    popover: {
      title: 'Company Management',
      description: 'This is your company selector. Companies help organize your assessments, data, and reporting. You can create one when you\'re ready.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-sidebar-section="monitor"]',
    popover: {
      title: 'Monitor Section',
      description: 'View your dashboards and analytics to monitor asset management posture and compliance across your organization.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-sidebar-section="discover"]',
    popover: {
      title: 'Discover Section',
      description: 'Create and manage assessments, questionnaires, and evaluations to discover risks and gaps.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-sidebar-section="improve"]',
    popover: {
      title: 'Improve Section',
      description: 'Access reports, action plans, and improvement recommendations based on your assessment results.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-sidebar-section="settings"]',
    popover: {
      title: 'Settings Section',
      description: 'Configure your companies, manage user accounts, and customize platform settings.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-tour="help-icon"]',
    popover: {
      title: 'Help & Tours',
      description: 'This help icon (?) appears on pages with guided tours. Click it to get step-by-step guidance through different features as you explore the platform.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="feedback-button"]',
    popover: {
      title: 'Send Feedback',
      description: 'Have suggestions, questions, or found a bug? Click the feedback button to send us your thoughts directly. We value your input to improve the platform!',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="welcome-component"]',
    popover: {
      title: 'Ready to Get Started?',
      description: 'You can create a company to start using assessments, or explore the platform features first. Take your time - everything is here when you\'re ready!',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the platform overview tour
tourManager.registerTour({
  id: 'platform-overview',
  steps: platformOverviewSteps
});