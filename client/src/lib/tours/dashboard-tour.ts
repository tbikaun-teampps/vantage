// Dashboard tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const dashboardSteps: DriveStep[] = [
  {
    element: '[data-tour="dashboard-main"]',
    popover: {
      title: 'Dashboard Overview',
      description: 'Welcome to your dashboard! Let\'s explore the three main sections that give you insights into your asset management health and compliance.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="dashboard-cards"]',
    popover: {
      title: 'Key Metrics Cards',
      description: 'These cards show your most important metrics at a glance - overall scores, recent assessments, and key performance indicators.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="dashboard-quick-actions"]',
    popover: {
      title: 'Quick Actions',
      description: 'Use these quick action cards to jump right into your most common tasks - starting new assessments, continuing work in progress, or reviewing completed assessments.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="quick-action-start-new"]',
    popover: {
      title: 'Start New Assessment',
      description: 'Click here to begin a fresh assessment. This will guide you through creating a new assessment from scratch.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="quick-action-continue"]',
    popover: {
      title: 'Continue Active Assessments',
      description: 'Resume work on assessments that are currently in progress. The badge shows how many active assessments you have.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="quick-action-review"]',
    popover: {
      title: 'Review Completed Assessments',
      description: 'Access your finished assessments to review results, generate reports, or extract insights. The badge shows your completed count.',
      side: 'bottom',
      align: 'center'
    }
  },
  // {
  //   element: '[data-tour="dashboard-chart"]',
  //   popover: {
  //     title: 'Interactive Charts',
  //     description: 'Visualize your data over time with interactive charts. Track trends, compare metrics, and drill down into specific areas.',
  //     side: 'top',
  //     align: 'center'
  //   }
  // },
  {
    element: '[data-tour="dashboard-table"]',
    popover: {
      title: 'Question Analytics Table',
      description: 'This table shows detailed performance analytics for each question across different locations. You can click on responses, actions, and assessments to view more details.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="dashboard-table"] tbody tr:first-child td:nth-child(6)',
    popover: {
      title: 'Interactive Response Cells',
      description: 'Click on response count cells to view detailed response data and scores for that specific question and location.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="dashboard-table"] tbody tr:first-child td:nth-child(7)',
    popover: {
      title: 'Interactive Action Cells',
      description: 'Click on action count cells to see all actions created for this question, including titles, descriptions, and assessment details.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="dashboard-table"] tbody tr:first-child td:nth-child(9)',
    popover: {
      title: 'Interactive Assessment Cells',
      description: 'Click on assessment count cells to view all assessments that include this question for comprehensive tracking.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="dashboard-main"]',
    popover: {
      title: 'Dashboard Complete!',
      description: 'You now know the three main sections of your dashboard. Use these views to monitor and analyze your asset management position effectively.',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the dashboard tour
tourManager.registerTour({
  id: 'dashboard-overview',
  steps: dashboardSteps
});