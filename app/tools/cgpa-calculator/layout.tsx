import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGPA Calculator",
  description: "Calculate your GPA and CGPA based on UIU's official grading policy.",
};

export default function CGPACalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
