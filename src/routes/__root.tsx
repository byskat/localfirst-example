import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type * as React from "react";
import { useEffect } from "react";

import "../styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: `utf-8`,
      },
      {
        name: `viewport`,
        content: `width=device-width, initial-scale=1`,
      },
      {
        title: `TanStack Start/DB/Electric Starter`,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize theme from localStorage on mount
    const theme = localStorage.getItem("theme") || "system";
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Determine effective theme
    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    // Apply theme
    root.classList.add(effectiveTheme);
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
