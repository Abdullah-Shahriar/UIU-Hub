import { LuCalculator, LuCalendar, LuBookOpen, LuClipboardList } from "react-icons/lu";
import { ToolCard } from "@/components/tool-card";

export default function ToolsPage() {
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
    <section className="flex flex-col items-center gap-6 sm:gap-8 py-6 sm:py-8 md:py-12">
      <div className="text-center max-w-2xl px-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">All Tools</h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-default-500">
          Browse all available tools built for UIU students
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl">
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </section>
  );
}
