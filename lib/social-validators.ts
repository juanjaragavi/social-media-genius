/**
 * Social Media Content Validation Utilities
 *
 * Provides validation functions for text content, hashtags, images, and videos
 * against platform-specific constraints defined in social-platform-specs.ts
 */

import { PLATFORM_SPECS } from './social-platform-specs';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    charCount?: number;
    charLimit?: number;
    fileSizeMB?: number;
    maxSizeMB?: number;
    hashtagCount?: number;
    hashtagLimit?: number;
    width?: number;
    height?: number;
    durationSeconds?: number;
    maxDurationSeconds?: number;
  };
}

/**
 * Validate text content against platform character limits
 *
 * @param platform - Platform identifier (instagram, twitter, facebook, tiktok, linkedin)
 * @param content - Text content to validate
 * @returns ValidationResult with errors, warnings, and stats
 */
export function validateTextContent(
  platform: string,
  content: string
): ValidationResult {
  const spec = PLATFORM_SPECS[platform.toLowerCase()];

  if (!spec) {
    return {
      valid: false,
      errors: [`Unknown platform: ${platform}`],
      warnings: [],
      stats: {},
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const charCount = content.length;

  // Check character limit
  if (charCount > spec.text.maxChars) {
    errors.push(
      `Content exceeds ${spec.name} character limit (${charCount}/${spec.text.maxChars})`
    );
  }

  // Check sweet spot warning
  if (spec.text.sweetSpot && charCount > spec.text.sweetSpot) {
    warnings.push(
      `Content exceeds optimal length for ${spec.name} (${charCount}/${spec.text.sweetSpot} chars). ` +
      `Consider keeping key message in first ${spec.text.sweetSpot} characters for better visibility.`
    );
  }

  // Warning for very short content (less than 10 chars)
  if (charCount < 10 && charCount > 0) {
    warnings.push(
      `Content is very short (${charCount} chars). Consider adding more context for better engagement.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      charCount,
      charLimit: spec.text.maxChars,
    },
  };
}

/**
 * Validate hashtags against platform limits
 *
 * @param platform - Platform identifier
 * @param hashtags - Array of hashtag strings (with or without # prefix)
 * @returns ValidationResult with errors, warnings, and stats
 */
export function validateHashtags(
  platform: string,
  hashtags: string[]
): ValidationResult {
  const spec = PLATFORM_SPECS[platform.toLowerCase()];

  if (!spec) {
    return {
      valid: false,
      errors: [`Unknown platform: ${platform}`],
      warnings: [],
      stats: {},
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const count = hashtags.length;

  // Check hashtag count limit
  if (count > spec.hashtags.max) {
    errors.push(
      `Too many hashtags for ${spec.name} (${count}/${spec.hashtags.max})`
    );
  }

  // Check recommended count
  if (count > spec.hashtags.recommended) {
    warnings.push(
      `More hashtags than recommended for ${spec.name}. ` +
      `Recommended: ${spec.hashtags.recommended}, Current: ${count}. ` +
      `Research shows fewer, more targeted hashtags often perform better.`
    );
  }

  // Validate individual hashtags
  hashtags.forEach((tag, index) => {
    const cleanTag = tag.replace(/^#/, '');

    // Check for empty hashtags
    if (cleanTag.length === 0) {
      errors.push(`Hashtag ${index + 1} is empty`);
    }

    // Check for spaces (invalid)
    if (cleanTag.includes(' ')) {
      errors.push(`Hashtag "${tag}" contains spaces (invalid)`);
    }

    // Check for very long hashtags
    if (cleanTag.length > 30) {
      warnings.push(
        `Hashtag "${tag}" is very long (${cleanTag.length} chars). ` +
        `Consider using shorter, more memorable tags.`
      );
    }
  });

  // Warning for no hashtags on platforms where they're valuable
  if (count === 0 && ['instagram', 'tiktok', 'twitter'].includes(platform.toLowerCase())) {
    warnings.push(
      `No hashtags provided. Hashtags can significantly improve discoverability on ${spec.name}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      hashtagCount: count,
      hashtagLimit: spec.hashtags.max,
    },
  };
}

/**
 * Validate image specifications against platform requirements
 *
 * @param platform - Platform identifier
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param fileSizeMB - File size in megabytes
 * @param format - Image format (JPG, PNG, GIF, etc.)
 * @returns ValidationResult with errors, warnings, and stats
 */
export function validateImage(
  platform: string,
  width: number,
  height: number,
  fileSizeMB: number,
  format: string
): ValidationResult {
  const spec = PLATFORM_SPECS[platform.toLowerCase()];

  if (!spec) {
    return {
      valid: false,
      errors: [`Unknown platform: ${platform}`],
      warnings: [],
      stats: {},
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check format
  const normalizedFormat = format.toUpperCase().replace('JPEG', 'JPG');
  if (!spec.images.formats.includes(normalizedFormat)) {
    errors.push(
      `Invalid image format for ${spec.name}. ` +
      `Supported formats: ${spec.images.formats.join(', ')}`
    );
  }

  // Check file size
  if (fileSizeMB > spec.images.maxSizeMB) {
    errors.push(
      `Image size exceeds ${spec.name} limit ` +
      `(${fileSizeMB.toFixed(2)}MB / ${spec.images.maxSizeMB}MB)`
    );
  }

  // Check dimensions and aspect ratio
  const aspectRatio = width / height;
  const matchingDimension = spec.images.dimensions.find(dim => {
    const dimRatio = dim.width / dim.height;
    return Math.abs(aspectRatio - dimRatio) < 0.05; // Allow 5% variance
  });

  if (!matchingDimension) {
    const recommendedRatios = spec.images.dimensions
      .map(d => `${d.name} (${d.aspectRatio})`)
      .join(', ');

    warnings.push(
      `Image aspect ratio (${width}x${height}) doesn't match ` +
      `recommended dimensions for ${spec.name}. ` +
      `Recommended: ${recommendedRatios}. ` +
      `Your image may be cropped or not display optimally.`
    );
  }

  // Check if dimensions are too small
  const minRecommendedWidth = Math.min(...spec.images.dimensions.map(d => d.width));
  if (width < minRecommendedWidth * 0.5) {
    warnings.push(
      `Image width (${width}px) is quite small. ` +
      `Recommended minimum: ${minRecommendedWidth}px for best quality on ${spec.name}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      width,
      height,
      fileSizeMB,
      maxSizeMB: spec.images.maxSizeMB,
    },
  };
}

/**
 * Validate video specifications against platform requirements
 *
 * @param platform - Platform identifier
 * @param width - Video width in pixels
 * @param height - Video height in pixels
 * @param durationSeconds - Video duration in seconds
 * @param fileSizeMB - File size in megabytes
 * @param format - Video format (MP4, MOV, etc.)
 * @returns ValidationResult with errors, warnings, and stats
 */
export function validateVideo(
  platform: string,
  width: number,
  height: number,
  durationSeconds: number,
  fileSizeMB: number,
  format: string
): ValidationResult {
  const spec = PLATFORM_SPECS[platform.toLowerCase()];

  if (!spec) {
    return {
      valid: false,
      errors: [`Unknown platform: ${platform}`],
      warnings: [],
      stats: {},
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check format
  const normalizedFormat = format.toUpperCase();
  if (!spec.videos.formats.includes(normalizedFormat)) {
    errors.push(
      `Invalid video format for ${spec.name}. ` +
      `Supported formats: ${spec.videos.formats.join(', ')}`
    );
  }

  // Check file size
  if (fileSizeMB > spec.videos.maxSizeMB) {
    errors.push(
      `Video size exceeds ${spec.name} limit ` +
      `(${fileSizeMB.toFixed(2)}MB / ${spec.videos.maxSizeMB}MB)`
    );
  }

  // Check duration
  if (durationSeconds > spec.videos.maxDurationSeconds) {
    errors.push(
      `Video duration exceeds ${spec.name} limit ` +
      `(${durationSeconds}s / ${spec.videos.maxDurationSeconds}s)`
    );
  }

  // Check if video is very short (less than 3 seconds)
  if (durationSeconds < 3) {
    warnings.push(
      `Video is very short (${durationSeconds}s). ` +
      `Consider making it at least 3-5 seconds for better viewer experience.`
    );
  }

  // Check dimensions and aspect ratio
  const aspectRatio = width / height;
  const matchingDimension = spec.videos.dimensions.find(dim => {
    const dimRatio = dim.width / dim.height;
    return Math.abs(aspectRatio - dimRatio) < 0.05; // Allow 5% variance
  });

  if (!matchingDimension) {
    const recommendedRatios = spec.videos.dimensions
      .map(d => `${d.name} (${d.aspectRatio})`)
      .join(', ');

    warnings.push(
      `Video aspect ratio (${width}x${height}) doesn't match ` +
      `recommended dimensions for ${spec.name}. ` +
      `Recommended: ${recommendedRatios}. ` +
      `Your video may be cropped or pillarboxed.`
    );
  }

  // Platform-specific warnings
  if (platform.toLowerCase() === 'instagram' && durationSeconds > 90) {
    warnings.push(
      `Video is longer than 90 seconds. For Instagram, in-app recorded Reels are limited to 90s. ` +
      `Uploaded videos can be up to 15 minutes but shorter content often performs better.`
    );
  }

  if (platform.toLowerCase() === 'tiktok' && durationSeconds > 60) {
    warnings.push(
      `Video is longer than 60 seconds. While TikTok supports up to 60 minutes, ` +
      `shorter content (15-60s) typically gets better engagement.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      width,
      height,
      durationSeconds,
      maxDurationSeconds: spec.videos.maxDurationSeconds,
      fileSizeMB,
      maxSizeMB: spec.videos.maxSizeMB,
    },
  };
}

/**
 * Validate complete social media post (content + hashtags)
 *
 * @param platform - Platform identifier
 * @param content - Text content
 * @param hashtags - Array of hashtags
 * @returns Combined validation result
 */
export function validatePost(
  platform: string,
  content: string,
  hashtags: string[] = []
): ValidationResult {
  const textResult = validateTextContent(platform, content);
  const hashtagResult = validateHashtags(platform, hashtags);

  return {
    valid: textResult.valid && hashtagResult.valid,
    errors: [...textResult.errors, ...hashtagResult.errors],
    warnings: [...textResult.warnings, ...hashtagResult.warnings],
    stats: {
      ...textResult.stats,
      ...hashtagResult.stats,
    },
  };
}
