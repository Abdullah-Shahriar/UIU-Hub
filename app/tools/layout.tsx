import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools",
  description: "Browse all available tools for UIU students.",
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
