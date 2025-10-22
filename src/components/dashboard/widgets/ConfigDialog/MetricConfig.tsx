import React, { useState } from "react";
import type { MetricConfig, WidgetConfig } from "@/hooks/useDashboardLayouts";

interface MetricConfigurationFormProps {
  config?: MetricConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

export const MetricConfigurationForm: React.FC<
  MetricConfigurationFormProps
> = ({ config, onConfigChange }) => {
  const [metricType, setMetricType] = useState<MetricConfig["metricType"]>(
    config?.metricType || "assessment-activity"
  );

  // Update pending config whenever selection changes
  const handleMetricChange = (value: MetricConfig["metricType"]) => {
    setMetricType(value);
    updateConfig(value);
  };

  // Update config whenever any field changes
  const updateConfig = (metricType: MetricConfig["metricType"]) => {
    const newConfig: WidgetConfig = {
      metric: {
        metricType,
      },
    };

    onConfigChange?.(newConfig);
  };

  const metricOptions = [
    {
      value: "assessment-activity" as MetricConfig["metricType"],
      title: "Assessment Activity",
      tags: [],
      description: "Shows recent activity on assessments",
    },
    {
      value: "generated-actions" as MetricConfig["metricType"],
      title: "Generated Actions",
      tags: [],
      description:
        "Shows the count of actions identified from interview responses",
    },
    {
      value: "generated-recommendations" as MetricConfig["metricType"],
      title: "Generated Recommendations",
      tags: [],
      description:
        "Shows the count of recommendations generated from assessments",
    },
    {
      value: "worst-performing-domain" as MetricConfig["metricType"],
      title: "Worst Performing Domain",
      tags: [],
      description: "Shows the domain with the lowest performance",
    },
    {
      value: "high-risk-areas" as MetricConfig["metricType"],
      title: "High Risk Areas",
      tags: [],
      description: "Shows areas with the highest risk",
    },
  ];

  return (
    <div>
      <div className="space-y-2">
        {metricOptions.map((option) => (
          <div
            key={option.value}
            onClick={() => handleMetricChange(option.value)}
            className={`
                    p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm
                    ${
                      metricType === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }
                  `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4
                  className={`font-medium text-sm ${
                    metricType === option.value
                      ? "text-blue-900 dark:text-blue-100"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {option.title}
                </h4>
                <p
                  className={`text-xs mt-1 ${
                    metricType === option.value
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {option.description}
                </p>
                {option.tags.length !== 0 && (
                  <div className="flex gap-1 mt-2">
                    {option.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`
                              text-xs px-2 py-1 rounded-full
                              ${
                                metricType === option.value
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              }
                            `}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div
                className={`
                      w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0
                      ${
                        metricType === option.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 dark:border-gray-600"
                      }
                    `}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
