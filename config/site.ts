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
  ],
  links: {
    github: "https://github.com",
    uiu: "https://www.uiu.ac.bd",
  },
};
