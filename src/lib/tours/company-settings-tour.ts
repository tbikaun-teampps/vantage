// Company settings tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const companySettingsSteps: DriveStep[] = [
  {
    element: '[data-tour="company-settings-main"]',
    popover: {
      title: 'Welcome to Company Settings',
      description: 'This powerful interface lets you build and manage your complete organizational structure. You can create hierarchical relationships from companies down to individual roles using our intuitive master-detail layout.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="company-tree"]',
    popover: {
      title: 'Organizational Tree Navigation',
      description: 'The left panel shows your organizational hierarchy as an interactive tree. Click any item to select it, or use the expand/collapse arrows to navigate through levels. Each icon represents a different organizational level.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="company-detail-panel"]',
    popover: {
      title: 'Detail & Editing Panel',
      description: 'The right panel displays detailed information and editing forms for whatever you select in the tree. Forms automatically switch based on your selection, allowing you to edit companies, business units, regions, sites, and more.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '[data-tour="tree-node-badges"]',
    popover: {
      title: 'Item Counts & Status',
      description: 'These badges show how many child items each node contains. They provide a quick overview of your organizational structure at a glance, helping you understand the scope of each level.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-tour="entity-badges"]',
    popover: {
      title: 'Child Entity Management',
      description: 'These entity badges let you add and manage child items for the selected organizational level. Click on a badge to create new business units, regions, sites, asset groups, or roles within the current selection.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="form-sections"]',
    popover: {
      title: 'Organized Form Sections',
      description: 'Forms are organized into logical sections for easy editing. Each organizational level has its own specific fields and requirements. Changes are saved automatically when you move to different selections.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="company-actions"]',
    popover: {
      title: 'Company Management Actions',
      description: 'These actions let you manage your entire company structure. Export your organizational data for backup or analysis, or delete the company entirely if needed (with proper safeguards).',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="export-button"]',
    popover: {
      title: 'Export Your Structure',
      description: 'Use the export feature to download your complete organizational structure as a JSON file. This is helpful for backups, data analysis, or transferring structures between systems.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="tree-shortcuts"]',
    popover: {
      title: 'Power User Shortcuts',
      description: 'Pro tip: Hold Ctrl while clicking nodes to expand/collapse entire branches. Double-click any node to expand or collapse all its children at once. These shortcuts help you navigate large organizational structures quickly.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-tour="help-icon"]',
    popover: {
      title: 'Company Settings Tour Complete!',
      description: 'You now understand how to build and manage complex organizational structures. Start by creating business units, then add regions, sites, and asset groups. Use this help icon anytime to replay the tour.',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the tour with the tour manager
tourManager.registerTour({
  id: 'company-settings',
  steps: companySettingsSteps,
  onComplete: () => {
    console.log('Company settings tour completed');
  }
});