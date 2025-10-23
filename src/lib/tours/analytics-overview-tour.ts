// Analytics overview tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const analyticsSteps: DriveStep[] = [
  {
    element: '[data-tour="analytics-main"]',
    popover: {
      title: 'Welcome to Assessment Analytics',
      description: 'This comprehensive analytics dashboard helps you analyze assessment performance through metrics and geographic distribution. Let\'s explore the key features available.',
      side: 'bottom',
      align: 'center'
    },
    onHighlighted: () => {
      // Ensure we start on the metrics view
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('view') !== 'metrics') {
        currentUrl.searchParams.set('view', 'metrics');
        window.history.replaceState(null, '', currentUrl.toString());
        
        // Trigger the metrics tab if not already active
        setTimeout(() => {
          const metricsButton = document.querySelector('[data-tour="analytics-view-switcher"] button:first-child') as HTMLButtonElement;
          if (metricsButton && !metricsButton.classList.contains('bg-background')) {
            metricsButton.click();
          }
        }, 100);
      }
    }
  },
  {
    element: '[data-tour="analytics-view-switcher"]',
    popover: {
      title: 'View Switcher',
      description: 'Toggle between two powerful analysis views: Metrics for detailed performance heatmaps and Geography for spatial distribution insights. Each view provides unique perspectives on your assessment data.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="analytics-heatmap"]',
    popover: {
      title: 'Interactive Assessment Heatmap',
      description: 'This advanced heatmap visualizes performance data across multiple dimensions with dynamic filtering. Click the filter button to access comprehensive controls.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '[data-tour="analytics-heatmap-filters"]',
    popover: {
      title: 'Comprehensive Heatmap Filters',
      description: 'Advanced filtering sidebar with questionnaire selection, assessment scope (single or multi-assessment), organizational filters (business units, sites, roles), and visualization controls (data type, X/Y axis dimensions). Use these to create custom cross-dimensional analyses.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-tour="analytics-heatmap-fullscreen"]',
    popover: {
      title: 'Heatmap Fullscreen Mode',
      description: 'Enter fullscreen mode for an immersive analysis experience. Fullscreen provides more space for complex heatmaps and automatically collapses the filter sidebar to maximize visualization area.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="analytics-view-switcher"]',
    popover: {
      title: 'Switch to Geography View',
      description: 'Now let\'s explore the Geography view. The tour will automatically switch to show you the geographic distribution of your assessment data.',
      side: 'bottom',
      align: 'center'
    },
    onHighlighted: () => {
      // Programmatically switch to geography view during tour
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('view', 'geography');
      window.history.replaceState(null, '', currentUrl.toString());
      
      // Trigger the tab change (find and click the geography button)
      setTimeout(() => {
        const geographyButton = document.querySelector('[data-tour="analytics-view-switcher"] button:last-child') as HTMLButtonElement;
        if (geographyButton) {
          geographyButton.click();
        }
      }, 500);
    }
  },
  {
    element: '[data-tour="analytics-map"]',
    popover: {
      title: 'Geographic Distribution Map',
      description: 'This interactive map shows the spatial distribution of your assessment sites. Circle sizes and colors represent different metrics, with dynamic coloring based on organizational groupings (regions, business units) or performance scores.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="analytics-map-controls"]',
    popover: {
      title: 'Advanced Map Controls',
      description: 'Comprehensive filtering and visualization controls: select questionnaires and assessments, choose data types (scores, interviews, completion rates), set color groupings by region/business unit, and show/hide sites with no data.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '[data-tour="analytics-map-fullscreen"]',
    popover: {
      title: 'Map Fullscreen Mode',
      description: 'Enter fullscreen mode for enhanced geographic analysis. Fullscreen mode provides a larger map view ideal for detailed spatial analysis and pattern identification across your assessment sites.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="help-icon"]',
    popover: {
      title: 'Analytics Tour Complete!',
      description: 'You\'ve completed the analytics overview. The heatmap now includes advanced filtering with organizational hierarchy options, and the map features dynamic coloring, data quality indicators, and enhanced controls. Use this help icon anytime to replay the tour.',
      side: 'bottom',
      align: 'center'
    }
  }
];


// Register the tour with the tour manager
tourManager.registerTour({
  id: 'analytics-overview',
  steps: analyticsSteps,
  onComplete: () => {
    console.log("Analytics overview tour completed");
  }
});

export { analyticsSteps };