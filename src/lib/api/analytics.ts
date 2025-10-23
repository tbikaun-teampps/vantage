import type {
  OverallGeographicalMapFiltersResponseData,
  OverallOnsiteGeographicalMapResponseData,
} from "@/types/api/analytics";
import { apiClient } from "./client";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getOverallGeographicalMapFilters(
  companyId: string,
  assessmentType: "onsite" | "desktop"
): Promise<OverallGeographicalMapFiltersResponseData> {
  const response = await apiClient.get<
    ApiResponse<OverallGeographicalMapFiltersResponseData>
  >("/analytics/overall/geographical-map/filters", {
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
): Promise<OverallOnsiteGeographicalMapResponseData> {
  const response = await apiClient.get<
    ApiResponse<OverallOnsiteGeographicalMapResponseData>
  >("/analytics/geographical-map/overall-onsite", {
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
  >("/analytics/geographical-map/overall-desktop", {
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
): Promise<{
  questionnaires: { id: number; name: string; assessmentIds: number[] }[];
  assessments: { id: number; name: string; questionnaireId: number }[];
  axes: { value: string; category: string }[];
  metrics: string[];
}> {
  const response = await apiClient.get<
    ApiResponse<{
      options: {
        questionnaires: { id: number; name: string; assessmentIds: number[] }[];
        assessments: {
          id: number;
          name: string;
          questionnaireId: number;
        }[];
        axes: { value: string; category: string }[];
        metrics: string[];
      };
    }>
  >(`/analytics/overall/heatmap/filters`, {
    params: { companyId, assessmentType },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch heatmap filters");
  }

  return response.data.data.options;
}

export async function getOverallOnsiteHeatmap(
  companyId: string,
  questionnaireId: number,
  assessmentId?: number,
  xAxis?:
    | "business_unit"
    | "region"
    | "site"
    | "asset_group"
    | "work_group"
    | "role"
    | "role_level"
    | "section"
    | "step"
    | "question",
  yAxis?:
    | "business_unit"
    | "region"
    | "site"
    | "asset_group"
    | "work_group"
    | "role"
    | "role_level"
    | "section"
    | "step"
    | "question"
): Promise<{
  xLabels: string[];
  yLabels: string[];
  metrics: {
    average_score: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
    total_interviews: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
    completion_rate: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
    total_actions: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
  };
  config: {
    xAxis: string;
    yAxis: string;
    questionnaireId: number;
    assessmentId: number | null;
  };
}> {
  const response = await apiClient.get<
    ApiResponse<{
      xLabels: string[];
      yLabels: string[];
      metrics: {
        average_score: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: any;
          }[];
          values: number[];
        };
        total_interviews: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: any;
          }[];
          values: number[];
        };
        completion_rate: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: any;
          }[];
          values: number[];
        };
        total_actions: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: any;
          }[];
          values: number[];
        };
      };
      config: {
        xAxis: string;
        yAxis: string;
        questionnaireId: number;
        assessmentId: number | null;
      };
    }>
  >("/analytics/heatmap/overall-onsite", {
    params: { companyId, questionnaireId, assessmentId, xAxis, yAxis },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch heatmap");
  }

  return response.data.data;
}

export async function getOverallDesktopHeatmap(
  companyId: string,
  assessmentId?: number,
  xAxis?:
    | "business_unit"
    | "region"
    | "site"
    | "asset_group"
    | "work_group"
    | "role"
    | "role_level"
    | "measurement",
  yAxis?:
    | "business_unit"
    | "region"
    | "site"
    | "asset_group"
    | "work_group"
    | "role"
    | "role_level"
    | "measurement"
): Promise<{
  xLabels: string[];
  yLabels: string[];
  aggregations: {
    sum: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
    count: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
    average: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
  };
  config: {
    xAxis: string;
    yAxis: string;
    assessmentId: number | null;
  };
}> {
  const response = await apiClient.get<
    ApiResponse<{
      xLabels: string[];
      yLabels: string[];
      aggregations: {
        sum: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: object;
          }[];
          values: number[];
        };
        count: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: object;
          }[];
          values: number[];
        };
        average: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: object;
          }[];
          values: number[];
        };
      };
      config: {
        xAxis: string;
        yAxis: string;
        assessmentId: number | null;
      };
    }>
  >("/analytics/heatmap/overall-desktop", {
    params: { companyId, assessmentId, xAxis, yAxis },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch heatmap");
  }

  return response.data.data;
}
