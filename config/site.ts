export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "UIU Hub",
  description: "A comprehensive tool hub for United International University students.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Tools",
      href: "/tools",
    },
    {
      label: "CGPA Calculator",
      href: "/tools/cgpa-calculator",
    },
    {
      label: "Section Planner",
      href: "/tools/routine-planner",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Tools",
      href: "/tools",
    },
    {
      label: "CGPA Calculator",
      href: "/tools/cgpa-calculator",
    },
    {
      label: "Section Planner",
      href: "/tools/routine-planner",
    },
  ],
  links: {
    github: "https://github.com",
    uiu: "https://www.uiu.ac.bd",
  },
};
