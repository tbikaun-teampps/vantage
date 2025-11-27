import { InlineFieldEditor } from "@/components/ui/inline-field-editor";
import { InlineRatingScalesEditor } from "@/components/questionnaires/detail/questions/question-editor/inline-rating-scales-editor";
import { InlineRolesEditor } from "@/components/questionnaires/detail/questions/question-editor/inline-roles-editor";
import { InlineQuestionPartsEditor } from "@/components/questionnaires/detail/questions/question-editor/inline-question-parts-editor";
import type {
  GetQuestionnaireByIdResponseData,
  QuestionnaireQuestions,
  UpdateQuestionnaireQuestionBodyData,
  UpdateQuestionnaireQuestionResponseData,
} from "@/types/api/questionnaire";

interface QuestionEditorProps {
  question: QuestionnaireQuestions[number];
  questionnaire: GetQuestionnaireByIdResponseData;
  isProcessing: boolean;
  updateQuestion: ({
    id,
    updates,
  }: {
    id: number;
    updates: UpdateQuestionnaireQuestionBodyData;
  }) => Promise<UpdateQuestionnaireQuestionResponseData>;
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
    <>
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-gray-300" />
        <span className="font-medium text-lg whitespace-nowrap">
          Question {questionDisplayNumber ? questionDisplayNumber : question.id}
        </span>
        <div className="flex-1 border-t border-gray-300" />
      </div>
      <div key={question.id} className="bg-background space-y-4">
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
          helperText="Provide a concise title for the question to summarise its purpose."
        />

        <InlineFieldEditor
          label="Context"
          value={question.context}
          placeholder="Enter supporting context or instructions (optional)"
          type="textarea"
          maxLength={1000}
          minRows={3}
          disabled={isProcessing}
          validation={(value) => {
            if (!value.trim()) return "Context is required";
            if (value.length > 1000)
              return "Context must be less than 1000 characters";
            return null;
          }}
          onSave={async (newValue) => {
            await updateQuestion({
              id: question.id,
              updates: { context: newValue },
            });
          }}
          required
          helperText="Provide context or instructions to help auditors and interviewees understand the question(s)."
        />

        <InlineFieldEditor
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
          // required
          helperText="Enter the complete text of the question to be presented to auditors when performing an interview. Auditors directly select a question rating, and do not answer question elements. If no question text is provided, the text of the question elements will be used instead (if available)."
        />

        <InlineQuestionPartsEditor
          questionId={question.id}
          ratingScales={question.question_rating_scales}
          ratingScaleMapping={question.rating_scale_mapping}
        />

        <InlineRatingScalesEditor
          question={question}
          availableRatingScales={questionnaire.questionnaire_rating_scales}
          disabled={isProcessing}
          questionnaireId={questionnaire.id}
        />

        {question.question_roles && (
          <InlineRolesEditor
            questionId={question.id}
            questionRoles={question.question_roles}
            disabled={isProcessing}
          />
        )}
      </div>
    </>
  );
}
