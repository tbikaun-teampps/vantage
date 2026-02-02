import React from "react";
import { Badge } from "@/components/ui/badge";
import { QuickAddButton } from "../../quick-add-button";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import type {
  CreateableTreeNode,
  CreateableTreeNodeType,
  CompanyTreeNodeType,
  AnyTreeNode,
  AnyTreeNodeNoType,
} from "@/types/api/companies";

interface EntityBadgesProps {
  entities: AnyTreeNodeNoType[];
  icon: React.ComponentType<{ className?: string }>;
  parentItem: AnyTreeNode;
  parentType: CompanyTreeNodeType;
  addType: CreateableTreeNodeType;
  onAddSuccess?: () => void;
  onExpandParentNode?: (
    parentType: CompanyTreeNodeType,
    parentId: string | number
  ) => void;
}

export const EntityBadges: React.FC<EntityBadgesProps> = ({
  entities,
  icon: Icon,
  parentItem,
  parentType,
  addType,
  onAddSuccess,
  onExpandParentNode,
}) => {
  const userCanAdmin = useCanAdmin();
  return (
    <div className="flex flex-wrap gap-3" data-tour="entity-badges">
      {entities.map((entity) => (
        <Badge key={entity.id} variant="outline" className="px-4 py-2 text-sm">
          <Icon className="h-3 w-3 mr-2" />
          {entity.name}
          {"roles" in entity && entity.roles && (
            <span className="ml-2 text-xs opacity-60">
              ({entity.roles.length} roles)
            </span>
          )}
          {"level" in entity && entity.level && (
            <span className="ml-2 text-xs opacity-60 capitalize">
              ({entity.level})
            </span>
          )}
        </Badge>
      ))}
      {userCanAdmin && (
        <QuickAddButton
          parentItem={parentItem as CreateableTreeNode}
          parentType={parentType as CreateableTreeNodeType}
          addType={addType}
          onSuccess={() => {
            // Expand the parent node to show the newly added child
            onExpandParentNode?.(parentType, parentItem.id);
            onAddSuccess?.();
          }}
        />
      )}
    </div>
  );
};
