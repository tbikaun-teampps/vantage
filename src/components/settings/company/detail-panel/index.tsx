import React from "react";
import { EmptyState } from "./components/empty-state";
import {
  RHFCompanyForm,
  RHFBusinessUnitForm,
  RHFRegionForm,
  RHFSiteForm,
  RHFAssetGroupForm,
  RHFWorkGroupForm,
  RHFRoleForm,
} from "./components/rhf-forms";
import { useTreeNodeActions, useCompanyTree } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { toast } from "sonner";
import type { RoleFormData } from "./schemas";
import type { AnyTreeNode } from "@/types/api/companies";

interface DetailPanelProps {
  selectedItem: AnyTreeNode | null;
  setSelectedItem: (item: AnyTreeNode | null) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  selectedItem,
  setSelectedItem,
}) => {
  const companyId = useCompanyFromUrl();
  const { updateTreeNode } = useTreeNodeActions();
  const { data: companyTree } = useCompanyTree(companyId);

  if (!selectedItem) {
    return <EmptyState />;
  }

  // Helper to convert form data to FormData for store functions
  const convertToFormData = (data: any): FormData => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    return formData;
  };

  // Helper to find the parent work group for a role
  const findParentWorkGroup = (roleId: string) => {
    if (!companyTree) return null;

    // Traverse the tree to find the work group containing this role
    for (const businessUnit of companyTree.business_units || []) {
      for (const region of businessUnit.regions || []) {
        for (const site of region.sites || []) {
          for (const assetGroup of site.asset_groups || []) {
            for (const workGroup of assetGroup.work_groups || []) {
              if (
                workGroup.roles?.some((role) => role.id.toString() === roleId)
              ) {
                return workGroup;
              }
            }
          }
        }
      }
    }
    return null;
  };

  // Helper to check for duplicate roles in the same work group
  const checkForDuplicateRole = (
    data: RoleFormData,
    currentRoleId?: string
  ): string | null => {
    if (!data.shared_role_id) return null;

    const parentWorkGroup = findParentWorkGroup(
      String(currentRoleId || selectedItem.id)
    );
    if (!parentWorkGroup) return null;

    // Check if another role in the same work group has the same shared_role_id
    const duplicateRole = parentWorkGroup.roles?.find(
      (role) =>
        role.shared_role_id.toString() === data.shared_role_id &&
        role.id.toString() !== currentRoleId &&
        role.id.toString() !== selectedItem.id
    );

    if (duplicateRole) {
      return `This role already exists in the work group: "${duplicateRole.name}"`;
    }

    return null;
  };

  // Generic save handler
  const handleSave = async (data: any) => {
    try {
      const nodeId = selectedItem.id;

      if (!nodeId) {
        throw new Error("Item ID is required");
      }

      const formData = convertToFormData(data);
      await updateTreeNode({
        nodeType: selectedItem.type,
        nodeId: nodeId, // Pass the ID as-is (can be string UUID or number)
        formData,
        companyId: companyId!,
      });

      toast.success("Updated successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while saving"
      );
    }
  };

  // Specific role save handler with duplicate validation
  const handleRoleSave = async (data: RoleFormData) => {
    try {
      // Check for duplicate roles first
      const duplicateError = checkForDuplicateRole(data);
      if (duplicateError) {
        toast.error(duplicateError);
        return;
      }

      const nodeId = selectedItem.id;
      if (!nodeId) {
        throw new Error("Item ID is required");
      }

      const formData = convertToFormData(data);
      await updateTreeNode({
        nodeType: selectedItem.type,
        nodeId: nodeId, // Pass the ID as-is (can be string UUID or number)
        formData,
        companyId: companyId!,
      });

      toast.success("Role updated successfully!");
    } catch (error) {
      console.error("Role save error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while saving role"
      );
    }
  };

  const renderForm = () => {
    switch (selectedItem.type) {
      case "company":
        return (
          <RHFCompanyForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
          />
        );

      case "business_unit":
        return (
          <RHFBusinessUnitForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Business Unit deleted!")}
          />
        );

      case "region":
        return (
          <RHFRegionForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Region deleted!")}
          />
        );

      case "site":
        return (
          <RHFSiteForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Site deleted!")}
          />
        );

      case "asset_group":
        return (
          <RHFAssetGroupForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Asset Group deleted!")}
          />
        );

      case "work_group":
        return (
          <RHFWorkGroupForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Work Group deleted!")}
          />
        );

      case "role":
        return (
          <RHFRoleForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleRoleSave}
            onDelete={() => console.log("Role deleted!")}
          />
        );

      default:
        return <div>Select an item to view details</div>;
    }
  };

  return renderForm();
};
