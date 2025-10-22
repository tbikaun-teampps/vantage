import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronRight } from "lucide-react";
import { BRAND_COLORS } from "@/lib/brand";

interface HierarchicalDataItem {
  name: string;
  score: number;
  totalAssessments: number;
  completionRate: number;
  children?: HierarchicalDataItem[];
}

interface TreeNode {
  name: string;
  value: number;
  children?: TreeNode[];
}

interface LegendItem {
  label: string;
  color: string;
  range: string;
}

interface LegendProps {
  dataType: string;
}

interface D3TreeVisualizationProps {
  selectedCompanies: string[];
  dataType: string;
}

interface HierarchicalTreeProps {
  data: HierarchicalDataItem[];
  level?: number;
}

interface Dimensions {
  width: number;
  height: number;
}
export default function TreeHierarchy() {
  const hierarchicalData: HierarchicalDataItem[] = [
    {
      name: "Newmont Corporation",
      score: 2.2,
      totalAssessments: 425,
      completionRate: 0.88,
      children: [
        {
          name: "APAC - Asia Pacific",
          score: 2.15,
          totalAssessments: 156,
          completionRate: 0.85,
          children: [
            {
              name: "Western Australia",
              score: 2.2,
              totalAssessments: 89,
              completionRate: 0.87,
              children: [
                {
                  name: "Boddington",
                  score: 2.3,
                  totalAssessments: 52,
                  completionRate: 0.91,
                  children: [
                    {
                      name: "Fixed Plant",
                      score: 2.1,
                      totalAssessments: 24,
                      completionRate: 0.88,
                    },
                    {
                      name: "Mobile Equipment",
                      score: 2.4,
                      totalAssessments: 28,
                      completionRate: 0.93,
                    },
                  ],
                },
              ],
            },
            {
              name: "Northern Territory",
              score: 2.1,
              totalAssessments: 31,
              completionRate: 0.82,
              children: [
                {
                  name: "Tanami",
                  score: 2.1,
                  totalAssessments: 31,
                  completionRate: 0.82,
                },
              ],
            },
            {
              name: "New South Wales",
              score: 2.0,
              totalAssessments: 22,
              completionRate: 0.79,
              children: [
                {
                  name: "Cadia",
                  score: 2.0,
                  totalAssessments: 22,
                  completionRate: 0.79,
                },
              ],
            },
            {
              name: "Papua New Guinea",
              score: 1.9,
              totalAssessments: 14,
              completionRate: 0.76,
              children: [
                {
                  name: "Lihir",
                  score: 1.9,
                  totalAssessments: 14,
                  completionRate: 0.76,
                },
              ],
            },
          ],
        },
        {
          name: "AFCAN - Africa & Canada",
          score: 2.3,
          totalAssessments: 98,
          completionRate: 0.91,
          children: [
            {
              name: "Ghana",
              score: 2.1,
              totalAssessments: 33,
              completionRate: 0.87,
              children: [
                {
                  name: "Ahafo",
                  score: 2.1,
                  totalAssessments: 33,
                  completionRate: 0.87,
                },
              ],
            },
            {
              name: "Canada",
              score: 2.4,
              totalAssessments: 65,
              completionRate: 0.94,
              children: [
                {
                  name: "Brucejack",
                  score: 2.5,
                  totalAssessments: 38,
                  completionRate: 0.95,
                },
                {
                  name: "Red Chris",
                  score: 2.3,
                  totalAssessments: 27,
                  completionRate: 0.92,
                },
              ],
            },
          ],
        },
        {
          name: "LATAC - Latin America & Caribbean",
          score: 2.0,
          totalAssessments: 127,
          completionRate: 0.83,
          children: [
            {
              name: "Argentina",
              score: 2.2,
              totalAssessments: 29,
              completionRate: 0.86,
              children: [
                {
                  name: "Cerro Negro",
                  score: 2.2,
                  totalAssessments: 29,
                  completionRate: 0.86,
                },
              ],
            },
            {
              name: "Peru",
              score: 1.8,
              totalAssessments: 35,
              completionRate: 0.78,
              children: [
                {
                  name: "Yanacocha",
                  score: 1.8,
                  totalAssessments: 35,
                  completionRate: 0.78,
                },
              ],
            },
            {
              name: "Suriname",
              score: 2.1,
              totalAssessments: 24,
              completionRate: 0.84,
              children: [
                {
                  name: "Merian",
                  score: 2.1,
                  totalAssessments: 24,
                  completionRate: 0.84,
                },
              ],
            },
            {
              name: "Dominican Republic",
              score: 1.9,
              totalAssessments: 21,
              completionRate: 0.81,
              children: [
                {
                  name: "Pueblo Veijo",
                  score: 1.9,
                  totalAssessments: 21,
                  completionRate: 0.81,
                },
              ],
            },
            {
              name: "Mexico",
              score: 2.0,
              totalAssessments: 18,
              completionRate: 0.83,
              children: [
                {
                  name: "Penasquito",
                  score: 2.0,
                  totalAssessments: 18,
                  completionRate: 0.83,
                },
              ],
            },
          ],
        },
        {
          name: "Nevada Gold Mines JV",
          score: 2.4,
          totalAssessments: 44,
          completionRate: 0.93,
          children: [
            {
              name: "Nevada",
              score: 2.4,
              totalAssessments: 44,
              completionRate: 0.93,
              children: [
                {
                  name: "Cortez",
                  score: 2.5,
                  totalAssessments: 12,
                  completionRate: 0.95,
                },
                {
                  name: "Carlin",
                  score: 2.4,
                  totalAssessments: 10,
                  completionRate: 0.92,
                },
                {
                  name: "Turquoise Ridge",
                  score: 2.3,
                  totalAssessments: 8,
                  completionRate: 0.91,
                },
                {
                  name: "Phoenix",
                  score: 2.5,
                  totalAssessments: 7,
                  completionRate: 0.96,
                },
                {
                  name: "Long Canyon",
                  score: 2.4,
                  totalAssessments: 7,
                  completionRate: 0.93,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  // Color function for score-based coloring
  const getScoreColor = (score: number): string => {
    if (score >= 2.4) return BRAND_COLORS.turquoiseBlue; // Green - Excellent
    if (score >= 2.2) return BRAND_COLORS.malibu; // Light Green - Good
    if (score >= 2.0) return BRAND_COLORS.royalBlue; // Yellow - Fair
    return BRAND_COLORS.mediumPurple; // Red - Poor
  };

  // Transform data for D3 tree
  const createTreeData = (companies: string[], dataType: string): TreeNode => {
    const filteredData = hierarchicalData.filter((company) =>
      companies.includes(company.name)
    );

    const getValue = (node: HierarchicalDataItem): number => {
      switch (dataType) {
        case "Total Assessments":
          return node.totalAssessments;
        case "Completion Rate":
          return node.completionRate;
        default:
          return node.score;
      }
    };

    const processNode = (node: HierarchicalDataItem): TreeNode => ({
      ...node,
      value: getValue(node),
      children: node.children ? node.children.map(processNode) : undefined,
    });

    return {
      name: "Root",
      value:
        dataType === "Average Score"
          ? 2.35
          : dataType === "Total Assessments"
            ? 323
            : 0.9,
      children: filteredData.map(processNode),
    };
  };

  const Legend: React.FC<LegendProps> = ({ dataType }) => {
    const getLegendItems = (): LegendItem[] => {
      switch (dataType) {
        case "Total Assessments":
          return [
            { label: "High (100+)", color: getScoreColor(2.4), range: "100+" },
            {
              label: "Medium (50-100)",
              color: getScoreColor(2.3),
              range: "50-100",
            },
            { label: "Low (25-50)", color: getScoreColor(2.1), range: "25-50" },
            {
              label: "Very Low (<25)",
              color: getScoreColor(1.9),
              range: "<25",
            },
          ];
        case "Completion Rate":
          return [
            {
              label: "Excellent (95%+)",
              color: getScoreColor(2.4),
              range: "95%+",
            },
            {
              label: "Good (90-95%)",
              color: getScoreColor(2.3),
              range: "90-95%",
            },
            {
              label: "Fair (85-90%)",
              color: getScoreColor(2.1),
              range: "85-90%",
            },
            { label: "Poor (<85%)", color: getScoreColor(1.9), range: "<85%" },
          ];
        default:
          return [
            {
              label: "Excellent (2.4+)",
              color: getScoreColor(2.4),
              range: "2.4+",
            },
            {
              label: "Good (2.2-2.4)",
              color: getScoreColor(2.3),
              range: "2.2-2.4",
            },
            {
              label: "Fair (2.0-2.2)",
              color: getScoreColor(2.1),
              range: "2.0-2.2",
            },
            { label: "Poor (<2.0)", color: getScoreColor(1.9), range: "<2.0" },
          ];
      }
    };

    const legendItems = getLegendItems();

    return (
      <div className="absolute top-0 right-0 bg-white/95 backdrop-blur-sm border rounded-lg p-3 z-10">
        <div className="flex flex-row items-center">
          <h3 className="font-semibold text-xs mr-4">
            {dataType === "Total Assessments"
              ? "Assessment Count"
              : dataType === "Completion Rate"
                ? "Completion Rate"
                : "Score Legend"}
          </h3>
          <div className="flex gap-2">
            {legendItems.map((item) => (
              <div key={item.range} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-gray-700 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const D3TreeVisualization: React.FC<D3TreeVisualizationProps> = ({
    selectedCompanies,
    dataType,
  }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<Dimensions>({
      width: 0,
      height: 0,
    });

    // Handle resize and get container dimensions
    useEffect(() => {
      const updateDimensions = (): void => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDimensions({
            width: rect.width,
            height: rect.height,
          });
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
      if (dimensions.width === 0 || dimensions.height === 0 || !svgRef.current)
        return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const width = dimensions.width;
      const height = dimensions.height;
      const margin = { top: 40, right: 60, bottom: 40, left: 60 };

      // Set SVG dimensions
      svg.attr("width", width).attr("height", height);

      // Create tree data based on selected companies and data type
      const treeData = createTreeData(selectedCompanies, dataType);

      // Create hierarchy
      const root = d3.hierarchy(treeData);

      // Create the tree layout with responsive dimensions
      const treeLayout = d3
        .tree<TreeNode>()
        .size([
          height - margin.top - margin.bottom,
          width - margin.left - margin.right,
        ]);

      treeLayout(root);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Color scale based on data type
      const getColorForValue = (value: number): string => {
        switch (dataType) {
          case "Total Assessments":
            if (value >= 100) return getScoreColor(2.4);
            if (value >= 50) return getScoreColor(2.3);
            if (value >= 25) return getScoreColor(2.1);
            return getScoreColor(1.9);
          case "Completion Rate":
            if (value >= 0.95) return getScoreColor(2.4);
            if (value >= 0.9) return getScoreColor(2.3);
            if (value >= 0.85) return getScoreColor(2.1);
            return getScoreColor(1.9);
          default:
            return getScoreColor(value);
        }
      };

      // Add links
      g.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr(
          "d",
          d3
            .linkHorizontal<unknown, d3.HierarchyPointNode<TreeNode>>()
            .x((d) => d.y)
            .y((d) => d.x)
        )
        .style("fill", "none")
        .style("stroke", "#94a3b8")
        .style("stroke-width", 2)
        .style("stroke-opacity", 0.8);

      // Add nodes
      const node = g
        .selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

      // Add circles
      node
        .append("circle")
        .attr("r", (d) => (d.data.name === "Root" ? 0 : 8))
        .style("fill", (d) =>
          d.data.name === "Root"
            ? "transparent"
            : getColorForValue(d.data.value)
        )
        .style("stroke", "#ffffff")
        .style("stroke-width", 2)
        .on("mouseenter", function (event, d) {
          if (d.data.name === "Root") return;
          d3.select(this).transition().duration(200).attr("r", 12);
        })
        .on("mouseleave", function (event, d) {
          if (d.data.name === "Root") return;
          d3.select(this).transition().duration(200).attr("r", 8);
        });

      // Add labels (positioned above circles)
      node
        .append("text")
        .attr("dy", "-1.2em") // Position above the circle
        .attr("x", 0) // Center horizontally
        .style("text-anchor", "middle") // Center the text
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("fill", "#1f2937")
        .text((d) => (d.data.name === "Root" ? "" : d.data.name));

      // Add values (positioned above labels)
      node
        .append("text")
        .attr("dy", "-2.4em") // Position above the labels
        .attr("x", 0) // Center horizontally
        .style("text-anchor", "middle") // Center the text
        .style("font-size", "10px")
        .style("font-weight", "600")
        .style("fill", "#6b7280")
        .text((d) => {
          if (d.data.name === "Root") return "";
          switch (dataType) {
            case "Total Assessments":
              return d.data.value.toString();
            case "Completion Rate":
              return `${(d.data.value * 100).toFixed(0)}%`;
            default:
              return d.data.value.toFixed(2);
          }
        });
    }, [dimensions, selectedCompanies, dataType]);

    return (
      <div ref={containerRef} className="w-full h-full">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ display: "block" }}
        />
      </div>
    );
  };

  const HierarchicalTree: React.FC<HierarchicalTreeProps> = ({
    data,
    level = 0,
  }) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(
      new Set(["Aurizon", "Bulk"])
    );

    const toggleExpanded = (name: string): void => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(name)) {
        newExpanded.delete(name);
      } else {
        newExpanded.add(name);
      }
      setExpandedItems(newExpanded);
    };

    return (
      <div className="space-y-0">
        {data.map((item, index) => (
          <div key={index}>
            <div
              className={`flex items-center justify-between py-2 px-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                level > 0 ? "ml-4 border-l border-border" : ""
              }`}
              onClick={() =>
                item.children &&
                item.children.length > 0 &&
                toggleExpanded(item.name)
              }
            >
              <div className="flex items-center gap-2">
                {item.children && item.children.length > 0 ? (
                  expandedItems.has(item.name) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )
                ) : (
                  <div className="w-4" />
                )}
                <span className={`${level === 0 ? "font-medium" : "text-sm"}`}>
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {item.score.toFixed(2)}
              </span>
            </div>

            {item.children && expandedItems.has(item.name) && (
              <HierarchicalTree data={item.children} level={level + 1} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // New states for tree visualization
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([
    "Newmont Corporation",
  ]);
  const [treeDataType, setTreeDataType] = useState<string>("Average Score");

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 flex-shrink-0">
        <div className="space-y-1">
          <CardTitle>Assessment Hierarchy</CardTitle>
          <CardDescription>
            Assessment scores across organisational structure
          </CardDescription>
        </div>

        {/* Tree Controls */}
        <div className="flex gap-4">
          <div className="space-y-2 min-w-[180px]">
            <label className="text-sm font-medium">Data Type</label>
            <Select value={treeDataType} onValueChange={setTreeDataType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Average Score">Average Score</SelectItem>
                <SelectItem value="Total Assessments">
                  Total Assessments
                </SelectItem>
                <SelectItem value="Completion Rate">Completion Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {/* Tree Visualization with Legend Overlay */}
        <div className="relative h-full">
          <D3TreeVisualization
            selectedCompanies={selectedCompanies}
            dataType={treeDataType}
          />
          <Legend dataType={treeDataType} />
        </div>
      </CardContent>
    </Card>
  );
}
