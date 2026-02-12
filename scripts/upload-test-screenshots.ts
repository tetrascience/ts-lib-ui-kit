#!/usr/bin/env tsx
/**
 * Upload test screenshots to S3 organized by Zephyr test case ID
 */

import fs from "fs";
import path from "path";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ============================================================================
// Configuration
// ============================================================================

// Required environment variables
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET = process.env.S3_BUCKET;

if (!AWS_REGION) {
  console.error("[ERROR] AWS_REGION environment variable is required");
  process.exit(1);
}

if (!S3_BUCKET) {
  console.error("[ERROR] S3_BUCKET environment variable is required");
  process.exit(1);
}
const SCREENSHOT_DIR = path.resolve(process.cwd(), "test-results/screenshots");
const OUTPUT_FILE = path.resolve(process.cwd(), "test-results/screenshot-urls.json");

// GitHub context for organizing uploads
const GITHUB_RUN_NUMBER = process.env.GITHUB_RUN_NUMBER || "local";
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || "tetrascience/ts-lib-ui-kit";

// Pattern to extract Zephyr ID from filename: SW-T123.png
const ZEPHYR_ID_FROM_FILENAME = /^([A-Z]+-T\d+)\.png$/;

// ============================================================================
// Types
// ============================================================================

interface ScreenshotUrlMapping {
  zephyrId: string;
  s3Key: string;
  url: string;
}

interface OutputFile {
  uploadedAt: string;
  bucket: string;
  region: string;
  runNumber: string;
  repository: string;
  screenshots: ScreenshotUrlMapping[];
}

// ============================================================================
// S3 Client
// ============================================================================

const s3Client = new S3Client({ region: AWS_REGION });

// ============================================================================
// Helper Functions
// ============================================================================

function getDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
}

function getRepoName(): string {
  return GITHUB_REPOSITORY.split("/").pop() || "unknown";
}

/**
 * Build S3 URL (direct URL, no presigning - bucket should have appropriate policy)
 */
function buildS3Url(s3Key: string): string {
  return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;
}

/**
 * Upload a screenshot file to S3 for a specific Zephyr ID
 */
async function uploadScreenshotForZephyrId(screenshotPath: string, zephyrId: string): Promise<ScreenshotUrlMapping> {
  const repoName = getRepoName();
  const dateStr = getDateString();

  // Path structure: {repo}/{date}/{run-number}/{zephyr-id}/screenshot.png
  const s3Key = `${repoName}/${dateStr}/${GITHUB_RUN_NUMBER}/${zephyrId}/screenshot.png`;

  console.log(`  Uploading: ${zephyrId} -> s3://${S3_BUCKET}/${s3Key}`);

  const fileContent = fs.readFileSync(screenshotPath);

  const putCommand = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: fileContent,
    ContentType: "image/png",
    // Using bucket policy for public access (no ACL)
    Metadata: {
      "zephyr-id": zephyrId,
      "github-run-number": GITHUB_RUN_NUMBER,
      "github-repository": GITHUB_REPOSITORY,
      "uploaded-at": new Date().toISOString(),
    },
  });

  await s3Client.send(putCommand);

  return {
    zephyrId,
    s3Key,
    url: buildS3Url(s3Key),
  };
}

/**
 * Get screenshot files and extract Zephyr IDs from filenames
 */
function getScreenshotFiles(): { filename: string; zephyrId: string }[] {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    console.log(`[INFO] Screenshot directory not found: ${SCREENSHOT_DIR}`);
    return [];
  }

  return fs
    .readdirSync(SCREENSHOT_DIR)
    .filter((f) => f.endsWith(".png"))
    .map((filename) => {
      const match = filename.match(ZEPHYR_ID_FROM_FILENAME);
      if (match) {
        return { filename, zephyrId: match[1] };
      }
      return null;
    })
    .filter((f): f is { filename: string; zephyrId: string } => f !== null);
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log("[INFO] Starting screenshot upload to S3");
  console.log(`[INFO] S3 bucket: ${S3_BUCKET}`);
  console.log(`[INFO] AWS region: ${AWS_REGION}`);
  console.log(`[INFO] Run number: ${GITHUB_RUN_NUMBER}`);
  console.log(`[INFO] Screenshot directory: ${SCREENSHOT_DIR}\n`);

  // Get screenshot files with Zephyr IDs
  const screenshotFiles = getScreenshotFiles();
  console.log(`[INFO] Found ${screenshotFiles.length} screenshots with Zephyr IDs\n`);

  if (screenshotFiles.length === 0) {
    console.log("[INFO] No screenshots to upload. Creating empty mapping file.");
    const emptyOutput: OutputFile = {
      uploadedAt: new Date().toISOString(),
      bucket: S3_BUCKET,
      region: AWS_REGION,
      runNumber: GITHUB_RUN_NUMBER,
      repository: GITHUB_REPOSITORY,
      screenshots: [],
    };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(emptyOutput, null, 2));
    return;
  }

  const uploadedScreenshots: ScreenshotUrlMapping[] = [];
  let successCount = 0;
  let errorCount = 0;

  // Upload each screenshot
  for (const { filename, zephyrId } of screenshotFiles) {
    const screenshotPath = path.join(SCREENSHOT_DIR, filename);

    try {
      const result = await uploadScreenshotForZephyrId(screenshotPath, zephyrId);
      uploadedScreenshots.push(result);
      successCount++;
      console.log(`  ✓ ${zephyrId}`);
    } catch (error) {
      console.error(`  ✗ Failed to upload ${zephyrId}:`, error);
      errorCount++;
    }
  }

  // Write output mapping file
  const output: OutputFile = {
    uploadedAt: new Date().toISOString(),
    bucket: S3_BUCKET,
    region: AWS_REGION,
    runNumber: GITHUB_RUN_NUMBER,
    repository: GITHUB_REPOSITORY,
    screenshots: uploadedScreenshots,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n[INFO] Screenshot URL mapping written to: ${OUTPUT_FILE}`);
  console.log(`[INFO] Uploaded: ${successCount}, Errors: ${errorCount}`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[ERROR] Fatal error:", error);
  process.exit(1);
});
