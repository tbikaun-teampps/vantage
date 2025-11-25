import type { UniqueIdentifier } from '@dnd-kit/core';
import type {
  CompanyTree,
  BusinessUnitNode,
  RegionNode,
  SiteNode,
  AssetGroupNode,
  WorkGroupNode,
  RoleNode,
  ReportingRoleNode,
  AnyTreeNode,
} from '@/types/api/companies';
import type { TreeItem, TreeItems } from './types';

// Extended TreeItem that includes the original entity data
export interface CompanyTreeItem extends TreeItem {
  entity: AnyTreeNode;
  name: string;
  entityType: 'company' | 'business_unit' | 'region' | 'site' | 'asset_group' | 'work_group' | 'role';
}

/**
 * Generates a unique ID for dnd-kit from entity type and ID
 */
export function generateTreeItemId(
  entityType: 'company' | 'business_unit' | 'region' | 'site' | 'asset_group' | 'work_group' | 'role',
  entityId: string | number
): UniqueIdentifier {
  return `${entityType}_${entityId}`;
}

/**
 * Parses a tree item ID back into entity type and ID
 */
export function parseTreeItemId(id: UniqueIdentifier): {
  entityType: 'company' | 'business_unit' | 'region' | 'site' | 'asset_group' | 'work_group' | 'role';
  entityId: string | number;
} {
  const idStr = String(id);

  // Match against known entity types (which may contain underscores)
  // Order matters: check longer names first
  const entityTypes = ['business_unit', 'asset_group', 'work_group', 'company', 'region', 'site', 'role'] as const;

  for (const type of entityTypes) {
    if (idStr.startsWith(type + '_')) {
      const entityId = idStr.slice(type.length + 1); // +1 for the underscore
      return {
        entityType: type,
        entityId: type === 'company' ? entityId : Number(entityId),
      };
    }
  }

  // Fallback (shouldn't happen with valid IDs)
  throw new Error(`Invalid tree item ID format: ${idStr}`);
}

/**
 * Transforms API Reporting Roles into TreeItems
 * Note: Reporting roles are just roles with a reports_to_role_id, so we use 'role' as the entityType.
 * The system only allows one level of nesting (role > reporting_role), not deeper.
 */
function transformReportingRoles(reportingRoles: ReportingRoleNode[], parentRoleId: number): CompanyTreeItem[] {
  return reportingRoles.map((rr) => ({
    id: generateTreeItemId('role', rr.id),
    // Reporting roles are roles in the database - they have reports_to_role_id pointing to their parent
    entity: { ...rr, type: 'role' as const, reporting_roles: [], reports_to_role_id: parentRoleId } as AnyTreeNode,
    name: rr.name,
    entityType: 'role' as const,
    children: [], // Reporting roles are leaf nodes (only one level of nesting allowed)
    collapsed: false,
  }));
}

/**
 * Transforms API Roles into TreeItems
 */
function transformRoles(roles: RoleNode[]): CompanyTreeItem[] {
  return roles.map((role) => ({
    id: generateTreeItemId('role', role.id),
    entity: { ...role, type: 'role' as const },
    name: role.name,
    entityType: 'role' as const,
    children: role.reporting_roles ? transformReportingRoles(role.reporting_roles, role.id) : [],
    collapsed: false,
  }));
}

/**
 * Transforms API Work Groups into TreeItems
 */
function transformWorkGroups(workGroups: WorkGroupNode[]): CompanyTreeItem[] {
  return workGroups.map((wg) => ({
    id: generateTreeItemId('work_group', wg.id),
    entity: { ...wg, type: 'work_group' as const },
    name: wg.name,
    entityType: 'work_group' as const,
    children: wg.roles ? transformRoles(wg.roles) : [],
    collapsed: false,
  }));
}

/**
 * Transforms API Asset Groups into TreeItems
 */
function transformAssetGroups(assetGroups: AssetGroupNode[]): CompanyTreeItem[] {
  return assetGroups.map((ag) => ({
    id: generateTreeItemId('asset_group', ag.id),
    entity: { ...ag, type: 'asset_group' as const },
    name: ag.name,
    entityType: 'asset_group' as const,
    children: transformWorkGroups(ag.work_groups),
    collapsed: false,
  }));
}

/**
 * Transforms API Sites into TreeItems
 */
function transformSites(sites: SiteNode[]): CompanyTreeItem[] {
  return sites.map((site) => ({
    id: generateTreeItemId('site', site.id),
    entity: { ...site, type: 'site' as const },
    name: site.name,
    entityType: 'site' as const,
    children: transformAssetGroups(site.asset_groups),
    collapsed: false,
  }));
}

/**
 * Transforms API Regions into TreeItems
 */
function transformRegions(regions: RegionNode[]): CompanyTreeItem[] {
  return regions.map((region) => ({
    id: generateTreeItemId('region', region.id),
    entity: { ...region, type: 'region' as const },
    name: region.name,
    entityType: 'region' as const,
    children: transformSites(region.sites),
    collapsed: false,
  }));
}

/**
 * Transforms API Business Units into TreeItems
 */
function transformBusinessUnits(businessUnits: BusinessUnitNode[]): CompanyTreeItem[] {
  return businessUnits.map((bu) => ({
    id: generateTreeItemId('business_unit', bu.id),
    entity: { ...bu, type: 'business_unit' as const },
    name: bu.name,
    entityType: 'business_unit' as const,
    children: transformRegions(bu.regions),
    collapsed: false,
  }));
}

/**
 * Main transformer: Converts CompanyTree API response to TreeItems format
 * For dnd-kit sortable tree implementation
 */
export function companyTreeToTreeItems(companyTree: CompanyTree): TreeItems {
  // Company is the root node with Business Units as children
  const companyItem: CompanyTreeItem = {
    id: generateTreeItemId('company', companyTree.id),
    entity: { ...companyTree, type: 'company' as const },
    name: companyTree.name,
    entityType: 'company' as const,
    children: transformBusinessUnits(companyTree.business_units),
    collapsed: false,
  };

  // Return array with single company root
  return [companyItem];
}

/**
 * Updates the tree structure after a drag operation
 * Preserves entity data while allowing structural changes
 */
export function updateTreeItemChildren(
  item: CompanyTreeItem,
  newChildren: CompanyTreeItem[]
): CompanyTreeItem {
  return {
    ...item,
    children: newChildren,
  };
}
