import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  BusinessUnitEntity,
  RegionEntity,
  SiteEntity,
  AssetGroupEntity,
} from "@/types/api/companies";
import type { CreateAssessmentFormData } from "@/types/api/assessments";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

interface LocationHierarchyProps {
  formData: {
    business_unit_id?: number;
    region_id?: number;
    site_id?: number;
    asset_group_id?: number;
  };
  formErrors: Record<string, string>;
  businessUnits: BusinessUnitEntity[];
  regions: RegionEntity[];
  sites: SiteEntity[];
  assetGroups: AssetGroupEntity[];
  onInputChange: (field: keyof CreateAssessmentFormData, value: string | number) => void;
}

export function LocationHierarchy({
  formData,
  formErrors,
  businessUnits,
  regions,
  sites,
  assetGroups,
  onInputChange,
}: LocationHierarchyProps) {
  const routes = useCompanyRoutes();
  // Filter data based on parent selections
  const filteredRegions = formData.business_unit_id
    ? regions.filter(
        (region) =>
          region.business_unit_id === formData.business_unit_id
      )
    : [];

  const filteredSites = formData.region_id
    ? sites.filter((site) => site.region_id === formData.region_id)
    : [];

  const filteredAssetGroups = formData.site_id
    ? assetGroups.filter(
        (group) => group.site_id === formData.site_id
      )
    : [];

  return (
    <Card
      className="shadow-none border-none"
      data-tour="assessment-location-hierarchy"
    >
      <CardHeader>
        <CardTitle>Location Hierarchy</CardTitle>
        <CardDescription>
          Optionally select the location where this assessment will be conducted
          <div className="text-xs text-muted-foreground mt-1">
            If used, you must follow the order: Business Unit → Region → Site →
            Asset Group
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-y-2 gap-4">
          {/* Business Unit Selection */}
          <div className="space-y-2" data-tour="assessment-business-unit">
            <Label htmlFor="business_unit_id">Business Unit</Label>
            <Select
              value={formData.business_unit_id?.toString() || ""}
              onValueChange={(value) =>
                onInputChange("business_unit_id", value)
              }
            >
              <SelectTrigger
                className={
                  formErrors.business_unit_id ? "border-destructive" : ""
                }
              >
                <SelectValue placeholder="Choose business unit" />
              </SelectTrigger>
              <SelectContent>
                {formData.business_unit_id && (
                  <SelectItem value="__clear__">
                    <span className="text-muted-foreground italic">
                      Clear selection
                    </span>
                  </SelectItem>
                )}
                {businessUnits.map((bu) => (
                  <SelectItem key={bu.id} value={bu.id.toString()}>
                    <div className="flex flex-col text-left">
                      <span>{bu.name}</span>
                      {bu.description && (
                        <span className="text-xs text-muted-foreground">
                          {bu.description.length > 50
                            ? `${bu.description.substring(0, 50)}...`
                            : bu.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.business_unit_id && (
              <p className="text-sm text-destructive">
                {formErrors.business_unit_id}
              </p>
            )}
            {businessUnits.length === 0 && (
              <div className="text-sm text-muted-foreground">
                <span>No business units found.</span>{" "}
                <Link
                  to={routes.settingsCompany()}
                  className="text-primary hover:text-primary/80 underline font-medium"
                >
                  Set up company structure
                </Link>
              </div>
            )}
          </div>

          {/* Region Selection */}
          <div className="space-y-2" data-tour="assessment-region">
            <Label htmlFor="region_id">Region</Label>
            <Select
              value={formData.region_id?.toString() || ""}
              onValueChange={(value) => onInputChange("region_id", value)}
              disabled={!formData.business_unit_id}
            >
              <SelectTrigger
                className={formErrors.region_id ? "border-destructive" : ""}
              >
                <SelectValue
                  placeholder={
                    !formData.business_unit_id
                      ? "Select business unit first"
                      : filteredRegions.length === 0
                        ? "No regions available"
                        : "Choose region"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {formData.region_id && (
                  <SelectItem value="__clear__">
                    <span className="text-muted-foreground italic">
                      Clear selection
                    </span>
                  </SelectItem>
                )}
                {filteredRegions.map((region) => (
                  <SelectItem key={region.id} value={region.id.toString()}>
                    <div className="flex flex-col text-left">
                      <span>{region.name}</span>
                      {region.description && (
                        <span className="text-xs text-muted-foreground">
                          {region.description.length > 50
                            ? `${region.description.substring(0, 50)}...`
                            : region.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.region_id && (
              <p className="text-sm text-destructive">{formErrors.region_id}</p>
            )}
            {formData.business_unit_id && filteredRegions.length === 0 && (
              <div className="text-sm text-muted-foreground">
                <span>No regions in this business unit.</span>{" "}
                <Link
                  to={routes.settingsCompany()}
                  className="text-primary hover:text-primary/80 underline font-medium"
                >
                  Add regions
                </Link>
              </div>
            )}
          </div>

          {/* Site Selection */}
          <div className="space-y-2" data-tour="assessment-site">
            <Label htmlFor="site_id">Site</Label>
            <Select
              value={formData.site_id?.toString() || ""}
              onValueChange={(value) => onInputChange("site_id", value)}
              disabled={!formData.region_id}
            >
              <SelectTrigger
                className={formErrors.site_id ? "border-destructive" : ""}
              >
                <SelectValue
                  placeholder={
                    !formData.region_id
                      ? "Select region first"
                      : filteredSites.length === 0
                        ? "No sites available"
                        : "Choose site"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {formData.site_id && (
                  <SelectItem value="__clear__">
                    <span className="text-muted-foreground italic">
                      Clear selection
                    </span>
                  </SelectItem>
                )}
                {filteredSites.map((site) => (
                  <SelectItem key={site.id} value={site.id.toString()}>
                    <div className="flex flex-col  text-left">
                      <span>{site.name}</span>
                      {site.description && (
                        <span className="text-xs text-muted-foreground">
                          {site.description.length > 50
                            ? `${site.description.substring(0, 50)}...`
                            : site.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.site_id && (
              <p className="text-sm text-destructive">{formErrors.site_id}</p>
            )}
            {formData.region_id && filteredSites.length === 0 && (
              <div className="text-sm text-muted-foreground">
                <span>No sites in this region.</span>{" "}
                <Link
                  to={routes.settingsCompany()}
                  className="text-primary hover:text-primary/80 underline font-medium"
                >
                  Add sites
                </Link>
              </div>
            )}
          </div>

          {/* Asset Group Selection */}
          <div className="space-y-2" data-tour="assessment-asset-group">
            <Label htmlFor="asset_group_id">Asset Group</Label>
            <Select
              value={formData.asset_group_id?.toString() || ""}
              onValueChange={(value) => onInputChange("asset_group_id", value)}
              disabled={!formData.site_id}
            >
              <SelectTrigger
                className={
                  formErrors.asset_group_id ? "border-destructive" : ""
                }
              >
                <SelectValue
                  placeholder={
                    !formData.site_id
                      ? "Select site first"
                      : filteredAssetGroups.length === 0
                        ? "No asset groups available"
                        : "Choose asset group"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {formData.asset_group_id && (
                  <SelectItem value="__clear__">
                    <span className="text-muted-foreground italic">
                      Clear selection
                    </span>
                  </SelectItem>
                )}
                {filteredAssetGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    <div className="flex flex-col text-left">
                      <span>{group.name}</span>
                      {group.description && (
                        <span className="text-xs text-muted-foreground">
                          {group.description.length > 50
                            ? `${group.description.substring(0, 50)}...`
                            : group.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.asset_group_id && (
              <p className="text-sm text-destructive">
                {formErrors.asset_group_id}
              </p>
            )}
            {formData.site_id && filteredAssetGroups.length === 0 && (
              <div className="text-sm text-muted-foreground">
                <span>No asset groups in this site.</span>{" "}
                <Link
                  to={routes.settingsCompany()}
                  className="text-primary hover:text-primary/80 underline font-medium"
                >
                  Add asset groups
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
