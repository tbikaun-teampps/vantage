import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IconPlus, IconX } from "@tabler/icons-react";

interface RolesFormProps {
  applicableTo: string[];
  removeTag: (tag: string) => void;
  addTag: (tag: string) => void;
  roles: string[];
  addRole: (role: string) => void;
  removeRole: (role: string) => void;
}

export default function RolesForm({
  applicableTo,
  removeTag,
  addTag,
  roles,
}: RolesFormProps) {
  const handleAddRoleFromList = (role: string) => {
    addTag(role);
  };

  const availableRoles = roles.filter((role) => !applicableTo.includes(role));

  return (
    <div className="space-y-6 p-6">
      {/* Selected Roles Section */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Selected Roles</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Roles that this questionnaire applies to
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {applicableTo.map((tag) => (
              <Badge key={tag} variant="outline" className="px-4 py-2 text-sm">
                {tag}
                <IconX
                  className="h-3 w-3 ml-2 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
            {applicableTo.length === 0 && (
              <p className="text-sm text-muted-foreground">No roles selected</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Available Roles Section */}
      <div>
        <h3 className="text-md font-medium mb-1">Available Roles</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click to add roles to the questionnaire
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {availableRoles.map((role) => (
              <Badge
                key={role}
                variant="secondary"
                className="px-3 py-1 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleAddRoleFromList(role)}
              >
                <IconPlus className="h-3 w-3 mr-1" />
                {role}
              </Badge>
            ))}
            {availableRoles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                All roles are selected
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
