"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { LuPlus, LuTrash2, LuRefreshCw, LuCalculator } from "react-icons/lu";

import { Course, Trimester } from "@/types";
import { calculateGPA, calculateCGPA } from "@/lib/grading";
import { CourseRow } from "@/components/cgpa/course-row";
import { GradingTable } from "@/components/cgpa/grading-table";
import { ResultCard } from "@/components/cgpa/result-card";
import { GPAChart } from "@/components/cgpa/gpa-chart";

function createEmptyCourse(): Course {
  return {
    id: crypto.randomUUID(),
    name: "",
    credit: 3.0,
    grade: "",
  };
}

function createEmptyTrimester(index: number): Trimester {
  return {
    id: crypto.randomUUID(),
    name: `Trimester ${index}`,
    courses: [createEmptyCourse(), createEmptyCourse(), createEmptyCourse(), createEmptyCourse()],
  };
}

export default function CGPACalculatorPage() {
  const [trimesters, setTrimesters] = useState<Trimester[]>([
    createEmptyTrimester(1),
  ]);
  const [showGradingTable, setShowGradingTable] = useState(false);
  const [previousCredits, setPreviousCredits] = useState<string>("");
  const [previousCGPA, setPreviousCGPA] = useState<string>("");
  const [highlighted, setHighlighted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Add a new trimester
  const addTrimester = useCallback(() => {
    setTrimesters((prev) => [
      ...prev,
      createEmptyTrimester(prev.length + 1),
    ]);
  }, []);

  // Remove a trimester
  const removeTrimester = useCallback((trimesterId: string) => {
    setTrimesters((prev) => prev.filter((t) => t.id !== trimesterId));
  }, []);

  // Add a course to a trimester
  const addCourse = useCallback((trimesterId: string) => {
    setTrimesters((prev) =>
      prev.map((t) =>
        t.id === trimesterId
          ? { ...t, courses: [...t.courses, createEmptyCourse()] }
          : t
      )
    );
  }, []);

  // Remove a course from a trimester
  const removeCourse = useCallback((trimesterId: string, courseId: string) => {
    setTrimesters((prev) =>
      prev.map((t) =>
        t.id === trimesterId
          ? { ...t, courses: t.courses.filter((c) => c.id !== courseId) }
          : t
      )
    );
  }, []);

  // Update a course
  const updateCourse = useCallback(
    (trimesterId: string, courseId: string, field: keyof Course, value: string | number) => {
      setTrimesters((prev) =>
        prev.map((t) =>
          t.id === trimesterId
            ? {
                ...t,
                courses: t.courses.map((c) =>
                  c.id === courseId ? { ...c, [field]: value } : c
                ),
              }
            : t
        )
      );
    },
    []
  );

  // Update trimester name
  const updateTrimesterName = useCallback((trimesterId: string, name: string) => {
    setTrimesters((prev) =>
      prev.map((t) => (t.id === trimesterId ? { ...t, name } : t))
    );
  }, []);

  // Reset everything
  const resetAll = useCallback(() => {
    setTrimesters([createEmptyTrimester(1)]);
    setPreviousCredits("");
    setPreviousCGPA("");
    setHighlighted(false);
  }, []);

  // Calculate and highlight
  const handleCalculate = useCallback(() => {
    setHighlighted(true);
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlighted(false), 2500);
  }, []);

  // Calculate results
  const trimesterResults = trimesters.map((t) => ({
    ...t,
    result: calculateGPA(t.courses),
  }));

  const cgpaResult = calculateCGPA(
    trimesters,
    parseFloat(previousCredits) || 0,
    parseFloat(previousCGPA) || 0
  );

  // Build chart data — running CGPA across trimesters
  const chartData = (() => {
    const prevCr = parseFloat(previousCredits) || 0;
    const prevCG = parseFloat(previousCGPA) || 0;
    let runningCredits = prevCr;
    let runningPoints = prevCr * prevCG;

    return trimesterResults.map((t) => {
      runningCredits += t.result.totalCredits;
      runningPoints += t.result.totalPoints;
      const cumulativeCGPA = runningCredits > 0 ? runningPoints / runningCredits : 0;
      return {
        name: t.name,
        gpa: Math.round(t.result.gpa * 100) / 100,
        cgpa: Math.round(cumulativeCGPA * 100) / 100,
      };
    });
  })();

  return (
    <section className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">CGPA Calculator</h1>
            <p className="text-default-500 text-sm sm:text-base mt-1">
              Calculate your GPA & CGPA based on UIU&apos;s official grading policy
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="flat"
              color="secondary"
              startContent={<LuRefreshCw size={16} />}
              onPress={resetAll}
              size="sm"
            >
              Reset
            </Button>
            <Button
              variant="flat"
              color="primary"
              size="sm"
              onPress={() => setShowGradingTable(!showGradingTable)}
            >
              {showGradingTable ? "Hide" : "Show"} Grading Policy
            </Button>
          </div>
        </div>
      </div>

      {/* Grading Table */}
      {showGradingTable && <GradingTable />}

      {/* CGPA Result */}
      <div ref={resultRef}>
        {trimesters.length > 0 && (
          <ResultCard
            label="Cumulative CGPA"
            gpa={cgpaResult.cgpa}
            totalCredits={cgpaResult.totalCredits}
            totalPoints={cgpaResult.totalPoints}
            isMain
            highlighted={highlighted}
          />
        )}
      </div>

      {/* Previous Academic Record */}
      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="text-lg sm:text-xl font-semibold">Previous Academic Record</p>
            <Chip size="sm" variant="flat" color="default">Optional</Chip>
          </div>
        </CardHeader>
        <Divider className="mt-3 sm:mt-4" />
        <CardBody className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="number"
              variant="bordered"
              label="Completed Credits"
              placeholder="e.g. 90"
              size="lg"
              value={previousCredits}
              onChange={(e) => setPreviousCredits(e.target.value)}
              min={0}
              step={1}
              classNames={{
                inputWrapper: "border-default-300 dark:border-default-200",
              }}
            />
            <Input
              type="number"
              variant="bordered"
              label="Previous CGPA"
              placeholder="e.g. 3.45"
              size="lg"
              value={previousCGPA}
              onChange={(e) => setPreviousCGPA(e.target.value)}
              min={0}
              max={4}
              step={0.01}
              classNames={{
                inputWrapper: "border-default-300 dark:border-default-200",
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Trimesters */}
      {trimesterResults.map((trimester, index) => (
        <Card key={trimester.id} className="w-full">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <input
                type="text"
                value={trimester.name}
                onChange={(e) => updateTrimesterName(trimester.id, e.target.value)}
                className="text-lg sm:text-xl font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary rounded px-1 -ml-1 max-w-[200px] sm:max-w-none"
                style={{ width: `${Math.max(trimester.name.length, 10)}ch` }}
              />
              {trimester.result.gpa > 0 && (
                <Chip
                  color={
                    trimester.result.gpa >= 3.5
                      ? "success"
                      : trimester.result.gpa >= 3.0
                        ? "primary"
                        : trimester.result.gpa >= 2.0
                          ? "warning"
                          : "danger"
                  }
                  variant="flat"
                  size="sm"
                >
                  GPA: {trimester.result.gpa.toFixed(2)}
                </Chip>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<LuPlus size={14} />}
                onPress={() => addCourse(trimester.id)}
              >
                Add Course
              </Button>
              {trimesters.length > 1 && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  startContent={<LuTrash2 size={14} />}
                  onPress={() => removeTrimester(trimester.id)}
                >
                  Remove
                </Button>
              )}
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="px-4 sm:px-6 py-3 sm:py-4">
            {/* Table Header — matches CourseRow grid */}
            <div className="hidden sm:grid grid-cols-[40px_1fr_110px_140px_40px] gap-2 mb-3">
              <div className="flex items-center justify-center text-xs font-medium text-default-400">#</div>
              <div className="text-xs font-medium text-default-400">Course Name</div>
              <div className="text-xs font-medium text-default-400">Credit</div>
              <div className="text-xs font-medium text-default-400">Grade</div>
              <div></div>
            </div>

            {/* Course Rows */}
            <div className="flex flex-col gap-2">
              {trimester.courses.map((course, courseIndex) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  index={courseIndex + 1}
                  onUpdate={(field, value) =>
                    updateCourse(trimester.id, course.id, field, value)
                  }
                  onRemove={() => removeCourse(trimester.id, course.id)}
                  canRemove={trimester.courses.length > 1}
                />
              ))}
            </div>

            {/* Trimester Summary */}
            {trimester.result.totalCredits > 0 && (
              <>
                <Divider className="my-4" />
                <div className="flex flex-wrap gap-6 justify-end text-sm">
                  <div>
                    <span className="text-default-400">Credits: </span>
                    <span className="font-semibold">{trimester.result.totalCredits}</span>
                  </div>
                  <div>
                    <span className="text-default-400">Quality Points: </span>
                    <span className="font-semibold">{trimester.result.totalPoints}</span>
                  </div>
                  <div>
                    <span className="text-default-400">GPA: </span>
                    <span className="font-bold text-primary text-base">
                      {trimester.result.gpa.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Button
          variant="bordered"
          color="primary"
          startContent={<LuPlus size={18} />}
          onPress={addTrimester}
          size="lg"
        >
          Add Trimester
        </Button>
        <Button
          color="primary"
          startContent={<LuCalculator size={18} />}
          onPress={handleCalculate}
          size="lg"
          className="font-semibold"
        >
          Calculate CGPA
        </Button>
      </div>

      {/* GPA Trend Chart */}
      <GPAChart data={chartData} />

      {/* Formula Explanation */}
      <Card className="w-full">
        <CardBody className="px-4 sm:px-6 py-4 sm:py-5">
          <h3 className="font-semibold text-base sm:text-lg mb-3">How GPA & CGPA is Calculated</h3>
          <div className="text-default-500 text-sm space-y-2">
            <p>
              <strong>GPA</strong> (Grade Point Average) is the weighted average grade of a single trimester.
            </p>
            <p>
              <strong>CGPA</strong> (Cumulative Grade Point Average) is the weighted average of grade points
              obtained in all courses completed by a student along with the last trimester.
            </p>
            <div className="bg-default-100 rounded-lg p-4 mt-3 font-mono text-center">
              <p>GPA = Σ(Cᵢ × Gᵢ) / Σ(Cᵢ)</p>
              <p className="text-xs mt-2 text-default-400">
                Where Cᵢ = Credit hours of course i, Gᵢ = Grade point of course i
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
