"use client";

import React from "react";
import { Monitor, Smartphone, Square, RectangleHorizontal } from "lucide-react";
import { BANNER_DIMENSIONS, type BannerDimension } from "@/types/editor";

interface TemplatesPanelProps {
  selectedDimension: BannerDimension;
  onDimensionChange: (dim: BannerDimension) => void;
}

const DIMENSION_GROUPS = [
  {
    label: "Cuadrado",
    icon: Square,
    dims: BANNER_DIMENSIONS.filter((d) => d.aspectRatio === "1:1"),
  },
  {
    label: "Retrato",
    icon: Smartphone,
    dims: BANNER_DIMENSIONS.filter((d) =>
      ["4:5", "3:4", "9:16"].includes(d.aspectRatio),
    ),
  },
  {
    label: "Paisaje",
    icon: RectangleHorizontal,
    dims: BANNER_DIMENSIONS.filter((d) =>
      ["16:9", "1.91:1"].includes(d.aspectRatio),
    ),
  },
];

const PLATFORM_PRESETS = [
  {
    platform: "Instagram Feed",
    dims: [
      { ratio: "1:1", label: "1080×1080" },
      { ratio: "4:5", label: "1080×1350" },
    ],
  },
  {
    platform: "Instagram Stories",
    dims: [{ ratio: "9:16", label: "1080×1920" }],
  },
  {
    platform: "Twitter / X",
    dims: [{ ratio: "16:9", label: "1200×675" }],
  },
  {
    platform: "Facebook",
    dims: [{ ratio: "1.91:1", label: "1200×628" }],
  },
  {
    platform: "LinkedIn",
    dims: [{ ratio: "1.91:1", label: "1200×627" }],
  },
  {
    platform: "TikTok",
    dims: [{ ratio: "9:16", label: "1080×1920" }],
  },
];

export function TemplatesPanel({
  selectedDimension,
  onDimensionChange,
}: TemplatesPanelProps) {
  return (
    <div className="space-y-5">
      {/* Dimension groups */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Dimensiones
        </p>
        {DIMENSION_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.label} className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <Icon className="h-3.5 w-3.5" />
                {group.label}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {group.dims.map((dim) => (
                  <button
                    key={dim.label}
                    onClick={() => onDimensionChange(dim)}
                    className={`editor-template-card ${selectedDimension.label === dim.label ? "active" : ""}`}
                  >
                    {/* Tiny aspect ratio preview */}
                    <div
                      className="editor-template-preview"
                      style={{
                        aspectRatio: `${dim.width}/${dim.height}`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">
                        {dim.label}
                      </div>
                      {dim.platform && (
                        <div className="text-[10px] text-gray-400 capitalize">
                          {dim.platform}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 tabular-nums shrink-0">
                      {dim.aspectRatio}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform presets */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Por plataforma
        </p>
        {PLATFORM_PRESETS.map((preset) => (
          <div key={preset.platform} className="space-y-1">
            <div className="text-xs font-medium text-gray-600">
              {preset.platform}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {preset.dims.map((d) => {
                const matchingDim = BANNER_DIMENSIONS.find(
                  (bd) =>
                    bd.aspectRatio === d.ratio &&
                    `${bd.width}×${bd.height}` === d.label,
                );
                return (
                  <button
                    key={d.label}
                    onClick={() =>
                      matchingDim && onDimensionChange(matchingDim)
                    }
                    className={`editor-panel-chip text-[10px] ${
                      matchingDim &&
                      selectedDimension.label === matchingDim.label
                        ? "active"
                        : ""
                    }`}
                  >
                    {d.ratio}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
