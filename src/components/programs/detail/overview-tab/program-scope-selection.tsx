import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconBuilding,
  IconMapPin,
  IconUsers,
  IconSettings,
  IconSearch,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  useScopeOptions,
  useProgramScopes,
  useUpdateProgramScopes,
} from "@/hooks/useProgramScope";
import { programScopeService } from "@/lib/supabase/program-scope-service";
import type { Database } from "@/types/database";
import type { ProgramWithRelations } from "@/types/program";

type ScopeLevel = Database["public"]["Enums"]["scope_levels"];

interface ProgramScopeSelectionProps {
  program: ProgramWithRelations;
  readOnly?: boolean;
}

const scopeLevelConfig = {
  company: {
    label: "Company-wide",
    icon: IconBuilding,
    description: "This program applies to the entire company",
  },
  business_unit: {
    label: "Business Units",
    icon: IconBuilding,
    description: "Select which business units this program applies to",
  },
  region: {
    label: "Regions",
    icon: IconMapPin,
    description: "Select which regions this program applies to",
  },
  site: {
    label: "Sites",
    icon: IconMapPin,
    description: "Select which sites this program applies to",
  },
  asset_group: {
    label: "Asset Groups",
    icon: IconSettings,
    description: "Select which asset groups this program applies to",
  },
  role: {
    label: "Roles",
    icon: IconUsers,
    description: "Select which roles this program applies to",
  },
};

export function ProgramScopeSelection({ program, readOnly = false }: ProgramScopeSelectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const scopeLevel = program.scope_level as ScopeLevel;
  const config = scopeLevelConfig[scopeLevel];
  const Icon = config.icon;

  // Fetch scope options and current scopes
  const { data: scopeOptions = [], isLoading: isLoadingOptions } =
    useScopeOptions(scopeLevel, program.company_id);

  const { data: currentScopes = [], isLoading: isLoadingScopes } =
    useProgramScopes(program.id);

  const updateScopesMutation = useUpdateProgramScopes();

  // Initialize selected IDs when data loads - only run once when scopes are loaded
  useEffect(() => {
    if (!isLoadingScopes && !isEditing) {
      const ids =
        currentScopes.length > 0
          ? programScopeService.getSelectedScopeIds(currentScopes, scopeLevel)
          : [];
      setSelectedIds(ids);
    }
  }, [isLoadingScopes, scopeLevel]); // Removed currentScopes from dependencies to prevent loop

  // Filter options based on search term
  const filteredOptions = scopeOptions.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.code &&
        option.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = async () => {
    try {
      await updateScopesMutation.mutateAsync({
        programId: program.id,
        scopeLevel,
        selectedIds,
      });
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    // Reset to current scopes
    const ids =
      currentScopes.length > 0
        ? programScopeService.getSelectedScopeIds(currentScopes, scopeLevel)
        : [];
    setSelectedIds(ids);
    setIsEditing(false);
    setSearchTerm("");
  };

  const handleToggleOption = (optionId: number) => {
    setSelectedIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredOptions.map((option) => option.id));
  };

  const handleSelectNone = () => {
    setSelectedIds([]);
  };

  const selectedOptions = scopeOptions.filter((option) =>
    selectedIds.includes(option.id)
  );

  // For company level, show different UI since there's only one option
  if (scopeLevel === "company") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle>Program Scope</CardTitle>
          </div>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <IconBuilding className="h-3 w-3 mr-1" />
              Company-wide
            </Badge>
            <span className="text-sm text-muted-foreground">
              This program applies to your entire organization
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingOptions || isLoadingScopes) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <div>
              <CardTitle>Program Scope</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          {!isEditing && !readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Edit Scope
            </Button>
          )}
          {readOnly && (
            <Badge variant="outline" className="text-muted-foreground">
              Read-only
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          // Display mode
          <div className="space-y-3">
            {selectedOptions.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                {readOnly 
                  ? `No ${config.label.toLowerCase()} selected for this program.`
                  : `No ${config.label.toLowerCase()} selected. Please select ${config.label.toLowerCase()} for this program.`
                }
              </div>
            ) : (
              <>
                <div className="text-sm font-medium">
                  Selected {config.label} ({selectedOptions.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedOptions.map((option) => (
                    <Badge key={option.id} variant="secondary">
                      {option.name}
                      {option.code && (
                        <span className="ml-1 text-xs opacity-70">
                          ({option.code})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // Edit mode
          <div className="space-y-4">
            {/* Search and bulk actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${config.label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredOptions.length === 0}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectNone}
                disabled={selectedIds.length === 0}
              >
                Select None
              </Button>
            </div>

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchTerm
                    ? `No ${config.label.toLowerCase()} match your search`
                    : `No ${config.label.toLowerCase()} available`}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredOptions.map((option) => (
                    <div key={option.id} className="p-3 hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`option-${option.id}`}
                          checked={selectedIds.includes(option.id)}
                          onCheckedChange={() => handleToggleOption(option.id)}
                        />
                        <Label
                          htmlFor={`option-${option.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{option.name}</div>
                          {(option.code || option.description) && (
                            <div className="text-xs text-muted-foreground">
                              {option.code && <span>Code: {option.code}</span>}
                              {option.code && option.description && (
                                <span> • </span>
                              )}
                              {option.description && (
                                <span>{option.description}</span>
                              )}
                            </div>
                          )}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={updateScopesMutation.isPending}
                size="sm"
              >
                <IconCheck className="h-4 w-4 mr-2" />
                {updateScopesMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateScopesMutation.isPending}
                size="sm"
              >
                <IconX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
