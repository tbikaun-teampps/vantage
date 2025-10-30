import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuestionnaireActions } from "@/hooks/useQuestionnaires";
import { DashboardPage } from "@/components/dashboard";
// import QuestionnaireTemplateDialog from "../components/questionnaire-template-dialog";
import { IconFileText, IconUpload } from "@tabler/icons-react";
import { NewQuestionnaireBlankTab } from "@/components/questionnaires/new/blank-tab";
// import { NewQuestionnaireTemplateTab } from "./components/template-tab";
import { NewQuestionnaireUploadTab } from "@/components/questionnaires/new/upload-tab";
import { toast } from "sonner";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
// import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

export function QuestionnaireNewPage() {
  const companyId = useCompanyFromUrl();
  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();
  const { createQuestionnaire, isCreating } = useQuestionnaireActions();
  // const routes = useCompanyRoutes();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    guidelines: "",
    status: "draft" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  // const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(
    searchParams.get("tab") || "blank"
  );

  // Update selected tab when URL params change
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["blank", "template", "upload"].includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Questionnaire name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsProcessing(true);
    try {
      const newQuestionnaire = await createQuestionnaire({
        name: formData.name.trim(),
        description: formData.description.trim(),
        guidelines: formData.guidelines.trim(),
        status: formData.status,
        company_id: companyId,
      });
      navigate(`/questionnaires/${newQuestionnaire.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create questionnaire"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <DashboardPage
      title="Create New Questionnaire"
      description="Create a new questionnaire template for your company"
      showBack
      backHref="/questionnaires"
    >
      <div
        className="h-full max-w-[1600px] mx-auto overflow-auto px-6 pt-4"
        data-tour="questionnaire-creation-main"
      >
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList
            // className="grid w-full grid-cols-3 mb-6"
            data-tour="questionnaire-creation-tabs"
          >
            <TabsTrigger value="blank">
              <IconFileText className="h-4 w-4 mr-2" />
              Start from Scratch
            </TabsTrigger>
            {/* <TabsTrigger value="template">
              <IconTemplate className="h-4 w-4 mr-2" />
              Use a Template
            </TabsTrigger> */}
            <TabsTrigger value="upload">
              <IconUpload className="h-4 w-4 mr-2" />
              File Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blank">
            <NewQuestionnaireBlankTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              errors={errors}
              isProcessing={isProcessing}
              isLoading={isCreating}
            />
          </TabsContent>

          {/* <TabsContent value="template">
            <NewQuestionnaireTemplateTab
              setShowTemplateDialog={setShowTemplateDialog}
            />
          </TabsContent> */}

          <TabsContent value="upload">
            <NewQuestionnaireUploadTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Selection Dialog */}
      {/* <QuestionnaireTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        questionnaireId={1337} // We'll handle this differently for new questionnaires
        onTemplateCreated={(newQuestionnaireId) => {
          // Navigate to the newly created questionnaire
          navigate(routes.questionnaireDetail(newQuestionnaireId));
        }}
      /> */}
    </DashboardPage>
  );
}
