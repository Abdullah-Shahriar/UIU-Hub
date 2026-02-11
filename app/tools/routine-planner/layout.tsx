import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Section Selector - UIU Hub",
  description: "Select course sections from UIU class routine PDFs with intelligent scheduling and conflict detection.",
};

export default function SectionSelectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
