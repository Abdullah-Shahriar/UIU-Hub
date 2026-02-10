"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Card, CardBody, CardHeader } from "@heroui/card";

import { UIU_GRADES } from "@/lib/grading";

function getAssessmentColor(assessment: string) {
  switch (assessment) {
    case "Outstanding":
      return "success";
    case "Excellent":
      return "success";
    case "Very Good":
      return "primary";
    case "Good":
      return "primary";
    case "Above Average":
      return "secondary";
    case "Average":
      return "warning";
    case "Below Average":
      return "warning";
    case "Poor":
      return "danger";
    case "Very Poor":
      return "danger";
    case "Pass":
      return "default";
    case "Fail":
      return "danger";
    default:
      return "default";
  }
}

export const GradingTable = () => {
  return (
    <Card className="w-full">
      <CardHeader className="px-6 pt-5">
        <div>
          <h3 className="text-lg font-semibold">UIU Grading Policy</h3>
          <p className="text-sm text-default-400 mt-1">
            Official grading system of United International University
          </p>
        </div>
      </CardHeader>
      <CardBody className="px-3 sm:px-6 py-4 overflow-x-auto">
        <Table
          aria-label="UIU Grading Policy Table"
          removeWrapper
          classNames={{
            th: "bg-default-100 text-default-600 text-xs uppercase",
          }}
        >
          <TableHeader>
            <TableColumn>Letter Grade</TableColumn>
            <TableColumn>Grade Point</TableColumn>
            <TableColumn>Marks (%)</TableColumn>
            <TableColumn>Assessment</TableColumn>
          </TableHeader>
          <TableBody>
            {UIU_GRADES.map((grade) => (
              <TableRow key={grade.letterGrade}>
                <TableCell>
                  <span className="font-semibold">{grade.letterGrade}</span>
                </TableCell>
                <TableCell>{grade.gradePoint.toFixed(2)}</TableCell>
                <TableCell>{grade.marksRange}</TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={getAssessmentColor(grade.assessment) as "success" | "primary" | "secondary" | "warning" | "danger" | "default"}
                    variant="flat"
                  >
                    {grade.assessment}
                  </Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};
