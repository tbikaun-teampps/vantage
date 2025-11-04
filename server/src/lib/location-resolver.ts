import type { SupabaseClient } from '@supabase/supabase-js';

export type LocationNodeType =
  | 'business_unit'
  | 'region'
  | 'site'
  | 'asset_group'
  | 'work_group'
  | 'role';

export interface LocationObject {
  business_unit_id?: number;
  region_id?: number;
  site_id?: number;
  asset_group_id?: number;
  work_group_id?: number;
  role_id?: number;
}

/**
 * Resolves the complete location hierarchy from a single node selection.
 * Queries the database to fetch the selected node and all its ancestors.
 *
 * @param supabase - Supabase client instance
 * @param nodeId - The ID of the selected node
 * @param nodeType - The type of the selected node
 * @param companyId - The company ID for validation
 * @returns LocationObject containing all ancestor IDs
 * @throws Error if node not found or doesn't belong to the company
 */
export async function resolveLocationFromNode(
  supabase: SupabaseClient,
  nodeId: number,
  nodeType: LocationNodeType,
  companyId: string
): Promise<LocationObject> {
  const location: LocationObject = {};

  switch (nodeType) {
    case 'role': {
      const { data: role, error } = await supabase
        .from('roles')
        .select('id, work_group_id, work_groups!inner(id, asset_group_id, asset_groups!inner(id, site_id, sites!inner(id, region_id, regions!inner(id, business_unit_id, business_units!inner(id, company_id)))))')
        .eq('id', nodeId)
        .eq('work_groups.asset_groups.sites.regions.business_units.company_id', companyId)
        .single();

      if (error || !role) {
        throw new Error(`Role with ID ${nodeId} not found or does not belong to company ${companyId}`);
      }

      const workGroups = role.work_groups as unknown as {
        asset_group_id: number;
        asset_groups: {
          site_id: number;
          sites: {
            region_id: number;
            regions: {
              business_unit_id: number;
            };
          };
        };
      };

      location.role_id = role.id;
      location.work_group_id = role.work_group_id;
      location.asset_group_id = workGroups.asset_group_id;
      location.site_id = workGroups.asset_groups.site_id;
      location.region_id = workGroups.asset_groups.sites.region_id;
      location.business_unit_id = workGroups.asset_groups.sites.regions.business_unit_id;
      break;
    }

    case 'work_group': {
      const { data: workGroup, error } = await supabase
        .from('work_groups')
        .select('id, asset_group_id, asset_groups!inner(id, site_id, sites!inner(id, region_id, regions!inner(id, business_unit_id, business_units!inner(id, company_id))))')
        .eq('id', nodeId)
        .eq('asset_groups.sites.regions.business_units.company_id', companyId)
        .single();

      if (error || !workGroup) {
        throw new Error(`Work group with ID ${nodeId} not found or does not belong to company ${companyId}`);
      }

      const assetGroups = workGroup.asset_groups as unknown as {
        site_id: number;
        sites: {
          region_id: number;
          regions: {
            business_unit_id: number;
          };
        };
      };

      location.work_group_id = workGroup.id;
      location.asset_group_id = workGroup.asset_group_id;
      location.site_id = assetGroups.site_id;
      location.region_id = assetGroups.sites.region_id;
      location.business_unit_id = assetGroups.sites.regions.business_unit_id;
      break;
    }

    case 'asset_group': {
      const { data: assetGroup, error } = await supabase
        .from('asset_groups')
        .select('id, site_id, sites!inner(id, region_id, regions!inner(id, business_unit_id, business_units!inner(id, company_id)))')
        .eq('id', nodeId)
        .eq('sites.regions.business_units.company_id', companyId)
        .single();

      if (error || !assetGroup) {
        throw new Error(`Asset group with ID ${nodeId} not found or does not belong to company ${companyId}`);
      }

      const sites = assetGroup.sites as unknown as {
        region_id: number;
        regions: {
          business_unit_id: number;
        };
      };

      location.asset_group_id = assetGroup.id;
      location.site_id = assetGroup.site_id;
      location.region_id = sites.region_id;
      location.business_unit_id = sites.regions.business_unit_id;
      break;
    }

    case 'site': {
      const { data: site, error } = await supabase
        .from('sites')
        .select('id, region_id, regions!inner(id, business_unit_id, business_units!inner(id, company_id))')
        .eq('id', nodeId)
        .eq('regions.business_units.company_id', companyId)
        .single();

      if (error || !site) {
        throw new Error(`Site with ID ${nodeId} not found or does not belong to company ${companyId}`);
      }

      const regions = site.regions as unknown as {
        business_unit_id: number;
      };

      location.site_id = site.id;
      location.region_id = site.region_id;
      location.business_unit_id = regions.business_unit_id;
      break;
    }

    case 'region': {
      const { data: region, error } = await supabase
        .from('regions')
        .select('id, business_unit_id, business_units!inner(id, company_id)')
        .eq('id', nodeId)
        .eq('business_units.company_id', companyId)
        .single();

      if (error || !region) {
        throw new Error(`Region with ID ${nodeId} not found or does not belong to company ${companyId}`);
      }

      location.region_id = region.id;
      location.business_unit_id = region.business_unit_id;
      break;
    }

    case 'business_unit': {
      const { data: businessUnit, error } = await supabase
        .from('business_units')
        .select('id, company_id')
        .eq('id', nodeId)
        .eq('company_id', companyId)
        .single();

      if (error || !businessUnit) {
        throw new Error(`Business unit with ID ${nodeId} not found or does not belong to company ${companyId}`);
      }

      location.business_unit_id = businessUnit.id;
      break;
    }

    default:
      throw new Error(`Invalid node type: ${nodeType}`);
  }

  return location;
}
