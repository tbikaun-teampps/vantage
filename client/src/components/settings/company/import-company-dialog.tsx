import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  IconUpload,
  IconFile,
  IconAlertCircle,
  IconDownload,
} from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { importCompanyStructure } from "@/lib/api/companies";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

interface ImportCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCompanyDialog({
  open,
  onOpenChange,
}: ImportCompanyDialogProps) {
  const companyId = useCompanyFromUrl();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate it's a CSV file
    const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
    if (!isCSV) {
      setError("Please select a valid CSV file");
      toast.error("Please select a valid CSV file");
      return;
    }

    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setError("");

    try {
      await importCompanyStructure(companyId, {
        file: selectedFile,
      });

      toast.success("Company structure imported successfully!");

      // Invalidate companies cache so the list refreshes
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });

      // Close dialog on success
      onOpenChange(false);

      // Reset state
      setSelectedFile(null);
    } catch {
      const errorMessage = "Failed to import company structure";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedFile(null);
      setError("");
    }
    onOpenChange(open);
  };

  const downloadSampleCSV = () => {
    const headers = [
      "business_unit_name",
      "business_unit_code",
      "business_unit_desc",
      "business_unit_contact_name",
      "business_unit_contact_email",
      "region_name",
      "region_code",
      "region_desc",
      "region_contact_name",
      "region_contact_email",
      "site_name",
      "site_code",
      "site_desc",
      "site_lat",
      "site_lng",
      "site_contact_name",
      "site_contact_email",
      "asset_group_name",
      "asset_group_code",
      "asset_group_desc",
      "asset_group_contact_name",
      "asset_group_contact_email",
      "work_group_name",
      "work_group_code",
      "work_group_desc",
      "work_group_contact_name",
      "work_group_contact_email",
      "role_name",
      "role_level",
      "role_contact_name_1",
      "role_contact_email_1",
      "role_contact_name_2",
      "role_contact_email_2",
      "role_contact_name_3",
      "role_contact_email_3",
      "role_contact_name_4",
      "role_contact_email_4",
      "role_contact_name_5",
      "role_contact_email_5",
    ];

    const sampleRow = [
      "Iron Ore Operations",
      "IRON",
      "Iron ore mining and processing division",
      "",
      "",
      "Pilbara Region",
      "PILB",
      "Core iron ore production hub in Western Australia",
      "",
      "",
      "Newman Mine",
      "NEW",
      "Flagship open-pit iron ore mine",
      "-23.3594",
      "119.7332",
      "",
      "",
      "Heavy Equipment Fleet",
      "HEF-1",
      "Fleet of ultra-class haul trucks and excavators",
      "",
      "",
      "Planning",
      "PLN-01",
      "Planning and scheduling of maintenance activities",
      "",
      "",
      "Planning and Reliability Superintendent",
      "management",
      "David Anderson",
      "david.anderson@example.com",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "company-structure-sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import company structure</DialogTitle>
          <DialogDescription>
            Upload a CSV file to populate the structure for this company.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <IconUpload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                CSV file only (max 10MB)
              </p>
            </div>
          </div>

          {/* Download Sample Button */}
          <div className="flex justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleCSV}
              type="button"
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Download Example (.csv)
            </Button>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <IconFile className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleDialogClose(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
