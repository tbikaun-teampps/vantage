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
  IconPhoto,
  IconAlertCircle,
  IconBuilding,
  IconTrash,
  IconPalette,
} from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { uploadCompanyIcon, removeCompanyIcon, updateCompanyBranding } from "@/lib/api/companies";
import { useQueryClient } from "@tanstack/react-query";
import type { Company } from "@/types/api/companies";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManageCompanyBrandingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

export function ManageCompanyBrandingDialog({
  open,
  onOpenChange,
  company,
}: ManageCompanyBrandingDialogProps) {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Branding color states
  const branding = (company as Company & { branding?: { primary: string | null; secondary: string | null; accent: string | null } | null }).branding;
  const originalPrimaryColor = branding?.primary || "#000000";
  const originalSecondaryColor = branding?.secondary || "#666666";
  const originalAccentColor = branding?.accent || "#3b82f6";

  const [primaryColor, setPrimaryColor] = useState<string>(originalPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState<string>(originalSecondaryColor);
  const [accentColor, setAccentColor] = useState<string>(originalAccentColor);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    const isValidType = allowedTypes.includes(file.type);
    if (!isValidType) {
      setError("Please select a valid image file (JPG, PNG, or SVG)");
      toast.error("Please select a valid image file (JPG, PNG, or SVG)");
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 2MB");
      toast.error("File size must be less than 2MB");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError("");

    try {
      await uploadCompanyIcon(company.id, selectedFile);

      toast.success("Company icon uploaded successfully!");

      // Invalidate companies cache so the list refreshes
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });

      // Close dialog on success
      onOpenChange(false);

      // Reset state
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload company icon";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!company.icon_url) return;

    setIsRemoving(true);
    setError("");

    try {
      await removeCompanyIcon(company.id);

      toast.success("Company icon removed successfully!");

      // Invalidate companies cache so the list refreshes
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });

      // Close dialog on success
      onOpenChange(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove company icon";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRemoving(false);
    }
  };

  const isValidHexColor = (color: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  };

  const hasColorChanges = (): boolean => {
    return (
      primaryColor !== originalPrimaryColor ||
      secondaryColor !== originalSecondaryColor ||
      accentColor !== originalAccentColor
    );
  };

  const handleResetColors = () => {
    setPrimaryColor(originalPrimaryColor);
    setSecondaryColor(originalSecondaryColor);
    setAccentColor(originalAccentColor);
  };

  const handleSaveBranding = async () => {
    setIsSavingBranding(true);
    setError("");

    // Validate colors
    if (!isValidHexColor(primaryColor) || !isValidHexColor(secondaryColor) || !isValidHexColor(accentColor)) {
      setError("All colors must be valid hex codes (e.g., #FF5733)");
      setIsSavingBranding(false);
      return;
    }

    try {
      await updateCompanyBranding(company.id, {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      });

      toast.success("Company branding updated successfully!");

      // Invalidate companies cache so the list refreshes
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });

      // Close dialog on success
      onOpenChange(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update company branding";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedFile(null);
      setError("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Company Branding</DialogTitle>
          <DialogDescription>
            Customise how {company.name} appears throughout the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Company Icon Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Company Icon</h3>
            </div>

            {/* Current Icon Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Current Icon
              </label>
              <div className="border rounded-lg p-4 flex items-center justify-center bg-muted/30">
                {company.icon_url ? (
                  <img
                    src={company.icon_url}
                    alt={`${company.name} icon`}
                    className="h-20 w-20 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <IconBuilding className="h-12 w-12" />
                    <p className="text-xs">No icon set</p>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {company.icon_url ? "Replace Icon" : "Upload Icon"}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <IconUpload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Click to upload an image
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or SVG (max 2MB)
                </p>
              </div>
            </div>

            {/* Selected File Preview */}
            {selectedFile && previewUrl && (
              <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
                <div className="flex items-center gap-2">
                  <IconPhoto className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">New Icon Preview</span>
                </div>
                <div className="flex items-center justify-center bg-muted/30 rounded p-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)}{" "}
                    KB)
                  </p>
                </div>
              </div>
            )}

            {/* Icon Action Buttons */}
            <div className="flex justify-between gap-2">
              {/* Remove button on left */}
              {company.icon_url && (
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isUploading || isRemoving || isSavingBranding}
                  size="sm"
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  {isRemoving ? "Removing..." : "Remove Icon"}
                </Button>
              )}

              {/* Upload button on right */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading || isRemoving || isSavingBranding}
                size="sm"
                className="ml-auto"
              >
                {isUploading ? "Uploading..." : "Upload Icon"}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Theme Colors Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconPalette className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Brand Colors</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Customise your company's theme colors to personalise the platform experience
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* Primary Color */}
              <div className="relative">
                <div className="border rounded-lg p-3 bg-muted/10 space-y-2">
                  <Label htmlFor="primary-color" className="text-xs text-center block font-medium">
                    Primary
                  </Label>
                  <div
                    className="w-full h-16 rounded border"
                    style={{ backgroundColor: isValidHexColor(primaryColor) ? primaryColor : originalPrimaryColor }}
                  />
                  <Input
                    id="primary-color"
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPrimaryColor(value);
                    }}
                    placeholder="#000000"
                    className={`w-full h-9 text-xs font-mono text-center ${
                      !isValidHexColor(primaryColor) ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                  />
                  <p className="text-[10px] text-center text-muted-foreground">
                    Main brand color
                  </p>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="relative">
                <div className="border rounded-lg p-3 bg-muted/10 space-y-2">
                  <Label htmlFor="secondary-color" className="text-xs text-center block font-medium">
                    Secondary
                  </Label>
                  <div
                    className="w-full h-16 rounded border"
                    style={{ backgroundColor: isValidHexColor(secondaryColor) ? secondaryColor : originalSecondaryColor }}
                  />
                  <Input
                    id="secondary-color"
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSecondaryColor(value);
                    }}
                    placeholder="#666666"
                    className={`w-full h-9 text-xs font-mono text-center ${
                      !isValidHexColor(secondaryColor) ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                  />
                  <p className="text-[10px] text-center text-muted-foreground">
                    Supporting color
                  </p>
                </div>
              </div>

              {/* Accent Color */}
              <div className="relative">
                <div className="border rounded-lg p-3 bg-muted/10 space-y-2">
                  <Label htmlFor="accent-color" className="text-xs text-center block font-medium">
                    Accent
                  </Label>
                  <div
                    className="w-full h-16 rounded border"
                    style={{ backgroundColor: isValidHexColor(accentColor) ? accentColor : originalAccentColor }}
                  />
                  <Input
                    id="accent-color"
                    type="text"
                    value={accentColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAccentColor(value);
                    }}
                    placeholder="#3b82f6"
                    className={`w-full h-9 text-xs font-mono text-center ${
                      !isValidHexColor(accentColor) ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                  />
                  <p className="text-[10px] text-center text-muted-foreground">
                    Highlight color
                  </p>
                </div>
              </div>
            </div>

            {/* Branding Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleResetColors}
                disabled={!hasColorChanges() || isSavingBranding || isUploading || isRemoving}
                size="sm"
              >
                Reset
              </Button>
              <Button
                onClick={handleSaveBranding}
                disabled={isSavingBranding || isUploading || isRemoving}
                size="sm"
              >
                {isSavingBranding ? "Saving..." : "Save Colors"}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            onClick={() => handleDialogClose(false)}
            disabled={isUploading || isRemoving || isSavingBranding}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
