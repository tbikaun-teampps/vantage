// Account settings tour configuration
import { type DriveStep } from "driver.js";
import { tourManager } from "./tour-manager";

const accountSteps: DriveStep[] = [
  {
    element: '[data-tour="account-settings"]',
    popover: {
      title: "Welcome to Account Settings",
      description:
        "Manage your personal profile and account security settings. This page centralises all your account management needs.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="account-profile"]',
    popover: {
      title: "Profile Information",
      description:
        "Update your personal details like your full name. Your email address is managed through authentication and requires contacting support to change.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="account-actions"]',
    popover: {
      title: "Account Actions",
      description:
        "Security actions for your account including signing out from this device. Your session will remain secure across all your devices.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="help-icon"]',
    popover: {
      title: "Account Settings Complete!",
      description:
        "You now know how to manage your profile, control demo mode, and handle account security. Use the help icon anytime to replay this tour.",
      side: "bottom",
      align: "center",
    },
  },
];

// Register the tour with the tour manager
tourManager.registerTour({
  id: "account-settings",
  steps: accountSteps,
  onComplete: () => {
    console.log("Account settings tour completed");
  },
});
