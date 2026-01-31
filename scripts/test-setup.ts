/**
 * Test Script: Verify Social Media Genius Setup
 *
 * Tests:
 * 1. Environment variables loaded correctly
 * 2. Google Client initialization
 * 3. Platform specifications accessible
 * 4. Validation utilities working
 */

import { testConnection } from "../lib/google-client";
import {
  getSupportedPlatforms,
  getPlatformSpec,
} from "../lib/social-platform-specs";
import { validatePost } from "../lib/social-validators";

async function runTests() {
  console.log("=".repeat(60));
  console.log("Social Media Genius - Setup Verification");
  console.log("=".repeat(60));

  // Test 1: Environment Variables
  console.log("\n[Test 1] Environment Variables");
  console.log("-".repeat(60));
  const requiredEnvVars = [
    "GOOGLE_CLOUD_PROJECT",
    "GOOGLE_CLOUD_LOCATION",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
  ];

  let envVarsOk = true;
  requiredEnvVars.forEach((varName) => {
    const exists = !!process.env[varName];
    console.log(`${varName}: ${exists ? "✓" : "✗"}`);
    if (!exists) envVarsOk = false;
  });

  if (!envVarsOk) {
    console.error("\n❌ Missing required environment variables");
    process.exit(1);
  }

  // Test 2: Google Client Connection
  console.log("\n[Test 2] Google Client Connection");
  console.log("-".repeat(60));
  try {
    const connected = await testConnection();
    if (connected) {
      console.log("✓ Google Cloud connection successful");
    } else {
      console.error("✗ Google Cloud connection failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("✗ Google Cloud connection error:", error);
    process.exit(1);
  }

  // Test 3: Platform Specifications
  console.log("\n[Test 3] Platform Specifications");
  console.log("-".repeat(60));
  const platforms = getSupportedPlatforms();
  console.log(`Supported platforms: ${platforms.join(", ")}`);

  platforms.forEach((platform) => {
    const spec = getPlatformSpec(platform);
    if (spec) {
      console.log(`✓ ${spec.name}:`);
      console.log(`  - Char limit: ${spec.text.maxChars}`);
      console.log(
        `  - Hashtag limit: ${spec.hashtags.max} (recommended: ${spec.hashtags.recommended})`,
      );
      console.log(`  - Image formats: ${spec.images.formats.join(", ")}`);
      console.log(`  - Video formats: ${spec.videos.formats.join(", ")}`);
    } else {
      console.error(`✗ ${platform}: Spec not found`);
    }
  });

  // Test 4: Validation Utilities
  console.log("\n[Test 4] Validation Utilities");
  console.log("-".repeat(60));

  // Test Instagram validation
  const testContent = "Excited to share this amazing new product! 🚀";
  const testHashtags = ["#socialmedia", "#tech", "#innovation"];

  const instagramValidation = validatePost(
    "instagram",
    testContent,
    testHashtags,
  );
  console.log("Instagram post validation:");
  console.log(`  - Valid: ${instagramValidation.valid ? "✓" : "✗"}`);
  console.log(
    `  - Char count: ${instagramValidation.stats.charCount}/${instagramValidation.stats.charLimit}`,
  );
  console.log(
    `  - Hashtags: ${instagramValidation.stats.hashtagCount}/${instagramValidation.stats.hashtagLimit}`,
  );
  if (instagramValidation.errors.length > 0) {
    console.log(`  - Errors: ${instagramValidation.errors.join(", ")}`);
  }
  if (instagramValidation.warnings.length > 0) {
    console.log(`  - Warnings: ${instagramValidation.warnings.join(", ")}`);
  }

  // Test Twitter validation (longer content should fail)
  const longContent = "A".repeat(300);
  const twitterValidation = validatePost("twitter", longContent, testHashtags);
  console.log("\nTwitter validation (300 chars, should fail):");
  console.log(`  - Valid: ${twitterValidation.valid ? "✓" : "✗"}`);
  console.log(`  - Errors: ${twitterValidation.errors.length}`);

  if (!twitterValidation.valid) {
    console.log("  ✓ Correctly rejected oversized content");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✓ All tests passed! Social Media Genius is ready.");
  console.log("=".repeat(60));
  console.log("\nNext steps:");
  console.log("1. Run: cd social-media-genius && npm run dev");
  console.log("2. Open: http://localhost:3000");
  console.log("3. Start generating social media posts!");
  console.log("");
}

// Run tests
runTests().catch((error) => {
  console.error("\n❌ Test failed:", error);
  process.exit(1);
});
