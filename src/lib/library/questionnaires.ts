// Library of pre-built questions, sections, and complete questionnaires

import { type RatingScaleSet } from "./rating-scales";

export interface QuestionTemplate {
  id: number;
  title: string;
  question_text: string;
  context: string;
  category: string;
  // Custom rating scale descriptions for this question (optional)
  ratingScaleDescriptions?: {
    [scaleValue: number]: string; // Custom description for each scale value
  };
}

export interface StepTemplate {
  id: string;
  title: string;
  description?: string;
  questionIds: number[]; // References to questionTemplates
}

export interface SectionTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: StepTemplate[];
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string;
  complianceFramework?: string;
  estimatedMinutes?: number;
  tags: string[];
  ratingScaleSet: RatingScaleSet; // The rating scale set used for this questionnaire
  sections: SectionTemplate[];
}

// Rating Scale Sets - Available rating scales that can be used in questionnaires
export const ratingScaleSets: RatingScaleSet[] = [
  {
    id: 1,
    name: "5-Point Likert Scale",
    description:
      "Standard agreement scale from strongly disagree to strongly agree",
    category: "Agreement",
    scales: [
      {
        value: 1,
        name: "Strongly Disagree",
        description: "Completely oppose or reject the statement",
      },
      {
        value: 2,
        name: "Disagree",
        description:
          "Generally oppose or have reservations about the statement",
      },
      {
        value: 3,
        name: "Neutral",
        description: "Neither agree nor disagree with the statement",
      },
      {
        value: 4,
        name: "Agree",
        description: "Generally support or accept the statement",
      },
      {
        value: 5,
        name: "Strongly Agree",
        description: "Completely support or endorse the statement",
      },
    ],
  },
  {
    id: 2,
    name: "Quality Scale",
    description: "Assessment scale for quality levels",
    category: "Quality",
    scales: [
      {
        value: 1,
        name: "Poor",
        description: "Below acceptable standards",
      },
      {
        value: 2,
        name: "Fair",
        description: "Meets minimum requirements",
      },
      {
        value: 3,
        name: "Good",
        description: "Meets expectations",
      },
      {
        value: 4,
        name: "Very Good",
        description: "Exceeds expectations",
      },
      {
        value: 5,
        name: "Excellent",
        description: "Outstanding performance",
      },
    ],
  },
];

// Question Templates - Dummy placeholders for demonstration
export const questionTemplates: QuestionTemplate[] = [
  {
    id: 1,
    title: "Sample Question 1",
    question_text: "This is a sample question for demonstration purposes.",
    context: "Sample context explaining the purpose of this question.",
    category: "Sample Category",
  },
  {
    id: 2,
    title: "Sample Question 2",
    question_text: "Another sample question with custom rating descriptions.",
    context: "This question shows how custom rating scale descriptions work.",
    category: "Sample Category",
    ratingScaleDescriptions: {
      1: "Not implemented at all",
      2: "Partially implemented",
      3: "Moderately implemented",
      4: "Well implemented",
      5: "Fully optimized implementation",
    },
  },
];

// Section Templates - Dummy placeholders for demonstration
export const sectionTemplates: SectionTemplate[] = [
  {
    id: "sample-section",
    title: "Sample Section",
    description: "A sample section for demonstration purposes",
    category: "Sample",
    steps: [
      {
        id: "sample-step-1",
        title: "Sample Step 1",
        description: "First sample step",
        questionIds: [1],
      },
      {
        id: "sample-step-2",
        title: "Sample Step 2",
        description: "Second sample step",
        questionIds: [2],
      },
    ],
  },
];

// Complete Questionnaire Templates - Dummy placeholders for demonstration
export const questionnaireTemplates: QuestionnaireTemplate[] = [
  {
    id: "sample-questionnaire",
    name: "Sample Questionnaire",
    description: "A sample questionnaire for demonstration purposes",
    category: "Sample",
    industry: "General",
    complianceFramework: "Custom",
    estimatedMinutes: 15,
    tags: ["sample", "demo", "test"],
    ratingScaleSet: ratingScaleSets[0], // Uses the 5-Point Likert Scale
    sections: [sectionTemplates[0]],
  },
];


// Helper to get questions by IDs
export const getQuestionsByIds = (ids: number[]): QuestionTemplate[] => {
  return ids
    .map((id) => questionTemplates.find((q) => q.id === id))
    .filter(Boolean) as QuestionTemplate[];
};
