import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { IconX, IconCheck } from "@tabler/icons-react";
import {
  useSectionActions,
  useStepActions,
  useQuestionActions,
} from "@/hooks/questionnaire/useQuestions";
import {
  sectionTemplates,
  getQuestionsByIds,
} from "@/lib/library/questionnaires";
import type { SectionTemplate } from "@/lib/library/questionnaires";
import { toast } from "sonner";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireId: number;
}

export function AddSectionDialog({
  open,
  onOpenChange,
  questionnaireId,
}: AddSectionDialogProps) {
  const { createSection } = useSectionActions();
  const { createStep } = useStepActions();
  const { createQuestion } = useQuestionActions();

  const [title, setTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("create");
  const [selectedTemplate, setSelectedTemplate] =
    useState<SectionTemplate | null>(null);

  const resetForm = () => {
    setTitle("");
    setSelectedTemplate(null);
    setSelectedTab("create");
  };

  const handleAdd = async () => {
    if (!title.trim() && !selectedTemplate) return;

    console.log("handleAdd: ", questionnaireId, title);

    setIsProcessing(true);
    try {
      if (selectedTemplate) {
        // Create section from template
        const createdSection = await createSection({
          questionnaireId,
          title: selectedTemplate.title,
        });

        // Create steps for the section
        for (const step of selectedTemplate.steps) {
          const createdStep = await createStep({
            sectionId: createdSection.id,
            title: step.title,
          });

          // Create questions for each step
          const questions = getQuestionsByIds(step.questionIds);
          for (const question of questions) {
            await createQuestion({
              stepId: createdStep.id,
              title: question.title,
              context: question.context,
              question_text: question.question_text,
            });
          }
        }
      } else {
        // Create simple section
        console.log("Create simple section: ", {
          questionnaireId,
          title: title.trim(),
        });
        await createSection({
          questionnaireId,
          title: title.trim(),
        });
      }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create section"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Create a new section from scratch or use a pre-built template.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="template">From Template</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter section title..."
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                disabled={isProcessing}
              />
            </div>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {sectionTemplates.map((section) => {
                  const totalQuestions = section.steps.reduce(
                    (acc, step) => acc + step.questionIds.length,
                    0
                  );
                  const isSelected = selectedTemplate?.id === section.id;

                  return (
                    <Card
                      key={section.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-accent"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setSelectedTemplate(section)}
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
          <Button
            onClick={handleAdd}
            disabled={
              (selectedTab === "create" && !title.trim()) ||
              (selectedTab === "template" && !selectedTemplate) ||
              isProcessing
            }
          >
            <IconCheck className="h-4 w-4 mr-2" />
            {isProcessing ? "Adding..." : "Add Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
