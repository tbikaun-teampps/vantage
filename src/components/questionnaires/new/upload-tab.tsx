import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconUpload,
  IconFile,
  IconDownload,
  IconRefresh,
  IconCheck,
  IconAlertTriangle,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { importQuestionnaire } from "@/lib/api/questionnaires";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function NewQuestionnaireUploadTab() {
  const companyId = useCompanyFromUrl();
  const navigate = useCompanyAwareNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [guidelines, setGuidelines] = useState("");

  const resetDialog = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setImportSuccess(false);
    setValidationErrors([]);
    setName("");
    setDescription("");
    setGuidelines("");
  };

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Check if file is CSV (by extension or MIME type)
        const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
        if (!isCSV) {
          toast.error("Please select a valid CSV file");
          return;
        }

        setSelectedFile(file);
        setValidationErrors([]);
        setImportSuccess(false);
      }
    },
    []
  );

  const handleFileDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];

      if (file) {
        // Check if file is CSV (by extension or MIME type)
        const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
        if (!isCSV) {
          toast.error("Please select a valid CSV file");
          return;
        }

        setSelectedFile(file);
        setValidationErrors([]);
        setImportSuccess(false);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    setValidationErrors([]);

    try {
      const response = await importQuestionnaire({
        file: selectedFile,
        companyId,
        name: name || selectedFile.name.replace(/\.(json|csv)$/, ""),
        description: description || undefined,
        guidelines: guidelines || undefined,
      });

      setImportSuccess(true);
      toast.success("Questionnaire imported successfully!");

      // Invalidate questionnaires cache so the list refreshes
      await queryClient.invalidateQueries({
        queryKey: ["questionnaires"],
      });

      // Navigate to the new questionnaire after a brief delay
      setTimeout(() => {
        navigate(`/questionnaires/${response.id}`);
      }, 1000);
    } catch {
      setValidationErrors(["An unexpected error occurred during import"]);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSample = (fileType: "json" | "csv") => {
    let blob;
    let sample;

    switch (fileType) {
      case "csv":
        sample = `section_title,section_order,step_title,step_order,question_title,question_text,question_context,question_order,rating_desc_1,rating_value_1,rating_desc_2,rating_value_2,rating_desc_3,rating_value_3,rating_desc_4,rating_value_4,rating_desc_5,rating_value_5,rating_desc_6,rating_value_6,rating_desc_7,rating_value_7,rating_desc_8,rating_value_8,rating_desc_9,rating_value_9,rating_desc_10,rating_value_10
Leadership and Management,1,Strategic Planning,1,Vision and Mission,How effectively does the organization communicate its vision and mission?,Evaluate the clarity and communication of organizational direction,1,"Outstanding performance, exceeds expectations",5,"Good performance, meets expectations",4,"Adequate performance, meets basic requirements",3,"Below average performance, needs improvement",2,"Unacceptable performance, immediate action required",1,,,,,,,,,,,,,
Leadership and Management,1,Strategic Planning,1,Goal Setting,How well does the organization set and track strategic goals?,Assess the goal-setting process and monitoring mechanisms,2,...,5,...,4,...,3,...,2,...,1,,,,,,,,,,,,,
Operations and Processes,2,Process Management,1,Standard Operating Procedures,How well are standard operating procedures documented and followed?,Evaluate the documentation and adherence to SOPs,1,...,5,...,4,...,3,...,2,...,1,,,,,,,,,,,,,`;
        blob = new Blob([sample], {
          type: "text/csv",
        });
        break;

      case "json":
        sample = {
          rating_scales: [
            {
              name: "Excellent",
              description: "Outstanding performance, exceeds expectations",
              value: 5,
            },
            {
              name: "Good",
              description: "Good performance, meets expectations",
              value: 4,
            },
            {
              name: "Average",
              description: "Adequate performance, meets basic requirements",
              value: 3,
            },
            {
              name: "Poor",
              description: "Below average performance, needs improvement",
              value: 2,
            },
            {
              name: "Unacceptable",
              description:
                "Unacceptable performance, immediate action required",
              value: 1,
            },
          ],
          sections: [
            {
              title: "Leadership and Management",
              order: 1,
              steps: [
                {
                  title: "Strategic Planning",
                  order: 1,
                  questions: [
                    {
                      title: "Vision and Mission",
                      question_text:
                        "How effectively does the organization communicate its vision and mission?",
                      context:
                        "Evaluate the clarity and communication of organizational direction",
                      order: 1,
                    },
                    {
                      title: "Goal Setting",
                      question_text:
                        "How well does the organization set and track strategic goals?",
                      context:
                        "Assess the goal-setting process and monitoring mechanisms",
                      order: 2,
                    },
                  ],
                },
              ],
            },
            {
              title: "Operations and Processes",
              order: 2,
              steps: [
                {
                  title: "Process Management",
                  order: 1,
                  questions: [
                    {
                      title: "Standard Operating Procedures",
                      question_text:
                        "How well are standard operating procedures documented and followed?",
                      context:
                        "Evaluate the documentation and adherence to SOPs",
                      order: 1,
                    },
                  ],
                },
              ],
            },
          ],
        };
        blob = new Blob([JSON.stringify(sample, null, 2)], {
          type: "application/json",
        });
        break;

      default:
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questionnaire-sample.${fileType}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUpload className="h-5 w-5" />
          Upload Questionnaire
        </CardTitle>
        <CardDescription>
          Import a questionnaire from a CSV file. Note: applicable roles must be
          assigned to the questionnaire after import.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Questionnaire Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="questionnaire-name">
                Name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="questionnaire-name"
                placeholder="Leave empty to use filename"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionnaire-description">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="questionnaire-description"
                placeholder="Brief description of this questionnaire"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isProcessing}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionnaire-guidelines">
                Guidelines{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="questionnaire-guidelines"
                placeholder="Instructions or guidelines for completing this questionnaire"
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                disabled={isProcessing}
                rows={3}
              />
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              "hover:border-primary/50 hover:bg-accent/5",
              selectedFile
                ? "border-primary bg-accent/10"
                : "border-muted-foreground/25",
              isProcessing && "opacity-50 pointer-events-none"
            )}
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              type="file"
              accept=".csv" // .json,
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={isProcessing}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                {selectedFile ? (
                  <>
                    <IconFile className="h-12 w-12 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <IconUpload className="h-12 w-12 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        .csv file only (max 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>
          {/* Download Sample Buttons */}
          <div className="flex justify-left gap-4">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => downloadSample("json")}
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Download Example (JSON)
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadSample("csv")}
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Download Example (.csv)
            </Button>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <IconAlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Validation errors found:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {importSuccess && (
            <Alert className="border-green-500 bg-green-50">
              <IconCheck className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Questionnaire imported successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {selectedFile && !importSuccess && (
              <>
                <Button
                  variant="outline"
                  onClick={resetDialog}
                  disabled={isProcessing}
                >
                  <IconRefresh className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={handleUpload} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <IconUpload className="h-4 w-4 mr-2" />
                      Import Questionnaire
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
