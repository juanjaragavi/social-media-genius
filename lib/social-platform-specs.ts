/**
 * Social Media Platform Specifications (2026)
 *
 * Comprehensive configuration for character limits, media requirements,
 * and platform-specific constraints for major social media platforms.
 *
 * Sources:
 * - Instagram: 2,200 chars, 5 hashtag limit (2026 update)
 * - Twitter/X: 280 chars standard, 25K for Premium
 * - Facebook: 63,206 chars
 * - TikTok: 4,000 chars (2026 increase)
 * - LinkedIn: 3,000 chars
 */

export interface MediaDimension {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface PlatformSpec {
  name: string;
  text: {
    maxChars: number;
    sweetSpot?: number; // Optimal length for engagement
  };
  images: {
    formats: string[];
    maxSizeMB: number;
    dimensions: MediaDimension[];
  };
  videos: {
    formats: string[];
    maxSizeMB: number;
    maxDurationSeconds: number;
    dimensions: MediaDimension[];
  };
  hashtags: {
    max: number;
    recommended: number;
  };
  openGraph?: {
    required: boolean;
    imageSize: string;
  };
}

export const PLATFORM_SPECS: Record<string, PlatformSpec> = {
  instagram: {
    name: 'Instagram',
    text: {
      maxChars: 2200,
      sweetSpot: 125, // Before "more" button
    },
    images: {
      formats: ['JPG', 'PNG'],
      maxSizeMB: 15,
      dimensions: [
        { name: 'Square', width: 1080, height: 1080, aspectRatio: '1:1' },
        { name: 'Portrait', width: 1080, height: 1350, aspectRatio: '4:5' },
        { name: 'Story/Reel', width: 1080, height: 1920, aspectRatio: '9:16' },
      ],
    },
    videos: {
      formats: ['MP4', 'MOV'],
      maxSizeMB: 15,
      maxDurationSeconds: 900, // 15 minutes uploaded, 90s in-app
      dimensions: [
        { name: 'Story', width: 1080, height: 1920, aspectRatio: '9:16' },
        { name: 'Reel', width: 1080, height: 1920, aspectRatio: '9:16' },
      ],
    },
    hashtags: {
      max: 5, // New 2026 limit (down from 30)
      recommended: 3,
    },
  },

  twitter: {
    name: 'X (Twitter)',
    text: {
      maxChars: 280, // Standard users (Premium: 25,000)
    },
    images: {
      formats: ['JPG', 'PNG', 'GIF'],
      maxSizeMB: 5,
      dimensions: [
        { name: 'Standard', width: 1200, height: 675, aspectRatio: '16:9' },
      ],
    },
    videos: {
      formats: ['MP4', 'MOV'],
      maxSizeMB: 512, // Standard (1GB Pro, 16GB Premium+)
      maxDurationSeconds: 140, // Standard (4 hours Premium+)
      dimensions: [
        { name: 'Landscape', width: 1280, height: 720, aspectRatio: '16:9' },
        { name: 'Portrait', width: 720, height: 1280, aspectRatio: '9:16' },
      ],
    },
    hashtags: {
      max: 999, // No strict limit
      recommended: 2, // 1-2 hashtags = 55% more engagement
    },
  },

  facebook: {
    name: 'Facebook',
    text: {
      maxChars: 63206,
      sweetSpot: 80, // Posts under 80 chars get 66% more engagement
    },
    images: {
      formats: ['JPG', 'PNG'],
      maxSizeMB: 30,
      dimensions: [
        { name: 'Standard', width: 1200, height: 630, aspectRatio: '1.91:1' },
      ],
    },
    videos: {
      formats: ['MP4'],
      maxSizeMB: 4000, // 4GB
      maxDurationSeconds: 14460, // 241 minutes
      dimensions: [
        { name: 'Landscape', width: 1280, height: 720, aspectRatio: '16:9' },
        { name: 'Portrait', width: 1080, height: 1920, aspectRatio: '9:16' },
      ],
    },
    hashtags: {
      max: 999,
      recommended: 2, // 3-5 hashtags lose ~175 interactions
    },
    openGraph: {
      required: true,
      imageSize: '1200x630',
    },
  },

  tiktok: {
    name: 'TikTok',
    text: {
      maxChars: 4000, // Increased in 2026 (up from 2,200)
    },
    images: {
      formats: ['JPG', 'PNG'],
      maxSizeMB: 50,
      dimensions: [
        { name: 'Story Carousel', width: 1080, height: 1920, aspectRatio: '9:16' },
      ],
    },
    videos: {
      formats: ['MP4', 'MOV'],
      maxSizeMB: 50, // Use async upload for larger files
      maxDurationSeconds: 3600, // 60 minutes
      dimensions: [
        { name: 'Standard', width: 1080, height: 1920, aspectRatio: '9:16' },
      ],
    },
    hashtags: {
      max: 30,
      recommended: 3, // Minimum 3 recommended
    },
  },

  linkedin: {
    name: 'LinkedIn',
    text: {
      maxChars: 3000,
      sweetSpot: 1500, // 1,000-1,500 chars for best engagement
    },
    images: {
      formats: ['JPG', 'PNG'],
      maxSizeMB: 10,
      dimensions: [
        { name: 'Standard', width: 1200, height: 627, aspectRatio: '1.91:1' },
        { name: 'Story', width: 1080, height: 1920, aspectRatio: '9:16' },
      ],
    },
    videos: {
      formats: ['MP4', 'MOV'],
      maxSizeMB: 200,
      maxDurationSeconds: 600, // 10 minutes
      dimensions: [
        { name: 'Landscape', width: 1280, height: 720, aspectRatio: '16:9' },
      ],
    },
    hashtags: {
      max: 999,
      recommended: 5, // 3-5 industry-specific hashtags
    },
  },
};

/**
 * Get platform specification by platform key
 * @param platform - Platform identifier (instagram, twitter, facebook, tiktok, linkedin)
 * @returns Platform specification or null if not found
 */
export function getPlatformSpec(platform: string): PlatformSpec | null {
  return PLATFORM_SPECS[platform.toLowerCase()] || null;
}

/**
 * Get all supported platform names
 * @returns Array of platform keys
 */
export function getSupportedPlatforms(): string[] {
  return Object.keys(PLATFORM_SPECS);
}

/**
 * Check if a platform is supported
 * @param platform - Platform identifier
 * @returns True if platform is supported
 */
export function isPlatformSupported(platform: string): boolean {
  return platform.toLowerCase() in PLATFORM_SPECS;
}

/**
 * Get optimal aspect ratio for a platform's primary content type
 * @param platform - Platform identifier
 * @returns Aspect ratio string (e.g., "1:1", "9:16")
 */
export function getOptimalAspectRatio(platform: string): string | null {
  const spec = getPlatformSpec(platform);
  if (!spec || spec.images.dimensions.length === 0) {
    return null;
  }
  return spec.images.dimensions[0].aspectRatio;
}

/**
 * Get optimal image dimensions for a platform
 * @param platform - Platform identifier
 * @returns MediaDimension object or null
 */
export function getOptimalImageDimensions(platform: string): MediaDimension | null {
  const spec = getPlatformSpec(platform);
  if (!spec || spec.images.dimensions.length === 0) {
    return null;
  }
  return spec.images.dimensions[0];
}

/**
 * Get optimal video dimensions for a platform
 * @param platform - Platform identifier
 * @returns MediaDimension object or null
 */
export function getOptimalVideoDimensions(platform: string): MediaDimension | null {
  const spec = getPlatformSpec(platform);
  if (!spec || spec.videos.dimensions.length === 0) {
    return null;
  }
  return spec.videos.dimensions[0];
}
