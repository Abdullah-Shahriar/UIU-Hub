"use client";

import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";

interface ResultCardProps {
  label: string;
  gpa: number;
  totalCredits: number;
  totalPoints: number;
  isMain?: boolean;
  highlighted?: boolean;
}

function getGPAColor(gpa: number): "success" | "primary" | "warning" | "danger" | "default" {
  if (gpa >= 3.50) return "success";
  if (gpa >= 3.00) return "primary";
  if (gpa >= 2.00) return "warning";
  if (gpa > 0) return "danger";
  return "default";
}

function getGPALabel(gpa: number): string {
  if (gpa >= 3.90) return "Outstanding";
  if (gpa >= 3.50) return "Excellent";
  if (gpa >= 3.00) return "Very Good";
  if (gpa >= 2.50) return "Good";
  if (gpa >= 2.00) return "Average";
  if (gpa > 0) return "Needs Improvement";
  return "—";
}

export const ResultCard = ({
  label,
  gpa,
  totalCredits,
  totalPoints,
  isMain = false,
  highlighted = false,
}: ResultCardProps) => {
  const color = getGPAColor(gpa);
  const gpaLabel = getGPALabel(gpa);

  return (
    <Card
      className={`w-full transition-all duration-500 ${
        isMain ? "border-2 border-primary/30 bg-primary/5" : ""
      } ${
        highlighted
          ? "ring-3 ring-primary shadow-lg shadow-primary/20 scale-[1.01]"
          : ""
      }`}
    >
      <CardBody className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-default-400 font-medium">{label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-3xl sm:text-4xl font-bold transition-all duration-500 ${
                  isMain ? "text-primary" : ""
                } ${highlighted ? "sm:text-5xl text-4xl" : ""}`}
              >
                {gpa > 0 ? gpa.toFixed(2) : "0.00"}
              </span>
              <span className="text-default-400 text-sm">/ 4.00</span>
            </div>
            <p className={`text-sm mt-1 font-medium text-${color}`}>
              {gpaLabel}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-64">
            <Progress
              aria-label="GPA Progress"
              value={(gpa / 4.0) * 100}
              color={color}
              className="w-full"
              size="md"
            />
            <div className="flex justify-between text-xs text-default-400">
              <span>Total Credits: <strong className="text-foreground">{totalCredits}</strong></span>
              <span>Quality Points: <strong className="text-foreground">{totalPoints}</strong></span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
