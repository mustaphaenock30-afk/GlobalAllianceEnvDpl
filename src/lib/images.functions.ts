import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

const schema = z.object({
  filename: z.string().trim().min(1),
  base64Data: z.string().min(1),
});

export const saveImageToServer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    try {
      const buffer = Buffer.from(data.base64Data, "base64");
      // Resolve path to public/images
      const publicImagesDir = path.resolve(process.cwd(), "public/images");
      if (!fs.existsSync(publicImagesDir)) {
        fs.mkdirSync(publicImagesDir, { recursive: true });
      }

      const filePath = path.join(publicImagesDir, data.filename);
      fs.writeFileSync(filePath, buffer);

      // Also write to .output/public/images/ if it exists (for immediate production serving)
      const outputImagesDir = path.resolve(process.cwd(), ".output/public/images");
      if (fs.existsSync(outputImagesDir)) {
        const outputFilePath = path.join(outputImagesDir, data.filename);
        fs.writeFileSync(outputFilePath, buffer);
        console.log(`[Sync] Also saved ${data.filename} to .output/public/images`);
      }

      console.log(`[Sync] Saved ${data.filename} successfully (${buffer.length} bytes) to disk!`);

      // Save to Supabase Storage for permanent persistence across ephemeral server containers
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Try to create the bucket in case it doesn't exist
        try {
          await supabaseAdmin.storage.createBucket("synced-images", { public: true });
          console.log("[Sync] Created 'synced-images' bucket or verified it exists.");
        } catch (bucketErr) {
          // Ignore if bucket already exists
        }

        const cleanFilename = data.filename.toLowerCase();
        const mimeType = cleanFilename.endsWith(".png")
          ? "image/png"
          : cleanFilename.endsWith(".gif")
            ? "image/gif"
            : cleanFilename.endsWith(".svg")
              ? "image/svg+xml"
              : "image/jpeg";

        const { error: uploadError } = await supabaseAdmin.storage
          .from("synced-images")
          .upload(data.filename, buffer, {
            contentType: mimeType,
            upsert: true, // Overwrite existing with the same filename to prevent collisions and replace with the new one
          });

        if (uploadError) {
          console.error(
            `[Sync] Failed to upload ${data.filename} to Supabase Storage:`,
            uploadError,
          );
        } else {
          console.log(`[Sync] Successfully saved ${data.filename} to Supabase Storage.`);
        }
      } catch (dbErr) {
        console.error(`[Sync] DB error during Supabase save for ${data.filename}:`, dbErr);
      }

      return { success: true, size: buffer.length };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[Sync] Failed to save image ${data.filename}:`, errorMsg);
      throw new Error(`Failed to save image on server: ${errorMsg}`);
    }
  });
