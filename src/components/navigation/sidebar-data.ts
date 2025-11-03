// components/sidebar-data.ts
import {
  IconBlocks,
  IconBuildingFactory2,
  IconChartBar,
  IconClipboardList,
  // IconCloud,
  IconDashboard,
  IconDatabase,
  IconDeviceDesktop,
  IconEdit,
  IconEngine,
  IconFileAnalytics,
  IconFlag,
  IconHelp,
  IconListDetails,
  IconUpload,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

/**
 * Generate sidebar navigation data for a specific company
 */
export function getSidebarData(companyId: string) {
  const companyPrefix = `/${companyId}`;

  return {
    user: {
      name: "Vantage",
      email: "vantage@teampps.com.au",
      avatar: "/assets/logos/vantage-logo.svg",
    },
    navMonitor: [
      {
        title: "Dashboard",
        url: `${companyPrefix}/dashboard`,
        icon: IconDashboard,
      },
      // {
      //   title: "Real-time Monitoring",
      //   url: `${companyPrefix}/monitoring`,
      //   icon: IconCloud,
      //   disabled: true,
      // },
    ],
    navDiscover: [
      {
        title: "Programs",
        url: `${companyPrefix}/programs`,
        icon: IconBlocks,
      },
      {
        title: "Assessments",
        url: `${companyPrefix}/assessments`,
        icon: IconClipboardList,
        items: [
          {
            title: "Desktop",
            url: `${companyPrefix}/assessments/desktop`,
            icon: IconDeviceDesktop,
            // items: [
            //   {
            //     title: "Data Requests",
            //     url: `${companyPrefix}/assessments/desktop/data-requests`,
            //     disabled: true,
            //   },
            // ],
          },
          {
            title: "Onsite",
            url: `${companyPrefix}/assessments/onsite`,
            icon: IconEngine,
            // items: [
            // ],
          },
        ],
      },
      {
        icon: IconUsers,
        title: "Interviews",
        url: `${companyPrefix}/interviews`,
      },
      {
        icon: IconEdit,
        title: "Questionnaires",
        url: `${companyPrefix}/questionnaires`,
      },
    ],
    navImprove: [
      {
        title: "Actions",
        icon: IconFlag,
        url: `${companyPrefix}/actions`,
      },
      {
        title: "Recommendations",
        icon: IconListDetails,
        url: `${companyPrefix}/recommendations`,
        // items: [
        //   {
        //     title: "Actions",
        //     url: `${companyPrefix}/recommendations/actions`,
        //   },
        //   {
        //       title: "Assistance",
        //       url: `${companyPrefix}/recommendations/assistance`,
        //       disabled: true,
        //     },
        //     {
        //         title: "Best Practices",
        //         url: `${companyPrefix}/recommendations/best-practices`,
        //         disabled: true,
        //       },
        //     ],
      },
      {
        title: "Analytics",
        icon: IconChartBar,
        url: `${companyPrefix}/analytics`,
        // items: [
        //   {
        //     title: "Benchmarks",
        //     url: `${companyPrefix}/analytics/benchmarks`,
        //     disabled: true,
        //   },
        // ],
      },
      {
        title: "Reports",
        icon: IconFileAnalytics,
        url: `${companyPrefix}/reports`,
        disabled: true,
        items: [
          {
            title: "Assessment Reports",
            url: `${companyPrefix}/reports/assessments`,
            disabled: true,
          },
          {
            title: "Custom Reports",
            url: `${companyPrefix}/reports/custom`,
            disabled: true,
          },
          {
            title: "Export Data",
            url: `${companyPrefix}/reports/export`,
            disabled: true,
          },
        ],
      },
    ],
    navData: [
      {
        title: "Upload Files",
        icon: IconUpload,
        url: `${companyPrefix}/data/upload`,
        disabled: true,
      },
      {
        title: "Connect Data",
        icon: IconDatabase,
        url: `${companyPrefix}/data/connect`,
        disabled: true,
      },
    ],
    navSettings: [
      {
        title: "Company",
        icon: IconBuildingFactory2,
        url: `${companyPrefix}/settings`,
      },
    ],
    navSecondary: [
      {
        title: "Team Members",
        url: `${companyPrefix}/team`,
        icon: IconUserPlus,
      },
      {
        title: "Help & Support",
        url: "/help",
        icon: IconHelp,
        disabled: true,
      },
    ],
  };
}
