import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tuition Fees Calculator",
  description: "Calculate your tuition fees based on UIU's official fee structure for undergraduate and graduate programs.",
};

export default function TuitionFeesCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
