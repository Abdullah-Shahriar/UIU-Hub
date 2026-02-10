export interface GradeInfo {
  letterGrade: string;
  gradePoint: number;
  marksRange: string;
  assessment: string;
}

export interface Course {
  id: string;
  name: string;
  credit: number;
  grade: string;
}

export interface Trimester {
  id: string;
  name: string;
  courses: Course[];
}

export interface CGPAResult {
  gpa: number;
  totalCredits: number;
  totalPoints: number;
}
