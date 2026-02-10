import { GradeInfo } from "@/types";

export const UIU_GRADES: GradeInfo[] = [
  { letterGrade: "A",  gradePoint: 4.00, marksRange: "90 – 100", assessment: "Outstanding" },
  { letterGrade: "A-", gradePoint: 3.67, marksRange: "86 – 89",  assessment: "Excellent" },
  { letterGrade: "B+", gradePoint: 3.33, marksRange: "82 – 85",  assessment: "Very Good" },
  { letterGrade: "B",  gradePoint: 3.00, marksRange: "78 – 81",  assessment: "Good" },
  { letterGrade: "B-", gradePoint: 2.67, marksRange: "74 – 77",  assessment: "Above Average" },
  { letterGrade: "C+", gradePoint: 2.33, marksRange: "70 – 73",  assessment: "Average" },
  { letterGrade: "C",  gradePoint: 2.00, marksRange: "66 – 69",  assessment: "Below Average" },
  { letterGrade: "C-", gradePoint: 1.67, marksRange: "62 – 65",  assessment: "Poor" },
  { letterGrade: "D+", gradePoint: 1.33, marksRange: "58 – 61",  assessment: "Very Poor" },
  { letterGrade: "D",  gradePoint: 1.00, marksRange: "55 – 57",  assessment: "Pass" },
  { letterGrade: "F",  gradePoint: 0.00, marksRange: "0 – 54",   assessment: "Fail" },
];

export const GRADE_OPTIONS = UIU_GRADES.map((g) => ({
  label: `${g.letterGrade} (${g.gradePoint.toFixed(2)})`,
  value: g.letterGrade,
}));

export const CREDIT_OPTIONS = [1.0, 2.0, 3.0];

export function getGradePoint(letterGrade: string): number {
  const grade = UIU_GRADES.find((g) => g.letterGrade === letterGrade);
  return grade ? grade.gradePoint : 0;
}

export function calculateGPA(
  courses: { credit: number; grade: string }[]
): { gpa: number; totalCredits: number; totalPoints: number } {
  const validCourses = courses.filter((c) => c.credit > 0 && c.grade !== "");

  if (validCourses.length === 0) {
    return { gpa: 0, totalCredits: 0, totalPoints: 0 };
  }

  const totalCredits = validCourses.reduce((sum, c) => sum + c.credit, 0);
  const totalPoints = validCourses.reduce(
    (sum, c) => sum + c.credit * getGradePoint(c.grade),
    0
  );

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    gpa: Math.round(gpa * 100) / 100,
    totalCredits,
    totalPoints: Math.round(totalPoints * 100) / 100,
  };
}

export function calculateCGPA(
  trimesters: { courses: { credit: number; grade: string }[] }[],
  previousCredits: number = 0,
  previousCGPA: number = 0
): { cgpa: number; totalCredits: number; totalPoints: number } {
  const allCourses = trimesters.flatMap((t) => t.courses);
  const currentResult = calculateGPA(allCourses);

  const prevPoints = previousCredits * previousCGPA;
  const combinedCredits = currentResult.totalCredits + previousCredits;
  const combinedPoints = currentResult.totalPoints + prevPoints;

  const cgpa = combinedCredits > 0 ? combinedPoints / combinedCredits : 0;

  return {
    cgpa: Math.round(cgpa * 100) / 100,
    totalCredits: combinedCredits,
    totalPoints: Math.round(combinedPoints * 100) / 100,
  };
}
