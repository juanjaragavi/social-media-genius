"use client";

/**
 * ViewToggle — Grid / List view mode switch
 *
 * Persists preference to localStorage under the key "dashboard-view-mode".
 * Consumed by all content sections in the dashboard.
 */

import React, { useState, useCallback, createContext, useContext } from "react";
import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

const STORAGE_KEY = "dashboard-view-mode";

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextValue>({
  viewMode: "grid",
  setViewMode: () => {},
});

export function useViewMode() {
  return useContext(ViewModeContext);
}

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // Lazy initializer — reads localStorage synchronously on first render
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "list" || stored === "grid") return stored;
      } catch {
        // localStorage not available
      }
    }
    return "grid";
  });

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage not available
    }
  }, []);

  // Avoid hydration mismatch — this is a 'use client' component so SSR
  // uses the lazy initializer fallback ("grid") which matches the default.
  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

/** Toggle buttons for grid / list view */
export function ViewToggle() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setViewMode("grid")}
        className={`p-1.5 transition-colors cursor-pointer ${
          viewMode === "grid"
            ? "bg-blue-50 text-blue-600"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        }`}
        title="Vista de cuadrícula"
        aria-label="Vista de cuadrícula"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <div className="w-px h-5 bg-gray-200" />
      <button
        onClick={() => setViewMode("list")}
        className={`p-1.5 transition-colors cursor-pointer ${
          viewMode === "list"
            ? "bg-blue-50 text-blue-600"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        }`}
        title="Vista de lista"
        aria-label="Vista de lista"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
