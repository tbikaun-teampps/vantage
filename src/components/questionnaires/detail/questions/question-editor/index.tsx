import { InlineFieldEditor } from "@/components/ui/inline-field-editor";
import { InlineRatingScalesEditor } from "@/components/questionnaires/detail/questions/question-editor/inline-rating-scales-editor";
import { InlineRolesEditor } from "@/components/questionnaires/detail/questions/question-editor/inline-roles-editor";
import type { QuestionWithRatingScales } from "@/types/assessment";
import { InlineQuestionPartsEditor } from "./inline-question-parts-editor";

interface QuestionEditorProps {
  question: QuestionWithRatingScales;
  questionnaire: {
    id: number;
    title: string;
    description: string | null;
    sections: any[];
    questions: any[];
    questionnaire_rating_scales: any[];
  };
  isProcessing: boolean;
  updateQuestion: (params: {
    id: number;
    updates: { [key: string]: any };
  }) => Promise<void>;
  questionDisplayNumber?: string;
}

export function QuestionEditor({
  question,
  questionnaire,
  isProcessing,
  updateQuestion,
  questionDisplayNumber,
}: QuestionEditorProps) {
  return (
    <div
      key={question.id}
      className="bg-background space-y-4 p-4 border rounded-lg"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-lg">
          Question {questionDisplayNumber ? questionDisplayNumber : question.id}
        </span>
      </div>

      <InlineFieldEditor
        label="Title"
        value={question.title}
        placeholder="Enter question title"
        type="input"
        maxLength={200}
        disabled={isProcessing}
        validation={(value) => {
          if (!value.trim()) return "Title is required";
          if (value.length > 200)
            return "Title must be less than 200 characters";
          return null;
        }}
        onSave={async (newValue) => {
          await updateQuestion({
            id: question.id,
            updates: { title: newValue },
          });
        }}
        required
      />

      <InlineFieldEditor
        label="Context"
        value={question.context || ""}
        placeholder="Enter supporting context or instructions (optional)"
        type="textarea"
        maxLength={1000}
        minRows={3}
        disabled={isProcessing}
        validation={(value) => {
          if (value.length > 1000)
            return "Context must be less than 1000 characters";
          return null;
        }}
        onSave={async (newValue) => {
          await updateQuestion({
            id: question.id,
            updates: { context: newValue || null },
          });
        }}
      />

      {/* <InlineFieldEditor
        label="Question Text"
        value={question.question_text}
        placeholder="Enter the full question text"
        type="textarea"
        maxLength={2000}
        minRows={4}
        disabled={isProcessing}
        validation={(value) => {
          if (!value.trim()) return "Question text is required";
          if (value.length > 2000)
            return "Question text must be less than 2000 characters";
          return null;
        }}
        onSave={async (newValue) => {
          await updateQuestion({
            id: question.id,
            updates: { question_text: newValue },
          });
        }}
        required
      /> */}

      <InlineQuestionPartsEditor
        questionId={question.id}
        ratingScales={question.question_rating_scales}
        ratingScaleMapping={
          question.rating_scale_mapping as Record<string, unknown> | null
        }
      />

      <InlineRatingScalesEditor
        question={question}
        availableRatingScales={questionnaire.questionnaire_rating_scales}
        disabled={isProcessing}
        questionnaireId={questionnaire.id}
      />

      <InlineRolesEditor
        questionId={question.id}
        questionRoles={question.question_roles}
        disabled={isProcessing}
      />
    </div>
  );
}
