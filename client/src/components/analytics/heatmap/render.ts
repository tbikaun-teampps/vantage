import { BRAND_COLORS } from "@/lib/brand";
import * as d3 from "d3";

export function renderHeatmap(
  svgRef: React.RefObject<SVGSVGElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  data: { x: string; y: string; value: number | null | undefined }[],
  values: (number | null | undefined)[],
  xLabels: string[],
  yLabels: string[],
  valueFormatter?: (value: number | null | undefined) => string
) {
  if (!svgRef.current) return;

  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove(); // Clear previous render

  // Get actual container dimensions
  const containerRect = containerRef.current?.getBoundingClientRect();
  const containerWidth = containerRect ? containerRect.width - 48 : 800; // Account for p-6 padding (24px each side)
  const containerHeight = containerRect ? containerRect.height - 48 : 500;

  // Simple margins
  const margin = {
    top: 40,
    right: 40,
    bottom: 80,
    left: 150,
  };

  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  // Update SVG dimensions
  svg.attr("width", containerWidth).attr("height", containerHeight);

  // Create zoom behavior
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 3]) // Allow zoom from 50% to 300%
    .on("zoom", (event) => {
      const { transform } = event;
      zoomGroup.attr("transform", transform);
    });

  // Apply zoom to SVG
  svg.call(zoom);

  // Add zoom controls
  const controls = svg
    .append("g")
    .attr("class", "zoom-controls")
    .attr("transform", `translate(${containerWidth - 80}, 10)`);

  // Reset zoom button
  controls
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 70)
    .attr("height", 25)
    .attr("rx", 4)
    .style("fill", "rgba(0,0,0,0.7)")
    .style("cursor", "pointer")
    .on("click", () => {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    });

  controls
    .append("text")
    .attr("x", 35)
    .attr("y", 17)
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "11px")
    .style("font-weight", "500")
    .style("pointer-events", "none")
    .text("Reset Zoom");

  // Add zoom instructions (subtle hint)
  const instructions = svg
    .append("g")
    .attr("class", "zoom-instructions")
    .attr("transform", `translate(10, ${containerHeight - 20})`);

  instructions
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .style("fill", "currentColor")
    .style("font-size", "10px")
    .style("opacity", "0.6")
    .style("pointer-events", "none")
    .text("💡 Scroll to zoom, drag to pan");

  // Create main group that will be zoomed/panned
  const zoomGroup = svg.append("g").attr("class", "zoom-group");

  const g = zoomGroup
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales - cells will automatically scale to fill available space
  const xScale = d3.scaleBand().domain(xLabels).range([0, width]).padding(0.1);

  const yScale = d3.scaleBand().domain(yLabels).range([0, height]).padding(0.1);

  // Create custom brand color interpolator
  const brandColorInterpolator = (t: number) => {
    // Create a smooth gradient from dark to bright using brand colors
    if (t < 0.25) {
      return d3.interpolate(
        BRAND_COLORS.luckyPoint,
        BRAND_COLORS.royalBlue
      )(t * 4);
    } else if (t < 0.5) {
      return d3.interpolate(
        BRAND_COLORS.royalBlue,
        BRAND_COLORS.mediumPurple
      )((t - 0.25) * 4);
    } else if (t < 0.75) {
      return d3.interpolate(
        BRAND_COLORS.mediumPurple,
        BRAND_COLORS.malibu
      )((t - 0.5) * 4);
    } else {
      return d3.interpolate(
        BRAND_COLORS.malibu,
        BRAND_COLORS.cyan
      )((t - 0.75) * 4);
    }
  };

  // Filter out null values for color scale domain
  const validValues = values.filter((v) => v !== null && v !== undefined);
  const colorScale = d3
    .scaleSequential()
    .interpolator(brandColorInterpolator)
    .domain(d3.extent(validValues) as [number, number]);

  // Create heatmap cells
  g.selectAll(".cell")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => xScale(d.x) || 0)
    .attr("y", (d) => yScale(d.y) || 0)
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .style("fill", (d) => {
      // Handle null values with a neutral gray color
      if (d.value === null || d.value === undefined) {
        return "#e0e0e0";
      }
      return colorScale(d.value);
    })
    .style("stroke", "#fff")
    .style("stroke-width", 1)
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      // Tooltip logic
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "heatmap-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000");

      const valueText =
        d.value === null || d.value === undefined ? "N/A" : d.value.toFixed(1);

      tooltip
        .html(`${d.x} × ${d.y}<br/>Value: ${valueText}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", function () {
      d3.selectAll(".heatmap-tooltip").remove();
    });

  // Add text labels to show values in cells
  g.selectAll(".cell-text")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "cell-text")
    .attr("x", (d) => (xScale(d.x) || 0) + xScale.bandwidth() / 2)
    .attr("y", (d) => (yScale(d.y) || 0) + yScale.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .style("font-size", "12px")
    .style("font-weight", "600")
    .style("fill", (d) => {
      // Use white text for dark colors, dark text for light colors
      if (d.value === null || d.value === undefined) {
        return "#000000"; // Dark text for null cells
      }
      const color = d3.color(colorScale(d.value));
      if (color) {
        const hsl = d3.hsl(color);
        return hsl.l < 0.5 ? "#ffffff" : "#000000";
      }
      return "#000000";
    })
    .style("pointer-events", "none") // Don't interfere with cell hover
    .text((d) => {
      // Handle null/undefined values
      if (d.value === null || d.value === undefined) {
        return "N/A";
      }

      if (valueFormatter) {
        return valueFormatter(d.value);
      }

      return d.value.toFixed(1);
    });

  // X axis labels (with word wrapping for long labels)
  g.selectAll(".x-label-group")
    .data(xLabels)
    .enter()
    .append("g")
    .attr("class", "x-label-group")
    .each(function (d) {
      const group = d3.select(this);
      const xPos = (xScale(d) || 0) + xScale.bandwidth() / 2;
      const lineHeight = 12; // Approximate line height for 12px font

      // Split long labels into multiple lines
      // Use a simple heuristic: if label is longer than 12 characters, try to split
      let lines: string[] = [];
      if (d.length > 12) {
        // Try to split on spaces first
        const words = d.split(" ");
        if (words.length > 1) {
          // Group words to make reasonable line lengths
          let currentLine = "";
          words.forEach((word, index) => {
            if (currentLine.length === 0) {
              currentLine = word;
            } else if ((currentLine + " " + word).length <= 12) {
              currentLine += " " + word;
            } else {
              lines.push(currentLine);
              currentLine = word;
            }

            // Add the last line
            if (index === words.length - 1) {
              lines.push(currentLine);
            }
          });
        } else {
          // No spaces, try to split at reasonable points
          const halfLength = Math.ceil(d.length / 2);
          lines = [d.substring(0, halfLength), d.substring(halfLength)];
        }
      } else {
        lines = [d];
      }

      // Calculate starting y position to center the text block
      const totalHeight = lines.length * lineHeight;
      const startY = height + 20 - totalHeight / 2 + lineHeight / 2;

      lines.forEach((line, index) => {
        group
          .append("text")
          .attr("class", "x-label")
          .attr("x", xPos)
          .attr("y", startY + index * lineHeight)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "12px")
          .style("fill", "currentColor")
          .text(line);
      });
    });

  // Y axis labels (with word wrapping - one word per line)
  g.selectAll(".y-label-group")
    .data(yLabels)
    .enter()
    .append("g")
    .attr("class", "y-label-group")
    .each(function (d) {
      const group = d3.select(this);
      const words = d.split(" ");
      const yPos = (yScale(d) || 0) + yScale.bandwidth() / 2;
      const lineHeight = 12; // Approximate line height for 12px font

      // Calculate starting y position to center the text block
      const totalHeight = words.length * lineHeight;
      const startY = yPos - totalHeight / 2 + lineHeight / 2;

      words.forEach((word, index) => {
        group
          .append("text")
          .attr("class", "y-label")
          .attr("x", -10)
          .attr("y", startY + index * lineHeight)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .style("font-size", "12px")
          .style("fill", "currentColor")
          .text(word);
      });
    });
}
