"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

interface ThemeContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, setTheme } = useAppStore();

  useEffect(() => {
    // Load theme from localStorage on initial render
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("ql_theme") as "dark" | "light" | null;
      if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
        setTheme(savedTheme);
      }
    }
  }, [setTheme]);

  useEffect(() => {
    // Sync theme class with <html> and <body>
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "dark" : "light"}>{children}</div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
