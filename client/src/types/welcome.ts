export interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  component?: React.ComponentType;
}

export interface WelcomeState {
  currentStep: number;
  isCompleted: boolean;
  onboardingChoice: "tour" | "explore" | null;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setOnboardingChoice: (choice: "tour" | "explore") => void;
  completeWelcome: () => void;
  resetWelcome: () => void;
}
