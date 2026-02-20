/**
 * Google Drive Folder Resolution Utility
 *
 * Resolves or creates a destination folder in the user's Google Drive.
 * Pattern extracted from the RouteGenius backup pipeline
 * (lib/google-drive.ts → getOrCreateBackupFolder).
 *
 * @module lib/drive/resolve-folder
 */

const DEFAULT_FOLDER_NAME = "Social Media Genius Banners";

export { DEFAULT_FOLDER_NAME };

/**
 * Find an existing folder by name in the user's Drive, or create it
 * if it doesn't exist. Returns the folder's ID.
 *
 * Uses Google Drive API v3:
 *   - `files.list` with `mimeType = 'application/vnd.google-apps.folder'`
 *     and `name = '<folderName>'` and `trashed = false`
 *   - `files.create` with `mimeType: 'application/vnd.google-apps.folder'`
 *     when no matching folder is found
 *
 * @param accessToken  A valid Google OAuth2 access token with `drive.file` scope
 * @param folderName   The target folder name (defaults to "Social Media Genius Banners")
 * @returns            The Google Drive folder ID
 */
export async function resolveOrCreateFolder(
  accessToken: string,
  folderName: string = DEFAULT_FOLDER_NAME,
): Promise<string> {
  // ── 1. Search for existing folder by name ─────────────────
  const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchParams = new URLSearchParams({
    q: query,
    fields: "files(id,name)",
    spaces: "drive",
  });

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    console.error(
      `❌ [resolveOrCreateFolder] Folder search failed (HTTP ${searchRes.status}):`,
      errText,
    );
    throw new Error(
      `Drive folder search failed (${searchRes.status}): ${errText}`,
    );
  }

  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    const folderId = searchData.files[0].id as string;
    console.log(
      `📁 [resolveOrCreateFolder] Found existing folder "${folderName}" → ${folderId}`,
    );
    return folderId;
  }

  // ── 2. Create the folder since it doesn't exist ───────────
  console.log(
    `📁 [resolveOrCreateFolder] Folder "${folderName}" not found — creating...`,
  );

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error(
      `❌ [resolveOrCreateFolder] Folder creation failed (HTTP ${createRes.status}):`,
      errText,
    );
    throw new Error(
      `Drive folder creation failed (${createRes.status}): ${errText}`,
    );
  }

  const folder = await createRes.json();
  const newFolderId = folder.id as string;

  console.log(
    `✅ [resolveOrCreateFolder] Created folder "${folderName}" → ${newFolderId}`,
  );

  return newFolderId;
}
