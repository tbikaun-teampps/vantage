import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  IconDownload,
  IconMaximize,
  IconMinimize,
  IconUpload,
} from "@tabler/icons-react";
import { ImportCompanyDialog } from "./import-company-dialog";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import { exportCompanyStructure } from "@/lib/api/companies";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { toast } from "sonner";

interface HeaderActionsProps {
  toggleFullscreen: () => Promise<void>;
  isFullscreen: boolean;
}

export function HeaderActions({
  toggleFullscreen,
  isFullscreen,
}: HeaderActionsProps) {
  const companyId = useCompanyFromUrl();
  const userCanAdmin = useCanAdmin();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Handle export to JSON
  const handleExport = async () => {
    if (!companyId) return;

    try {
      const blob = await exportCompanyStructure(companyId);

      // Create and download file from blob
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filename = "company-structure.json";

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export company structure:", error);
      toast.error("Failed to export company structure");
    }
  };

  return (
    <>
      <div className="flex gap-2 items-center" data-tour="company-actions">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="gap-2 w-[130px]"
        >
          {isFullscreen ? (
            <>
              <IconMinimize className="h-4 w-4" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <IconMaximize className="h-4 w-4" />
              Fullscreen
            </>
          )}
        </Button>
        {userCanAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(true)}
            >
              <IconUpload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              data-tour="export-button"
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Export
            </Button>
          </>
        )}
      </div>

      <ImportCompanyDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </>
  );
}
