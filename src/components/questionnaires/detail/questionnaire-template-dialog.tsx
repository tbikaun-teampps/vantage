import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  IconClock,
  IconTag,
  IconBuilding,
  IconShieldCheck,
  IconFileText,
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconArrowRight,
  IconUpload,
} from "@tabler/icons-react";
import {
  useSectionActions,
  useStepActions,
  useQuestionActions,
} from "@/hooks/questionnaire/useQuestions";
import {
  useQuestionnaireActions,
  useQuestionnaireById,
} from "@/hooks/useQuestionnaires";
import {
  questionnaireTemplates,
  sectionTemplates,
  getQuestionsByIds,
  ratingScaleSets,
} from "@/lib/library/questionnaires";
import type {
  QuestionnaireTemplate,
  SectionTemplate,
} from "@/lib/library/questionnaires";
import { toast } from "sonner";
import { useRatingScaleActions } from "@/hooks/questionnaire/useRatingScales";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
// import { QuestionnaireUploadDialog } from "../new/components/questionnaire-upload-dialog";

interface QuestionnaireTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireId: number;
  onTemplateCreated?: (questionnaireId: number) => void; // Callback when new questionnaire is created from template
  defaultTab?: string; // Default tab to open
}

export function QuestionnaireTemplateDialog({
  open,
  onOpenChange,
  questionnaireId,
  onTemplateCreated,
  defaultTab = "templates",
}: QuestionnaireTemplateDialogProps) {
  const companyId = useCompanyFromUrl();
  const { createQuestionnaire } = useQuestionnaireActions();
  const { createSection } = useSectionActions();
  const { createStep } = useStepActions();
  const { createQuestion, updateQuestionRatingScales } = useQuestionActions();
  const { createRatingScale } = useRatingScaleActions(questionnaireId);
  const { data: selectedQuestionnaire } = useQuestionnaireById(questionnaireId);

  const [selectedTab, setSelectedTab] = useState(defaultTab);
  const [selectedTemplate, setSelectedTemplate] =
    useState<QuestionnaireTemplate | null>(null);
  const [selectedSections, setSelectedSections] = useState<SectionTemplate[]>(
    []
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [ratingScaleConflicts, setRatingScaleConflicts] = useState<
    Array<{
      templateScale: any;
      existingScale?: any;
      conflictType: "name" | "value" | "both";
      resolution: "skip" | "rename" | "replace" | "use_existing";
    }>
  >([]);

  const resetForm = () => {
    setSelectedTemplate(null);
    setSelectedSections([]);
    setCustomTitle("");
    setCustomDescription("");
    setSelectedTab(defaultTab);
    setShowConflictDialog(false);
    setShowUploadDialog(false);
    setRatingScaleConflicts([]);
  };

  const handleUploadSuccess = (questionnaireId: number) => {
    resetForm();
    onOpenChange(false);

    // If we have a callback for template creation, call it
    if (onTemplateCreated) {
      onTemplateCreated(questionnaireId);
    }
  };

  const detectRatingScaleConflicts = (templateRatingScales: any[]) => {
    if (!selectedQuestionnaire?.rating_scales) {
      return []; // No existing rating scales to conflict with
    }

    const existingScales = selectedQuestionnaire.rating_scales;
    const conflicts: Array<{
      templateScale: any;
      existingScale?: any;
      conflictType: "name" | "value" | "both";
      resolution: "skip" | "rename" | "replace" | "use_existing";
    }> = [];

    templateRatingScales.forEach((templateScale) => {
      const nameConflict = existingScales.find(
        (existing) =>
          existing.name.toLowerCase() === templateScale.name.toLowerCase()
      );
      const valueConflict = existingScales.find(
        (existing) => existing.value === templateScale.value
      );

      if (nameConflict || valueConflict) {
        const conflictType =
          nameConflict && valueConflict && nameConflict.id === valueConflict.id
            ? "both"
            : nameConflict
              ? "name"
              : "value";

        conflicts.push({
          templateScale,
          existingScale: nameConflict || valueConflict,
          conflictType,
          resolution: "use_existing", // Default resolution
        });
      }
    });

    return conflicts;
  };

  const checkForConflicts = () => {
    let templateRatingScales: any[] = [];

    if (selectedTemplate?.ratingScaleSet) {
      templateRatingScales = selectedTemplate.ratingScaleSet.scales;
    } else if (selectedSections.length > 0) {
      // For individual sections, use default rating scale set
      const defaultRatingScaleSet = ratingScaleSets[0];
      if (defaultRatingScaleSet) {
        templateRatingScales = defaultRatingScaleSet.scales;
      }
    }

    const conflicts = detectRatingScaleConflicts(templateRatingScales);

    if (conflicts.length > 0) {
      setRatingScaleConflicts(conflicts);
      setShowConflictDialog(true);
      return true; // Has conflicts
    }

    return false; // No conflicts
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate && selectedSections.length === 0) return;

    // Check for rating scale conflicts first
    if (checkForConflicts()) {
      return; // Show conflict dialog instead of proceeding
    }

    setIsProcessing(true);
    try {
      let actualQuestionnaireId = questionnaireId;

      // If questionnaireId is 1337, create a new questionnaire first
      if (questionnaireId === 1337) {
        // Use template name or custom name for the new questionnaire
        const questionnaireName =
          selectedTemplate?.name || "Custom Questionnaire from Sections";
        const questionnaireDescription =
          selectedTemplate?.description || "Created from template sections";

        const newQuestionnaire = await createQuestionnaire({
          name: questionnaireName,
          description: questionnaireDescription,
          guidelines: "",
          status: "draft",
          company_id: companyId,
        });

        actualQuestionnaireId = newQuestionnaire.id;
      }

      // If using a full template
      if (selectedTemplate) {
        throw new Error('Not implemented yet');
        // First, create rating scales if they don't exist and keep track of created scale IDs
        const ratingScaleSet = selectedTemplate.ratingScaleSet;
        const createdRatingScaleIds: Record<number, number> = {}; // Maps scale value to created ID

        if (ratingScaleSet) {
          // TODO: Update with batch insert method.
          for (const scale of ratingScaleSet.scales) {
            try {
              const createdScale = await createRatingScale({
                questionnaireId: actualQuestionnaireId,
                ratingData: {
                  // questionnaire_id: actualQuestionnaireId,
                  value: scale.value,
                  name: scale.name,
                  description: scale.description,
                  order_index: 1,
                },
              });
              createdRatingScaleIds[scale.value] = createdScale.id;
            } catch (error) {
              // If rating scale already exists, we'll need to get its ID from the questionnaire
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Rating scale might already exist"
              );
            }
          }
        }

        // Create sections from template
        for (const section of selectedTemplate.sections) {
          const createdSection = await createSection({
            questionnaireId: actualQuestionnaireId,
            title: section.title,
          });

          // Create steps for each section
          for (const step of section.steps) {
            const createdStep = await createStep({
              sectionId: createdSection.id,
              title: step.title,
            });

            // Create questions for each step
            const questions = getQuestionsByIds(step.questionIds);
            for (const question of questions) {
              const createdQuestion = await createQuestion({
                stepId: createdStep.id,
                title: question.title,
                question_text: question.question_text,
                context: question.context,
              });

              // If the question has custom rating scale descriptions, apply them
              if (question.ratingScaleDescriptions) {
                const ratingScaleAssociations = Object.entries(
                  question.ratingScaleDescriptions
                )
                  .filter(
                    ([scaleValue, _]) =>
                      createdRatingScaleIds[parseInt(scaleValue)]
                  )
                  .map(([scaleValue, description]) => ({
                    ratingScaleId: createdRatingScaleIds[parseInt(scaleValue)],
                    description: description,
                  }));

                if (ratingScaleAssociations.length > 0) {
                  await updateQuestionRatingScales({
                    questionId: createdQuestion.id,
                    ratingScaleAssociations,
                  });
                }
              }
            }
          }
        }
      }

      // If using individual sections
      else if (selectedSections.length > 0) {
        // Note: For individual sections, we don't have a specific rating scale set
        // So we'll use the default rating scale set from the library
        const defaultRatingScaleSet = ratingScaleSets[0]; // Use first rating scale set as default
        const createdRatingScaleIds: Record<number, number> = {};

        // Create default rating scales for individual sections
        if (defaultRatingScaleSet) {
          for (const scale of defaultRatingScaleSet.scales) {
            try {
              const createdScale = await createRatingScale({
                questionnaireId: actualQuestionnaireId,
                ratingData: {
                  value: scale.value,
                  name: scale.name,
                  description: scale.description,
                },
              });
              createdRatingScaleIds[scale.value] = createdScale.id;
            } catch {
              console.log("Rating scale might already exist:", scale.name);
            }
          }
        }

        for (const section of selectedSections) {
          const createdSection = await createSection({
            questionnaireId: actualQuestionnaireId,
            title: section.title,
          });

          for (const step of section.steps) {
            const createdStep = await createStep({
              sectionId: createdSection.id,
              title: step.title,
            });

            const questions = getQuestionsByIds(step.questionIds);
            for (const question of questions) {
              const createdQuestion = await createQuestion({
                stepId: createdStep.id,
                title: question.title,
                question_text: question.question_text,
                context: question.context,
              });

              // If the question has custom rating scale descriptions, apply them
              if (question.ratingScaleDescriptions) {
                const ratingScaleAssociations = Object.entries(
                  question.ratingScaleDescriptions
                )
                  .filter(
                    ([scaleValue, _]) =>
                      createdRatingScaleIds[parseInt(scaleValue)]
                  )
                  .map(([scaleValue, description]) => ({
                    ratingScaleId: createdRatingScaleIds[parseInt(scaleValue)],
                    description: description,
                  }));

                if (ratingScaleAssociations.length > 0) {
                  await updateQuestionRatingScales({
                    questionId: createdQuestion.id,
                    ratingScaleAssociations,
                  });
                }
              }
            }
          }
        }
      }

      resetForm();
      onOpenChange(false);

      // If we created a new questionnaire, notify the parent component
      if (questionnaireId === 1337 && onTemplateCreated) {
        onTemplateCreated(actualQuestionnaireId);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create from template"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSectionSelection = (section: SectionTemplate) => {
    setSelectedSections((prev) => {
      const isSelected = prev.some((s) => s.id === section.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== section.id);
      } else {
        return [...prev, section];
      }
    });
  };

  const handleTemplateWithResolutions = async () => {
    if (!selectedTemplate && selectedSections.length === 0) return;

    setIsProcessing(true);
    try {
      let actualQuestionnaireId = questionnaireId;

      // If questionnaireId is 1337, create a new questionnaire first
      if (questionnaireId === 1337) {
        const questionnaireName =
          selectedTemplate?.name || "Custom Questionnaire from Sections";
        const questionnaireDescription =
          selectedTemplate?.description || "Created from template sections";

        const newQuestionnaire = await createQuestionnaire({
          name: questionnaireName,
          description: questionnaireDescription,
          guidelines: "",
          status: "draft",
          company_id: companyId,
        });

        actualQuestionnaireId = newQuestionnaire.id;
      }

      // Build rating scale mapping based on resolutions
      const ratingScaleMapping: Record<number, string> = {};

      // Process rating scales with conflict resolutions
      if (selectedTemplate?.ratingScaleSet) {
        for (const scale of selectedTemplate.ratingScaleSet.scales) {
          const conflict = ratingScaleConflicts.find(
            (c) =>
              c.templateScale.value === scale.value &&
              c.templateScale.name === scale.name
          );

          if (conflict) {
            switch (conflict.resolution) {
              case "use_existing":
                if (conflict.existingScale) {
                  ratingScaleMapping[scale.value] = conflict.existingScale.id;
                }
                break;
              case "replace":
                // Delete existing and create new one
                // TODO: Implement delete existing scale
                const replacedScale = await createRatingScale(
                  actualQuestionnaireId,
                  {
                    value: scale.value,
                    name: scale.name,
                    description: scale.description,
                  }
                );
                ratingScaleMapping[scale.value] = replacedScale.id;
                break;
              case "rename":
                // Create with modified name
                const renamedScale = await createRatingScale(
                  actualQuestionnaireId,
                  {
                    value: scale.value,
                    name: `${scale.name} (Template)`,
                    description: scale.description,
                  }
                );
                ratingScaleMapping[scale.value] = renamedScale.id;
                break;
              case "skip":
                // Don't create this rating scale
                break;
            }
          } else {
            // No conflict, create normally
            try {
              const createdScale = await createRatingScale({
                questionnaireId: actualQuestionnaireId,
                ratingData: {
                  questionnaire_id: actualQuestionnaireId,
                  value: scale.value,
                  name: scale.name,
                  description: scale.description,
                },
              });
              ratingScaleMapping[scale.value] = createdScale.id;
            } catch (error) {
              console.log("Error creating rating scale:", error);
            }
          }
        }
      }

      // Continue with template import using the established rating scale mapping
      await continueTemplateImport(actualQuestionnaireId, ratingScaleMapping);

      resetForm();
      onOpenChange(false);

      // If we created a new questionnaire, notify the parent component
      if (questionnaireId === 1337 && onTemplateCreated) {
        onTemplateCreated(actualQuestionnaireId);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create from template"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const continueTemplateImport = async (
    actualQuestionnaireId: number,
    ratingScaleMapping: Record<number, string>
  ) => {
    // Continue with sections and questions import...
    const sectionsToImport = selectedTemplate
      ? selectedTemplate.sections
      : selectedSections;

    for (const section of sectionsToImport) {
      const createdSection = await createSection({
        questionnaireId: actualQuestionnaireId,
        title: section.title,
      });

      for (const step of section.steps) {
        const createdStep = await createStep({
          sectionId: createdSection.id,
          title: step.title,
        });

        const questions = getQuestionsByIds(step.questionIds);
        for (const question of questions) {
          const createdQuestion = await createQuestion({
            stepId: createdStep.id,
            title: question.title,
            question_text: question.question_text,
            context: question.context,
          });

          // Apply rating scale associations using the mapping
          if (question.ratingScaleDescriptions) {
            const ratingScaleAssociations = Object.entries(
              question.ratingScaleDescriptions
            )
              .filter(
                ([scaleValue, _]) => ratingScaleMapping[parseInt(scaleValue)]
              )
              .map(([scaleValue, description]) => ({
                ratingScaleId: ratingScaleMapping[parseInt(scaleValue)],
                description: description,
              }));

            if (ratingScaleAssociations.length > 0) {
              await updateQuestionRatingScales({
                questionId: createdQuestion.id,
                ratingScaleAssociations,
              });
            }
          }
        }
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Use Questionnaire Templates</DialogTitle>
          <DialogDescription>
            Start with a complete questionnaire template or build from
            individual sections.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Full Templates</TabsTrigger>
            <TabsTrigger value="sections">Section Library</TabsTrigger>
            <TabsTrigger value="upload">Upload JSON</TabsTrigger>
            <TabsTrigger value="custom">Custom Build</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {questionnaireTemplates.map((template) => {
                  const totalQuestions = template.sections.reduce(
                    (acc, section) =>
                      acc +
                      section.steps.reduce(
                        (stepAcc, step) => stepAcc + step.questionIds.length,
                        0
                      ),
                    0
                  );

                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? "border-primary bg-accent"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {template.name}
                            </CardTitle>
                            <CardDescription>
                              {template.description}
                            </CardDescription>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <IconCheck className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <IconFileText className="h-3 w-3 mr-1" />
                            {template.sections.length} sections
                          </Badge>
                          <Badge variant="secondary">
                            {totalQuestions} questions
                          </Badge>
                          {template.estimatedMinutes && (
                            <Badge variant="outline">
                              <IconClock className="h-3 w-3 mr-1" />
                              {template.estimatedMinutes} min
                            </Badge>
                          )}
                          {template.industry && (
                            <Badge variant="outline">
                              <IconBuilding className="h-3 w-3 mr-1" />
                              {template.industry}
                            </Badge>
                          )}
                          {template.complianceFramework && (
                            <Badge variant="outline">
                              <IconShieldCheck className="h-3 w-3 mr-1" />
                              {template.complianceFramework}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              <IconTag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Sections:</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {template.sections.map((section) => (
                              <li
                                key={section.id}
                                className="flex items-center gap-2"
                              >
                                <span className="text-muted-foreground">•</span>
                                <span>{section.title}</span>
                                <span className="text-xs">
                                  (
                                  {section.steps.reduce(
                                    (acc, step) =>
                                      acc + step.questionIds.length,
                                    0
                                  )}{" "}
                                  questions)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select individual sections to build a custom questionnaire.
            </p>
            <ScrollArea className="h-[450px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {sectionTemplates.map((section) => {
                  const isSelected = selectedSections.some(
                    (s) => s.id === section.id
                  );
                  const totalQuestions = section.steps.reduce(
                    (acc, step) => acc + step.questionIds.length,
                    0
                  );

                  return (
                    <Card
                      key={section.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-accent"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => toggleSectionSelection(section)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">
                              {section.title}
                            </CardTitle>
                            <CardDescription>
                              {section.description}
                            </CardDescription>
                          </div>
                          {isSelected && (
                            <IconCheck className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-2">
                          <Badge variant="secondary">{section.category}</Badge>
                          <Badge variant="outline">
                            {totalQuestions} questions
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          {section.steps.map((step) => (
                            <div
                              key={step.id}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <span className="text-muted-foreground">•</span>
                              <span>{step.title}</span>
                              <span className="text-xs">
                                ({step.questionIds.length} questions)
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
            {selectedSections.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedSections.length} section
                {selectedSections.length !== 1 ? "s" : ""}
              </p>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Upload Questionnaire JSON
                </h3>
                <p className="text-sm text-muted-foreground">
                  Import a questionnaire from a JSON file. This supports rating
                  scales, sections, steps, and questions.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="p-8 border-2 border-dashed rounded-lg">
                  <IconUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to start the upload process
                  </p>
                  <Button
                    onClick={() => setShowUploadDialog(true)}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    <IconUpload className="h-4 w-4 mr-2" />
                    Upload JSON File
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground max-w-md">
                  <p>
                    Supported format: JSON files with rating_scales and sections
                    arrays. The upload dialog will guide you through validation,
                    preview, and import.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-title">Questionnaire Title</Label>
                <Input
                  id="custom-title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter questionnaire title..."
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-description">Description</Label>
                <Textarea
                  id="custom-description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe the purpose of this questionnaire..."
                  className="min-h-[100px]"
                  disabled={isProcessing}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Start with a blank questionnaire and build it from scratch using
                the questionnaire editor.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            <IconX className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          {selectedTab !== "upload" && (
            <Button
              onClick={handleUseTemplate}
              disabled={
                isProcessing ||
                (selectedTab === "templates" && !selectedTemplate) ||
                (selectedTab === "sections" && selectedSections.length === 0) ||
                (selectedTab === "custom" && !customTitle.trim())
              }
            >
              <IconCheck className="h-4 w-4 mr-2" />
              {isProcessing ? "Creating..." : "Use Template"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Upload Dialog */}
      {/* <QuestionnaireUploadDialog
        isOpen={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onImportSuccess={handleUploadSuccess}
      /> */}

      {/* Conflict Resolution Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-amber-500" />
              Rating Scale Conflicts Detected
            </DialogTitle>
            <DialogDescription>
              The template contains rating scales that conflict with your
              existing ones. Choose how to resolve each conflict below.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] w-full">
            <div className="space-y-4 p-4">
              {ratingScaleConflicts.map((conflict, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">
                          Conflict #{index + 1}:{" "}
                          {conflict.conflictType === "both"
                            ? "Name & Value"
                            : conflict.conflictType === "name"
                              ? "Name"
                              : "Value"}{" "}
                          Conflict
                        </h4>
                        <Badge variant="destructive" className="text-xs mt-1">
                          {conflict.conflictType.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Template Scale */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-blue-600">
                          Template Scale
                        </Label>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {conflict.templateScale.name}
                            </span>
                            <Badge variant="outline">
                              Value: {conflict.templateScale.value}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {conflict.templateScale.description}
                          </p>
                        </div>
                      </div>

                      {/* Existing Scale */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-amber-600">
                          Existing Scale
                        </Label>
                        <div className="bg-amber-50 border border-amber-200 rounded p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {conflict.existingScale?.name}
                            </span>
                            <Badge variant="outline">
                              Value: {conflict.existingScale?.value}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {conflict.existingScale?.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Resolution Options */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Resolution:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Button
                          variant={
                            conflict.resolution === "use_existing"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            const updated = [...ratingScaleConflicts];
                            updated[index].resolution = "use_existing";
                            setRatingScaleConflicts(updated);
                          }}
                        >
                          Use Existing
                        </Button>
                        <Button
                          variant={
                            conflict.resolution === "replace"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            const updated = [...ratingScaleConflicts];
                            updated[index].resolution = "replace";
                            setRatingScaleConflicts(updated);
                          }}
                        >
                          Replace
                        </Button>
                        <Button
                          variant={
                            conflict.resolution === "rename"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            const updated = [...ratingScaleConflicts];
                            updated[index].resolution = "rename";
                            setRatingScaleConflicts(updated);
                          }}
                        >
                          Rename Template
                        </Button>
                        <Button
                          variant={
                            conflict.resolution === "skip"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            const updated = [...ratingScaleConflicts];
                            updated[index].resolution = "skip";
                            setRatingScaleConflicts(updated);
                          }}
                        >
                          Skip
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConflictDialog(false)}
            >
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowConflictDialog(false);
                // Proceed with template import using the chosen resolutions
                handleTemplateWithResolutions();
              }}
            >
              <IconArrowRight className="h-4 w-4 mr-2" />
              Continue with Resolutions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
