import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  questionTemplates,
  type QuestionTemplate,
} from "@/lib/library/questionnaires";

interface AddDialogProps {
  open: boolean;
  onOpenChange: () => void;
  type?: "section" | "step" | "question";
  isProcessing: boolean;
  onAdd: (data: {
    title: string;
    question_text?: string;
    context?: string;
  }) => void;
}

export function AddDialog({
  open,
  onOpenChange,
  type,
  isProcessing,
  onAdd,
}: AddDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedTab, setSelectedTab] = useState("create");
  const [libraryTitle, setLibraryTitle] = useState("");
  const [libraryQuestionText, setLibraryQuestionText] = useState("");
  const [libraryContext, setLibraryContext] = useState("");

  const isQuestion = type === "question";
  const capitalizedType = type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : "";

  const canSubmit = isQuestion
    ? (libraryTitle ? libraryTitle.trim() : title.trim()) && !isProcessing
    : title.trim() && !isProcessing;

  const handleAdd = () => {
    if (!canSubmit) return;

    const trimmedTitle = libraryTitle || title;

    onAdd({
      title: trimmedTitle.trim(),
      question_text: libraryQuestionText || "",
      context: libraryContext || undefined,
    });

    // Reset form
    setTitle("");
    setLibraryTitle("");
    setLibraryQuestionText("");
    setLibraryContext("");
    setSelectedTab("create");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't submit if Enter is pressed in a textarea (allow newlines)
    if (e.target instanceof HTMLTextAreaElement) return;

    if (e.key === "Enter" && canSubmit) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleDialogClose = () => {
    // Reset form
    setTitle("");
    setLibraryTitle("");
    setLibraryQuestionText("");
    setLibraryContext("");
    setSelectedTab("create");
    onOpenChange();
  };

  const handleUseLibraryQuestion = (libraryQuestion: QuestionTemplate) => {
    setLibraryTitle(libraryQuestion.title);
    setLibraryQuestionText(libraryQuestion.question_text);
    setLibraryContext(libraryQuestion.context || "");
    setSelectedTab("create");
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        className={isQuestion ? "max-w-4xl" : undefined}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle>Add New {capitalizedType}</DialogTitle>
          <DialogDescription>
            {isQuestion
              ? "Create a new question from scratch or choose from our library."
              : `Enter a title for the new ${type}.`}
          </DialogDescription>
        </DialogHeader>

        {isQuestion ? (
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="library">From Library</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={libraryTitle || title}
                  onChange={(e) => {
                    if (libraryTitle) {
                      setLibraryTitle(e.target.value);
                    } else {
                      setTitle(e.target.value);
                    }
                  }}
                  placeholder="Enter concise question title..."
                  disabled={isProcessing}
                />
              </div>

              {libraryTitle && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="question-text">Question Text</Label>
                    <Textarea
                      id="question-text"
                      value={libraryQuestionText}
                      onChange={(e) => setLibraryQuestionText(e.target.value)}
                      placeholder="Enter the full question text..."
                      className="min-h-[100px]"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context">Context</Label>
                    <Textarea
                      id="context"
                      value={libraryContext}
                      onChange={(e) => setLibraryContext(e.target.value)}
                      placeholder="Provide additional context or instructions..."
                      className="min-h-[80px]"
                      disabled={isProcessing}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="library" className="space-y-4">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  {questionTemplates.map((libraryQuestion) => (
                    <Card
                      key={libraryQuestion.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">
                              {libraryQuestion.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {libraryQuestion.category}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {libraryQuestion.question_text}
                          </p>

                          {libraryQuestion.context && (
                            <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                              {libraryQuestion.context}
                            </p>
                          )}

                          <div className="flex justify-end pt-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUseLibraryQuestion(libraryQuestion)
                              }
                              disabled={isProcessing}
                            >
                              Use This Question
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${type} title...`}
              disabled={isProcessing}
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDialogClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!canSubmit}>
            {isProcessing ? "Adding..." : `Add ${capitalizedType}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
