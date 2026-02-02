// Rating Scale Sets - Available rating scales that can be used in questionnaires

import type { BatchCreateQuestionnaireRatingScalesBodyData } from "@/types/api/questionnaire";

export interface RatingScaleSet {
  id: number;
  name: string;
  description: string;
  category: string;
  scales: BatchCreateQuestionnaireRatingScalesBodyData["scales"];
}

export const ratingScaleSets: RatingScaleSet[] = [
  {
    id: 1,
    name: "Maturity Level Scale",
    description:
      "Four-stage organisational maturity assessment scale measuring process development and capability",
    category: "Maturity",
    scales: [
      {
        value: 1,
        name: "Reactive",
        description:
          "Ad-hoc approach with minimal processes, responding to issues as they occur",
        order_index: 1,
      },
      {
        value: 2,
        name: "Planned",
        description:
          "Basic processes and planning established, but implementation is inconsistent",
        order_index: 2,
      },
      {
        value: 3,
        name: "Proactive",
        description:
          "Well-defined processes actively implemented with consistent monitoring and control",
        order_index: 3,
      },
      {
        value: 4,
        name: "Optimised",
        description:
          "Mature processes with continuous improvement and optimisation based on data-driven insights",
        order_index: 4,
      },
    ],
  },
  {
    id: 2,
    name: "5-Point Likert Scale",
    description:
      "Standard agreement scale from strongly disagree to strongly agree",
    category: "Agreement",
    scales: [
      {
        value: 1,
        name: "Strongly Disagree",
        description: "Completely oppose or reject the statement",
        order_index: 1,
      },
      {
        value: 2,
        name: "Disagree",
        description:
          "Generally oppose or have reservations about the statement",
        order_index: 2,
      },
      {
        value: 3,
        name: "Neutral",
        description: "Neither agree nor disagree with the statement",
        order_index: 3,
      },
      {
        value: 4,
        name: "Agree",
        description: "Generally support or accept the statement",
        order_index: 4,
      },
      {
        value: 5,
        name: "Strongly Agree",
        description: "Completely support or endorse the statement",
        order_index: 5,
      },
    ],
  },
  {
    id: 3,
    name: "Quality Scale",
    description: "Assessment scale for quality levels",
    category: "Quality",
    scales: [
      {
        value: 1,
        name: "Poor",
        description: "Below acceptable standards",
        order_index: 1,
      },
      {
        value: 2,
        name: "Fair",
        description: "Meets minimum requirements",
        order_index: 2,
      },
      {
        value: 3,
        name: "Good",
        description: "Meets expectations",
        order_index: 3,
      },
      {
        value: 4,
        name: "Very Good",
        description: "Exceeds expectations",
        order_index: 4,
      },
      {
        value: 5,
        name: "Excellent",
        description: "Outstanding performance",
        order_index: 5,
      },
    ],
  },
  {
    id: 4,
    name: "Binary Scale",
    description: "Simple yes/no or true/false scale",
    category: "Binary",
    scales: [
      {
        value: 1,
        name: "No",
        description: "Negative response",
        order_index: 1,
      },
      {
        value: 2,
        name: "Yes",
        description: "Affirmative response",
        order_index: 2,
      },
    ],
  },
  {
    id: 5,
    name: "Frequency Scale",
    description: "Scale measuring frequency of occurrence",
    category: "Frequency",
    scales: [
      {
        value: 1,
        name: "Never",
        description: "Does not occur",
        order_index: 1,
      },
      {
        value: 2,
        name: "Rarely",
        description: "Occurs infrequently",
        order_index: 2,
      },
      {
        value: 3,
        name: "Sometimes",
        description: "Occurs occasionally",
        order_index: 3,
      },
      {
        value: 4,
        name: "Often",
        description: "Occurs frequently",
        order_index: 4,
      },
      {
        value: 5,
        name: "Always",
        description: "Occurs all the time",
        order_index: 5,
      },
    ],
  },
  {
    id: 6,
    name: "Performance Scale",
    description: "Scale measuring performance levels",
    category: "Performance",
    scales: [
      {
        value: 1,
        name: "Unsatisfactory",
        description: "Does not meet performance standards",
        order_index: 1,
      },
      {
        value: 2,
        name: "Needs Improvement",
        description: "Below expectations, requires improvement",
        order_index: 2,
      },
      {
        value: 3,
        name: "Meets Expectations",
        description: "Satisfactorily meets performance standards",
        order_index: 3,
      },
      {
        value: 4,
        name: "Exceeds Expectations",
        description: "Surpasses performance standards",
        order_index: 4,
      },
      {
        value: 5,
        name: "Outstanding",
        description: "Exceptional performance far beyond standards",
        order_index: 5,
      },
    ],
  },
];
