import type {
  GetOverallDesktopHeatmapParams,
  GetOverallDesktopHeatmapResponseData,
  GetOverallHeatmapFiltersResponseData,
  GetOverallOnsiteHeatmapParams,
  GetOverallOnsiteHeatmapResponseData,
  GetProgramInterviewHeatmapParams,
  GetProgramInterviewHeatmapResponseData,
  GetProgramMeasurementHeatmapResponseData,
  GetOverallGeographicalMapFiltersResponseData,
  GetOverallOnsiteGeographicalMapResponseData,
} from "@/types/api/analytics";
import { apiClient } from "./client";
import type { ApiResponse } from "./utils";

export async function getOverallGeographicalMapFilters(
  companyId: string,
  assessmentType: "onsite" | "desktop"
): Promise<GetOverallGeographicalMapFiltersResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetOverallGeographicalMapFiltersResponseData>
  >("/analytics/geographical-map/overall/filters", {
    params: {
      companyId,
      assessmentType,
    },
  });

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch geographical map filters"
    );
  }

  if (!response.data.data) {
    throw new Error("No data received for geographical map filters");
  }

  return response.data.data;
}

export async function getOverallOnsiteGeographicalMap(
  companyId: string,
  questionnaireId: number,
  assessmentId?: number
): Promise<GetOverallOnsiteGeographicalMapResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetOverallOnsiteGeographicalMapResponseData>
  >("/analytics/geographical-map/overall/onsite", {
    params: {
      companyId,
      questionnaireId,
      assessmentId,
    },
  });

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch onsite geographical map"
    );
  }

  return response.data.data;
}

export async function getOverallDesktopGeographicalMap(
  companyId: string,
  assessmentId?: number
): Promise<
  {
    name: string;
    lat: number;
    lng: number;
    region: string;
    businessUnit: string;
    measurements: {
      name: string;
      sum: number;
      count: number;
      average: number;
    }[];
  }[]
> {
  const response = await apiClient.get<
    ApiResponse<
      {
        name: string;
        lat: number;
        lng: number;
        region: string;
        businessUnit: string;
        measurements: {
          name: string;
          sum: number;
          count: number;
          average: number;
        }[];
      }[]
    >
  >("/analytics/geographical-map/overall/desktop", {
    params: {
      companyId,
      assessmentId,
    },
  });

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch desktop geographical map"
    );
  }

  return response.data.data;
}

export async function getOverallHeatmapFilters(
  companyId: string,
  assessmentType: "onsite" | "desktop"
): Promise<GetOverallHeatmapFiltersResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetOverallHeatmapFiltersResponseData>
  >(`/analytics/heatmap/overall/filters`, {
    params: { companyId, assessmentType },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch heatmap filters");
  }

  return response.data.data;
}

export async function getOverallOnsiteHeatmap(
  params: GetOverallOnsiteHeatmapParams
): Promise<GetOverallOnsiteHeatmapResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetOverallOnsiteHeatmapResponseData>
  >("/analytics/heatmap/overall/onsite", {
    params,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch heatmap");
  }

  return response.data.data;
}

export async function getOverallDesktopHeatmap(
  params: GetOverallDesktopHeatmapParams
): Promise<GetOverallDesktopHeatmapResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetOverallDesktopHeatmapResponseData>
  >("/analytics/heatmap/overall/desktop", {
    params,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch heatmap");
  }

  return response.data.data;
}

export async function getProgramInterviewHeatmap(
  programId: string,
  params: GetProgramInterviewHeatmapParams
): Promise<GetProgramInterviewHeatmapResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetProgramInterviewHeatmapResponseData>
  >(`/analytics/heatmap/program-interviews/${programId}`, {
    params,
  });

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program interview heatmap"
    );
  }

  return response.data.data;
}

export async function getProgramMeasurementHeatmap(
  programId: string
): Promise<GetProgramMeasurementHeatmapResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetProgramMeasurementHeatmapResponseData>
  >(`/analytics/heatmap/program-measurements/${programId}`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program measurement heatmap"
    );
  }

  return response.data.data;
}
