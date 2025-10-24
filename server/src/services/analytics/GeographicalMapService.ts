import { SupabaseClient } from "@supabase/supabase-js";
import {
  OnsiteGeographicalMapFilters,
  DesktopGeographicalMapFilters,
  RawOverallAnalyticsData,
  OnsiteGeographicalMapSiteData,
  DesktopGeographicalMapSiteData,
} from "../../types/entities/analytics";
import { Database } from "../../types/database";

// Internal type for site aggregation during processing
interface SiteAggregation {
  name: string;
  lat: number | null;
  lng: number | null;
  region: string;
  businessUnit: string;
  assetGroups: Set<string>;
  workGroups: Set<string>;
  ratings: number[];
  interviews: Set<number>;
  totalResponses: number;
  completedResponses: number;
}

// Type for raw measurement data from Supabase query
interface RawMeasurementData {
  id: number;
  calculated_value: number;
  definition: {
    id: number;
    name: string;
  };
  business_unit: {
    name: string;
  };
  region: {
    name: string;
  };
  site: {
    name: string;
    lat: number | null;
    lng: number | null;
  };
}

// Internal type for desktop site aggregation
interface DesktopSiteAggregation {
  name: string;
  lat: number | null;
  lng: number | null;
  region: string;
  businessUnit: string;
  measurementsByDefinition: Map<
    string,
    {
      name: string;
      values: number[];
    }
  >;
}

/**
 * Get overall onsite geographical data for a specific company, questionnaire, and assessment
 *   TODO: Handle whether interviews should be filtered by their status (e.g., completed only)
 *   TODO: Handle whether to fetch sites that don't have responses so they can be shown on the map.
 *   TODO: Handle filtering out sites that have no lat/lng as they cannot be visualized on the map. Perhaps warn the user.
 * @param supabase
 * @param companyId
 * @param questionnaireId
 * @param assessmentId
 * @returns
 */
export async function getOverallOnsiteGeographicalMapData(
  supabase: SupabaseClient<Database>,
  companyId: string,
  questionnaireId: number,
  assessmentId?: number
): Promise<OnsiteGeographicalMapSiteData[]> {
  // Fetch all the assessments that use the questionnaireId
  let query = supabase
    .from("assessments")
    .select("*")
    .eq("questionnaire_id", questionnaireId)
    .eq("company_id", companyId)
    .eq("type", "onsite");

  if (assessmentId) {
    query = query.eq("id", assessmentId);
  }

  const { data: assessments, error } = await query;

  if (error) {
    throw error;
  }

  console.log(`Fetched ${assessments?.length || 0} assessments`);

  // NOTE: The only reliable way to get the location details
  // is by finding the site of roles that answer interviews.

  const { data: interviews, error: interviewError } = await supabase
    .from("interviews")
    .select(
      `
          id,
          status,
          name,
          interview_responses(
            id,
            rating_score,
            is_applicable,
            questionnaire_question_id,
            interview_response_roles(
              id,
              roles(
                id,
                level,
                shared_roles(
                  name,
                  description
                  ),
                work_groups(
                  id,
                  name,
                  description,
                  asset_groups(
                    id,
                    name,
                    description,
                    sites(
                      id,
                      name,
                      description,
                      lat,
                      lng,
                      regions(
                        id,
                        name,
                        description,
                        business_units(
                          id,
                          name,
                          description
                          )
                          )
                        )
                      )
                  )
                )
            )
          )`
    )
    .in("assessment_id", assessments?.map((a) => a.id) || [])
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .eq("interview_responses.is_deleted", false)
    .eq("interview_responses.is_applicable", true) // Only get applicable responses
    .eq("interview_responses.interview_response_roles.roles.is_deleted", false)
    .eq(
      "interview_responses.interview_response_roles.roles.shared_roles.is_deleted",
      false
    )
    .eq(
      "interview_responses.interview_response_roles.roles.work_groups.is_deleted",
      false
    )
    .eq(
      "interview_responses.interview_response_roles.roles.work_groups.asset_groups.is_deleted",
      false
    )
    .eq(
      "interview_responses.interview_response_roles.roles.work_groups.asset_groups.sites.is_deleted",
      false
    )
    .eq(
      "interview_responses.interview_response_roles.roles.work_groups.asset_groups.sites.regions.is_deleted",
      false
    )
    .eq(
      "interview_responses.interview_response_roles.roles.work_groups.asset_groups.sites.regions.business_units.is_deleted",
      false
    );

  if (interviewError) {
    throw interviewError;
  }

  console.log(`Fetched ${interviews?.length || 0} interviews`);

  function aggregateDataBySite(
    interviews: RawOverallAnalyticsData[]
  ): OnsiteGeographicalMapSiteData[] {
    const siteMap = new Map<string, SiteAggregation>();

    interviews.forEach((interview) => {
      interview.interview_responses.forEach((response) => {
        // Group roles by site
        const siteGroups = groupRolesBySite(response.interview_response_roles);

        console.log('siteGroups size:', siteGroups.size);

        // Full attribution: each site gets the full response counted
        siteGroups.forEach((roles, siteKey) => {
          const siteInfo = roles[0].roles.work_groups.asset_groups.sites;
          const region = siteInfo.regions;
          const businessUnit = region.business_units;

          if (!siteMap.has(siteKey)) {
            siteMap.set(siteKey, {
              name: siteInfo.name,
              lat: siteInfo.lat,
              lng: siteInfo.lng,
              region: region.name,
              businessUnit: businessUnit.name,
              assetGroups: new Set(),
              workGroups: new Set(),
              ratings: [],
              interviews: new Set(),
              totalResponses: 0,
              completedResponses: 0,
            });
          }

          const site = siteMap.get(siteKey);
          if (!site) return;

          // Track unique interviews
          site.interviews.add(interview.id);

          // Full attribution of the response to this site
          site.totalResponses++;

          if (response.rating_score !== null) {
            site.ratings.push(response.rating_score);
            site.completedResponses++;
          }

          // Collect asset and work groups from this site's roles
          roles.forEach((role) => {
            site.assetGroups.add(role.roles.work_groups.asset_groups.name);
            site.workGroups.add(role.roles.work_groups.name);
          });
        });
      });
    });

    console.log(`Aggregated data for ${siteMap.size} sites`);

    return Array.from(siteMap.values()).map((site) =>
      calculateSiteMetrics(site)
    );
  }

  function groupRolesBySite(
    roles: RawOverallAnalyticsData["interview_responses"][0]["interview_response_roles"]
  ): Map<
    string,
    RawOverallAnalyticsData["interview_responses"][0]["interview_response_roles"]
  > {
    const groups = new Map<
      string,
      RawOverallAnalyticsData["interview_responses"][0]["interview_response_roles"]
    >();

    roles.forEach((role) => {
      const site = role.roles.work_groups.asset_groups.sites;
      const siteKey = `${site.id}_${site.name}`;

      if (!groups.has(siteKey)) {
        groups.set(siteKey, []);
      }
      const group = groups.get(siteKey);
      if (group) {
        group.push(role);
      }
    });

    return groups;
  }

  function calculateSiteMetrics(
    site: SiteAggregation
  ): OnsiteGeographicalMapSiteData {
    // Calculate average score
    const avgScore =
      site.ratings.length > 0
        ? site.ratings.reduce((sum, score) => sum + score, 0) /
          site.ratings.length
        : 0;

    // Calculate completion rate
    const completionRate =
      site.totalResponses > 0
        ? site.completedResponses / site.totalResponses
        : 0;

    return {
      name: site.name,
      lat: site.lat,
      lng: site.lng,
      region: site.region,
      businessUnit: site.businessUnit,
      score: avgScore,
      interviews: site.interviews.size,
      totalActions: site.totalResponses,
      completionRate: completionRate,
    };
  }

  // TODO: Fetch all sites in the company even without data as they will be used to show 0 data points on the map.
  return aggregateDataBySite(interviews as RawOverallAnalyticsData[]);
}

/**
 * Get overall desktop geographical data for a specific company, and assessment
 * NOTE: this ONLY gets data assigned to site levels, not above or below, as this will skew the map data.
 *   TODO: Handle whether to fetch sites that don't have responses so they can be shown on the map.
 *   TODO: Handle filtering out sites that have no lat/lng as they cannot be visualized on the map. Perhaps warn the user.
 * @param supabase
 * @param companyId
 * @param assessmentId
 * @returns
 */
export async function getOverallDesktopGeographicalMapData(
  supabase: SupabaseClient<Database>,
  companyId: string,
  assessmentId?: number
): Promise<DesktopGeographicalMapSiteData[]> {
  // Fetch all the assessments in the company (and assessmentId if provided)
  console.log("Fetching overall desktop geographical map data:", {
    companyId,
    assessmentId,
  });
  let query = supabase
    .from("assessments")
    .select("*")
    .eq("company_id", companyId)
    .eq("type", "desktop");

  if (assessmentId) {
    query = query.eq("id", assessmentId);
  }

  const { data: assessments, error } = await query;

  if (error) {
    throw error;
  }

  const { data: measurements, error: measurementsError } = await supabase
    .from("measurements_calculated")
    .select(
      `id,
      calculated_value,
      definition:measurement_definitions(*),
      business_unit:business_unit_id(name),
      region:region_id(name),
      site:site_id!inner(name, lat, lng)
      `
    )
    .in("assessment_id", assessments?.map((a) => a.id) || [])
    .not("site_id", "is", null) // Must have a site to be shown on the map
    .not("region_id", "is", null) // Must have a region (prevents null joins)
    .not("business_unit_id", "is", null) // Must have a business unit (prevents null joins)
    .is("asset_group_id", null) // Don't aggregate anything lower than site (site > asset group ...)
    .not("site.lat", "is", null) // Must have lat/lng to be shown on the map
    .not("site.lng", "is", null) // Must have lat/lng to be shown on the map
    .eq("is_deleted", false)
    .eq("site.is_deleted", false)
    .eq("region.is_deleted", false)
    .eq("business_unit.is_deleted", false);

  if (measurementsError) {
    throw measurementsError;
  }

  function aggregateDataBySite(
    measurements: RawMeasurementData[]
  ): DesktopGeographicalMapSiteData[] {
    const siteMap = new Map<string, DesktopSiteAggregation>();

    measurements.forEach((measurement) => {
      // Create a unique key for each site (business_unit + region + site)
      const siteKey = `${measurement.business_unit.name}_${measurement.region.name}_${measurement.site.name}`;

      // Initialize site if not exists
      if (!siteMap.has(siteKey)) {
        siteMap.set(siteKey, {
          name: measurement.site.name,
          lat: measurement.site.lat,
          lng: measurement.site.lng,
          region: measurement.region.name,
          businessUnit: measurement.business_unit.name,
          measurementsByDefinition: new Map(),
        });
      }

      const site = siteMap.get(siteKey);
      if (!site) return;

      // Group measurements by definition within this site
      const definitionKey = `${measurement.definition.id}_${measurement.definition.name}`;

      if (!site.measurementsByDefinition.has(definitionKey)) {
        site.measurementsByDefinition.set(definitionKey, {
          name: measurement.definition.name,
          values: [],
        });
      }

      const definitionData = site.measurementsByDefinition.get(definitionKey);
      if (definitionData) {
        definitionData.values.push(measurement.calculated_value);
      }
    });

    return Array.from(siteMap.values()).map((site) =>
      calculateSiteMetrics(site)
    );
  }

  function calculateSiteMetrics(
    site: DesktopSiteAggregation
  ): DesktopGeographicalMapSiteData {
    // Calculate sum, average, and count for each measurement definition
    const measurements = Array.from(site.measurementsByDefinition.values()).map(
      (definition) => {
        const sum = definition.values.reduce((acc, val) => acc + val, 0);
        const count = definition.values.length;
        const average = count > 0 ? sum / count : 0;

        return {
          name: definition.name,
          sum,
          average,
          count,
        };
      }
    );

    return {
      name: site.name,
      lat: site.lat,
      lng: site.lng,
      region: site.region,
      businessUnit: site.businessUnit,
      measurements,
    };
  }

  // TODO: Fetch all sites in the company even without data as they will be used to show 0 data points on the map.
  return aggregateDataBySite(measurements as RawMeasurementData[]);
}

export async function getOverallGeographicalMapFilters(
  supabase: SupabaseClient<Database>,
  companyId: string,
  assessmentType: "onsite" | "desktop"
): Promise<OnsiteGeographicalMapFilters | DesktopGeographicalMapFilters> {
  // Fetch assessment and questionnaire (if onsite) options for the user to select from
  console.log("Fetching filters for Geographical Map:", {
    companyId,
    assessmentType,
  });

  if (assessmentType === "onsite") {
    const { data: assessments, error: assessmentsError } = await supabase
      .from("assessments")
      .select("id, name, questionnaires(id, name)")
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .eq("type", assessmentType)
      .eq("questionnaires.is_deleted", false)
      .order("created_at", { ascending: false });

    if (assessmentsError) {
      throw assessmentsError;
    }

    // Build unique questionnaires map with their associated assessments
    const questionnairesMap = new Map();
    assessments?.forEach((assessment) => {
      // Supabase returns questionnaires as an array due to PostgREST join behavior
      const questionnaire = Array.isArray(assessment.questionnaires)
        ? assessment.questionnaires[0]
        : assessment.questionnaires;
      if (questionnaire) {
        if (!questionnairesMap.has(questionnaire.id)) {
          questionnairesMap.set(questionnaire.id, {
            id: questionnaire.id,
            name: questionnaire.name,
            assessmentIds: [],
          });
        }
        questionnairesMap
          .get(questionnaire.id)
          .assessmentIds.push(assessment.id);
      }
    });

    return {
      options: {
        assessments: (assessments || []).map((a) => {
          const questionnaire = Array.isArray(a.questionnaires)
            ? a.questionnaires[0]
            : a.questionnaires;
          return {
            id: a.id,
            name: a.name,
            questionnaireId: questionnaire?.id || null,
          };
        }),
        questionnaires: Array.from(questionnairesMap.values()),
      },
    } as OnsiteGeographicalMapFilters;
  } else if (assessmentType === "desktop") {
    const { data: assessments, error: assessmentsError } = await supabase
      .from("assessments")
      .select("id, name")
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .eq("type", assessmentType)
      .order("created_at", { ascending: false });

    if (assessmentsError) {
      throw assessmentsError;
    }

    // TODO: turn this into an RPC, as there will be lots of measurements and
    const { data: measurements, error: measurementsError } = await supabase
      .from("measurements_calculated")
      .select("id, definition:measurement_definitions(*)")
      .in("assessment_id", assessments?.map((a) => a.id) || [])
      .eq("is_deleted", false);

    if (measurementsError) {
      throw measurementsError;
    }

    // Return non-duplicate definitions as {id: measurement_definition.id, name: measurement_definition.name}
    // as these are what the user will select from
    const definitionsMap = new Map();
    measurements?.forEach((measurement) => {
      const definition = measurement.definition;
      if (definition && !definitionsMap.has(definition.id)) {
        definitionsMap.set(definition.id, {
          id: definition.id,
          name: definition.name,
        });
      }
    });

    return {
      options: {
        assessments: (assessments || []).map((a) => {
          return {
            id: a.id,
            name: a.name,
          };
        }),
        measurements: Array.from(definitionsMap.values()),
        aggregationMethods: ["average", "sum", "count"],
      },
    } as DesktopGeographicalMapFilters;
  } else {
    throw new Error(`Unsupported assessment type: ${assessmentType}`);
  }
}
