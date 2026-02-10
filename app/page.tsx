import { LuCalculator, LuCalendar, LuBookOpen, LuClipboardList } from "react-icons/lu";
import { ToolCard } from "@/components/tool-card";

export default function Home() {
  const tools = [
    {
      title: "CGPA Calculator",
      description:
        "Calculate your GPA and CGPA based on UIU's official grading policy. Supports multiple trimesters with detailed breakdown.",
      href: "/tools/cgpa-calculator",
      icon: <LuCalculator size={24} />,
      status: "available" as const,
    },
    {
      title: "Routine Planner",
      description:
        "Plan and organize your class routine for the trimester. Avoid scheduling conflicts easily.",
      href: "/tools/routine-planner",
      icon: <LuCalendar size={24} />,
      status: "coming-soon" as const,
    },
    {
      title: "Course Tracker",
      description:
        "Track your completed courses, remaining credits, and degree progress at a glance.",
      href: "/tools/course-tracker",
      icon: <LuBookOpen size={24} />,
      status: "coming-soon" as const,
    },
    {
      title: "Grade Sheet",
      description:
        "View and export a detailed grade sheet with all your trimester results.",
      href: "/tools/grade-sheet",
      icon: <LuClipboardList size={24} />,
      status: "coming-soon" as const,
    },
  ];

  return (
    <section className="flex flex-col items-center gap-8 py-8 md:py-12">
      {/* Hero Section */}
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Welcome to{" "}
          <span className="text-primary">UIU Hub</span>
        </h1>
        <p className="mt-4 text-lg text-default-500">
          Your all-in-one toolkit for United International University.
          Tools designed to make student life easier.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl mt-4">
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </section>
  );
}
