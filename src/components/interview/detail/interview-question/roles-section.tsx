import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  IconAlertCircle,
  IconCircle,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

interface InterviewRolesSectionProps {
  form: any;
  isMobile: boolean;
  options: any[];
}

export function InterviewRolesSection({
  form,
  isMobile,
  options,
}: InterviewRolesSectionProps) {
  const optionsFlat = Object.values(options).flat();

  return (
    <div className="space-y-4" data-tour="interview-role-selection">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label className="text-md font-semibold">Applicable Roles</Label>
            <span className="text-red-500">*</span>
            {form.watch("role_ids")?.length > 0 && (
              <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
            )}
          </div>
          {optionsFlat.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const allRoleIds = optionsFlat.map((role) => role.id);
                const currentRoles = form.getValues("role_ids") || [];
                const allSelected = allRoleIds.every((id) =>
                  currentRoles.includes(id)
                );

                if (allSelected) {
                  // Deselect all roles
                  const newRoles = currentRoles.filter(
                    (id: number) => !allRoleIds.includes(id)
                  );
                  form.setValue("role_ids", newRoles, {
                    shouldDirty: true,
                  });
                } else {
                  // Select all roles
                  const newRoles = [
                    ...new Set([...currentRoles, ...allRoleIds]),
                  ];
                  form.setValue("role_ids", newRoles, {
                    shouldDirty: true,
                  });
                }
              }}
            >
              {(() => {
                const allRoleIds = optionsFlat.map((role) => role.id);
                const currentRoles = form.watch("role_ids") || [];
                const allSelected = allRoleIds.every((id) =>
                  currentRoles.includes(id)
                );
                return allSelected ? "Deselect All" : "Select All";
              })()}
            </Button>
          )}
        </div>
        {/* Fixed height container to prevent layout shift */}
        <div className="h-2 flex items-center">
          {optionsFlat.length > 0 &&
            (!form.watch("role_ids") ||
              form.watch("role_ids").length === 0) && (
              <span className="text-xs text-red-500">
                Select applicable roles
              </span>
            )}
        </div>
      </div>

      {optionsFlat.length === 0 ? (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>No Applicable Roles</AlertTitle>
          <AlertDescription>
            No roles are available for this question. This may be because:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>The question has no configured roles</li>
              <li>There are no roles defined for this assessment site</li>
              <li>
                The interview is scoped to specific roles that don't match this
                question
              </li>
              <li>
                The intersection of question roles, interview scope, and site
                roles is empty
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <FormField
          control={form.control}
          name="role_ids"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="space-y-4">
                  {Object.entries(options).map(
                    ([hierarchyPath, applicableRoles]) => (
                      <div key={hierarchyPath} className="space-y-4 w-full">
                        <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                          {hierarchyPath}
                        </h3>
                        <div
                          className={`grid gap-3 ${
                            isMobile
                              ? "grid-cols-1 md:grid-cols-2"
                              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                          }`}
                        >
                          {applicableRoles.map((role) => {
                            const isSelected =
                              field.value?.includes(role.id) || false;
                            return (
                              <Button
                                key={role.id}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                onClick={() => {
                                  const currentRoles = field.value || [];
                                  const newRoles = isSelected
                                    ? currentRoles.filter(
                                        (id: number) => id !== role.id
                                      )
                                    : [...currentRoles, role.id];
                                  field.onChange(newRoles);
                                }}
                                className={cn(
                                  "h-full justify-start text-left transition-all duration-200",
                                  isMobile ? "p-3 min-h-[44px]" : "p-4",
                                  isSelected &&
                                    "bg-primary text-primary-foreground"
                                )}
                              >
                                <div
                                  className={`flex items-start ${
                                    isMobile ? "space-x-2" : "space-x-3"
                                  } w-full`}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    {isSelected ? (
                                      <IconCircleCheckFilled className="h-5 w-5" />
                                    ) : (
                                      <IconCircle className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`font-semibold ${
                                        isMobile ? "text-xs" : "text-sm"
                                      } mb-1`}
                                    >
                                      {role.name}
                                    </div>
                                    <div
                                      className={`text-xs opacity-90 text-wrap`}
                                    >
                                      {role.description}
                                    </div>
                                  </div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
