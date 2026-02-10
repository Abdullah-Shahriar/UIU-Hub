"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Tooltip as HeroTooltip } from "@heroui/tooltip";
import { LuPlus, LuMinus, LuRotateCcw } from "react-icons/lu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

interface GPAChartProps {
  data: {
    name: string;
    gpa: number;
    cgpa: number;
  }[];
}

const POINT_SPACING = 140; // px per data point
const CHART_PADDING = 120; // left + right margins
const MIN_CHART_WIDTH = 260;
const CHART_HEIGHT = 300;
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.5;

export const GPAChart = ({ data }: GPAChartProps) => {
  const validData = data.filter((d) => d.gpa > 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset zoom when data changes
  useEffect(() => {
    setZoomLevel(1);
  }, [validData.length]);

  // Mouse wheel zoom handler
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoomLevel((prev) => {
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta));
    });
  }, []);

  useEffect(() => {
    const el = chartAreaRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const zoomIn = () => setZoomLevel((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const zoomOut = () => setZoomLevel((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  const resetZoom = () => setZoomLevel(1);

  // Compute the natural (1x zoom) Y domain from data
  const baseDomain = useMemo(() => {
    if (validData.length === 0) return [0, 4] as [number, number];

    const allValues = validData.flatMap((d) => [d.gpa, d.cgpa]);
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal;

    const padding = Math.max(range * 0.5, 0.3);
    const lo = Math.max(0, Math.floor((minVal - padding) * 10) / 10);
    const hi = Math.min(4, Math.ceil((maxVal + padding) * 10) / 10);

    return [lo, hi] as [number, number];
  }, [validData]);

  // Apply zoom: shrink domain around center
  const yDomain = useMemo(() => {
    const [lo, hi] = baseDomain;
    const center = (lo + hi) / 2;
    const halfRange = (hi - lo) / 2 / zoomLevel;
    return [
      Math.max(0, Math.round((center - halfRange) * 100) / 100),
      Math.min(4, Math.round((center + halfRange) * 100) / 100),
    ];
  }, [baseDomain, zoomLevel]);

  if (validData.length === 0) {
    return (
      <Card className="w-full">
        <CardBody className="px-3 sm:px-6 py-8 sm:py-10 text-center">
          <p className="text-default-400 text-sm">
            Enter grades in your trimesters to see the GPA trend chart
          </p>
        </CardBody>
      </Card>
    );
  }

  // Calculate proportional chart width
  const naturalWidth =
    validData.length === 1
      ? MIN_CHART_WIDTH
      : (validData.length - 1) * POINT_SPACING + CHART_PADDING;

  const chartWidth = containerWidth > 0
    ? Math.min(naturalWidth, containerWidth)
    : naturalWidth;

  return (
    <Card className="w-full">
      <CardBody className="px-2 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4 px-1 sm:px-0">
          <Chip color="success" variant="flat" size="sm" className="font-semibold">
            Result Summary
          </Chip>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <HeroTooltip content="Zoom Out" size="sm">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={zoomOut}
                isDisabled={zoomLevel <= MIN_ZOOM}
                className="min-w-7 h-7 w-7"
              >
                <LuMinus size={14} />
              </Button>
            </HeroTooltip>
            <span className="text-xs font-medium text-default-500 w-10 text-center tabular-nums">
              {zoomLevel.toFixed(1)}x
            </span>
            <HeroTooltip content="Zoom In" size="sm">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={zoomIn}
                isDisabled={zoomLevel >= MAX_ZOOM}
                className="min-w-7 h-7 w-7"
              >
                <LuPlus size={14} />
              </Button>
            </HeroTooltip>
            {zoomLevel !== 1 && (
              <HeroTooltip content="Reset Zoom" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={resetZoom}
                  className="min-w-7 h-7 w-7 ml-1"
                >
                  <LuRotateCcw size={13} />
                </Button>
              </HeroTooltip>
            )}
          </div>
        </div>

        <p className="hidden sm:block text-[11px] text-default-400 mb-2 text-center">
          Scroll over chart to zoom
        </p>

        <div ref={containerRef} className="w-full flex justify-center overflow-x-auto">
          <div ref={chartAreaRef} className="cursor-ns-resize">
            <LineChart
              width={chartWidth}
              height={CHART_HEIGHT}
              data={validData}
              margin={{ top: 30, right: 30, left: 30, bottom: 10 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(var(--heroui-default-500))" }}
                tickLine={false}
                axisLine={false}
                interval={0}
                padding={{ left: 30, right: 30 }}
                dy={10}
              />
              <YAxis
                domain={yDomain}
                hide={true}
                allowDataOverflow={true}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--heroui-content1))",
                  borderColor: "hsl(var(--heroui-default-200))",
                  borderRadius: "10px",
                  fontSize: "13px",
                  boxShadow: "0 4px 14px 0 rgba(0,0,0,0.1)",
                  padding: "8px 12px",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  Number(value ?? 0).toFixed(2),
                  name === "cgpa" ? "CGPA" : "GPA",
                ]}
              />
              <Legend
                formatter={(value: string) =>
                  value === "cgpa" ? "CGPA" : "GPA"
                }
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "13px",
                  paddingTop: "16px",
                  color: "hsl(var(--heroui-default-600))",
                }}
              />

              {/* CGPA line — primary color */}
              <Line
                type="linear"
                dataKey="cgpa"
                stroke="hsl(var(--heroui-primary))"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "hsl(var(--heroui-primary))", strokeWidth: 0 }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: "hsl(var(--heroui-background))" }}
                name="cgpa"
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="cgpa"
                  position="top"
                  offset={14}
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    fill: "hsl(var(--heroui-primary))",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => Number(v).toFixed(2)}
                />
              </Line>

              {/* GPA line — foreground color */}
              <Line
                type="linear"
                dataKey="gpa"
                stroke="hsl(var(--heroui-default-700))"
                strokeWidth={2.5}
                dot={{
                  r: 5,
                  fill: "hsl(var(--heroui-default-700))",
                  strokeWidth: 0,
                }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: "hsl(var(--heroui-background))" }}
                name="gpa"
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="gpa"
                  position="bottom"
                  offset={14}
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    fill: "hsl(var(--heroui-default-600))",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => Number(v).toFixed(2)}
                />
              </Line>
            </LineChart>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
