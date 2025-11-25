import type { UniqueIdentifier } from "@dnd-kit/core";
import type {
  QuestionnaireSections,
  QuestionnaireSteps,
  QuestionnaireQuestions,
} from "@/types/api/questionnaire";
import type { TreeItem, TreeItems } from "./types";

// Entity types for questionnaire tree (no root node)
export type QuestionnaireEntityType = "section" | "step" | "question";

// Union type for all questionnaire tree entities
type QuestionnaireEntity =
  | QuestionnaireSections[number]
  | QuestionnaireSteps[number]
  | QuestionnaireQuestions[number];

// Extended TreeItem that includes the original entity data
export interface QuestionnaireTreeItem extends TreeItem {
  entity?: QuestionnaireEntity; // Optional for placeholder items
  name: string;
  entityType: QuestionnaireEntityType;
  isPlaceholder?: boolean; // True for "Add" placeholder items
  placeholderParentId?: number; // Parent entity ID for add-step/add-question placeholders
  numberLabel?: string; // Hierarchical number label like "1.", "1.1.", "1.1.1."
}

/**
 * Generates a unique ID for dnd-kit from entity type and ID
 */
function generateTreeItemId(
  entityType: QuestionnaireEntityType,
  entityId: number
): UniqueIdentifier {
  return `${entityType}_${entityId}`;
}

/**
 * Parses a tree item ID back into entity type and ID
 */
export function parseTreeItemId(id: UniqueIdentifier): {
  entityType: QuestionnaireEntityType;
  entityId: number;
} {
  const idStr = String(id);

  // Check each entity type
  const entityTypes = ["section", "step", "question"] as const;

  for (const type of entityTypes) {
    if (idStr.startsWith(type + "_")) {
      const entityId = idStr.slice(type.length + 1); // +1 for the underscore
      return {
        entityType: type,
        entityId: Number(entityId),
      };
    }
  }

  // Fallback (shouldn't happen with valid IDs)
  throw new Error(`Invalid tree item ID format: ${idStr}`);
}

/**
 * Transforms Questions into TreeItems (leaf nodes)
 */
function transformQuestions(
  questions: QuestionnaireQuestions
): QuestionnaireTreeItem[] {
  return questions.map((question) => ({
    id: generateTreeItemId("question", question.id),
    entity: question,
    name: question.title,
    entityType: "question" as const,
    children: [], // Questions are leaf nodes
    collapsed: false,
  }));
}

/**
 * Transforms Steps into TreeItems
 */
function transformSteps(steps: QuestionnaireSteps): QuestionnaireTreeItem[] {
  return steps.map((step) => ({
    id: generateTreeItemId("step", step.id),
    entity: step,
    name: step.title,
    entityType: "step" as const,
    children: transformQuestions(step.questions),
    collapsed: false,
  }));
}

/**
 * Main transformer: Converts sections array to TreeItems format
 * Sections are top-level items (no root wrapper node)
 */
export function sectionsToTreeItems(
  sections: QuestionnaireSections
): TreeItems {
  return sections.map((section) => ({
    id: generateTreeItemId("section", section.id),
    entity: section,
    name: section.title,
    entityType: "section" as const,
    children: transformSteps(section.steps),
    collapsed: false,
  }));
}
