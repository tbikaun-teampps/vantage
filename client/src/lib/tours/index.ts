// Central export for all tours
export { tourManager, useTourManager } from './tour-manager';
export type { TourId } from './tour-manager';

// Import tour configurations to register them
import './platform-overview-tour';
import './company-setup-tour';
import './company-form-tour';
import './dashboard-tour';
import './assessment-management-tour';
import './assessment-creation-tour';
import './assessment-detail-tour';
import './interview-management-tour';
import './interview-detail-tour';
import './interview-detail-mobile-tour';
import './questionnaire-management-tour';
import './questionnaire-creation-tour';
import './questionnaire-editor-tour';

// Additional tours
import './analytics-overview-tour';
import './company-settings-tour';
import './account-settings-tour';

// Future tours will be imported here:
// import './question-editor-tour';