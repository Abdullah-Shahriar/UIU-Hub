import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-8 sm:pt-16 px-4 sm:px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-4 sm:py-6 px-4 border-t border-divider">
              <p className="text-default-500 text-xs sm:text-sm text-center">
                © {new Date().getFullYear()}{" "}
                <span className="text-primary font-semibold">UIU Hub</span> — Built for{" "}
                <a
                  href="https://www.uiu.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  United International University
                </a>{" "}
                students
              </p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
