"use client";

/**
 * SearchFilters — Search, sort, and filter controls for posts
 *
 * Renders filter state as URL query parameters so filtered views
 * are shareable and bookmarkable.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import {
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
  TiktokIcon,
  LinkedinIcon,
} from "@/components/ui/platform-icons";
import type { Project } from "@/types/persistence";

interface SearchFiltersProps {
  projects: Project[];
  /** When true, show the project filter dropdown */
  showProjectFilter?: boolean;
}

const PLATFORMS = [
  {
    value: "instagram",
    label: "Instagram",
    icon: <InstagramIcon className="h-3.5 w-3.5" />,
  },
  {
    value: "twitter",
    label: "X",
    icon: <TwitterIcon className="h-3.5 w-3.5" />,
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: <FacebookIcon className="h-3.5 w-3.5" />,
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: <TiktokIcon className="h-3.5 w-3.5" />,
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: <LinkedinIcon className="h-3.5 w-3.5" />,
  },
];

const ASPECT_RATIOS = ["1:1", "4:5", "9:16", "16:9", "1.91:1"];

const SORT_OPTIONS = [
  { value: "updated_at", label: "Última modificación" },
  { value: "created_at", label: "Fecha de creación" },
  { value: "title", label: "Título (A-Z)" },
];

export function SearchFilters({
  projects,
  showProjectFilter = true,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [showFilters, setShowFilters] = useState(false);

  // Read current filter state from URL
  const currentPlatform = searchParams.get("platform") || "";
  const currentAspectRatio = searchParams.get("aspect_ratio") || "";
  const currentSort = searchParams.get("sort") || "updated_at";
  const currentProjectId = searchParams.get("project_id") || "";

  const activeFilterCount =
    (currentPlatform ? 1 : 0) +
    (currentAspectRatio ? 1 : 0) +
    (currentProjectId ? 1 : 0);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ search: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, updateParams]);

  const clearAllFilters = () => {
    setSearchInput("");
    router.push("?", { scroll: false });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar publicaciones..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <select
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg py-2 px-2 pr-7 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors cursor-pointer ${
            showFilters || activeFilterCount > 0
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          {/* Platform filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              Plataforma
            </label>
            <div className="flex items-center gap-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() =>
                    updateParams({
                      platform: currentPlatform === p.value ? "" : p.value,
                    })
                  }
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                    currentPlatform === p.value
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect ratio filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              Relación de aspecto
            </label>
            <div className="flex items-center gap-1">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar}
                  onClick={() =>
                    updateParams({
                      aspect_ratio: currentAspectRatio === ar ? "" : ar,
                    })
                  }
                  className={`px-2 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                    currentAspectRatio === ar
                      ? "bg-cyan-100 border-cyan-300 text-cyan-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          {/* Project filter */}
          {showProjectFilter && projects.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Proyecto
              </label>
              <select
                value={currentProjectId}
                onChange={(e) => updateParams({ project_id: e.target.value })}
                className="text-xs border border-gray-200 rounded-md py-1 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="">Todos</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
