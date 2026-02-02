import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconFile,
  IconDownload,
  IconFileText,
} from "@tabler/icons-react";
import { getEvidenceByAssessmentId } from "@/lib/api/assessments";
import { SimpleDataTable } from "@/components/simple-data-table";
import { type ColumnDef } from "@tanstack/react-table";

interface AssessmentEvidenceProps {
  assessmentId: number;
}

interface AssessmentEvidenceItem {
  id: number;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  interview_id: number;
  interview_name: string;
  question_title: string;
  question_id: number;
  publicUrl: string;
}

export function AssessmentEvidence({ assessmentId }: AssessmentEvidenceProps) {
  const [evidence, setEvidence] = useState<AssessmentEvidenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvidence = async () => {
      if (!assessmentId) {
        setEvidence([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const evidenceData = await getEvidenceByAssessmentId(assessmentId);
        setEvidence(evidenceData);
      } catch (error) {
        console.error("Failed to load assessment evidence:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load evidence"
        );
        setEvidence([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvidence();
  }, [assessmentId]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDownload = (publicUrl: string, fileName: string) => {
    // Create a temporary link element and trigger download
    const link = document.createElement("a");
    link.href = publicUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Column definitions
  const columns: ColumnDef<AssessmentEvidenceItem>[] = [
    {
      accessorKey: "file_name",
      header: "File Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <IconFile className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div
            className="font-medium text-sm truncate"
            title={row.original.file_name}
          >
            {row.original.file_name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "file_size",
      header: () => <div className="text-center">File Size</div>,
      cell: ({ row }) => (
        <div className="text-sm text-center">
          {formatFileSize(row.original.file_size)}
        </div>
      ),
    },
    {
      accessorKey: "interview_name",
      header: "Interview",
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.interview_name}</div>
      ),
    },
    {
      accessorKey: "question_title",
      header: "Question",
      cell: ({ row }) => (
        <div
          className="text-sm max-w-md truncate"
          title={row.original.question_title}
        >
          {row.original.question_title}
        </div>
      ),
    },
    {
      accessorKey: "uploaded_at",
      header: () => <div className="text-center">Uploaded</div>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground text-center">
          {formatDate(row.original.uploaded_at)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleDownload(row.original.publicUrl, row.original.file_name)
            }
          >
            <IconDownload className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            Evidence Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading evidence files...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            Evidence Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-destructive text-sm">
              Error loading evidence: {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconFileText className="h-5 w-5" />
          Evidence Files
          {evidence.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({evidence.length} {evidence.length === 1 ? "file" : "files"})
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Evidence files uploaded during interviews in this assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleDataTable
          data={evidence}
          columns={columns}
          getRowId={(row) => row.id.toString()}
          enableSorting={true}
          enableFilters={true}
          enableColumnVisibility={true}
          filterPlaceholder="Search evidence files..."
          defaultPageSize={10}
          pageSizeOptions={[10, 20, 30]}
          tabs={[
            {
              value: "all",
              label: "All Files",
              data: evidence,
              emptyStateTitle: "No Evidence Files",
              emptyStateDescription:
                "No evidence files have been uploaded for this assessment yet.",
            },
          ]}
          defaultTab="all"
        />
      </CardContent>
    </Card>
  );
}
