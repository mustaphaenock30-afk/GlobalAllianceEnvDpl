import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(5).max(2000),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    console.log("Processing contact message submission...", data);
    let supabaseSaved = false;
    let googleSheetSaved = false;
    const errors: string[] = [];

    // 1. Try to save to Supabase
    const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (hasSupabase) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("contact_messages").insert({
          name: data.name,
          email: data.email,
          subject: data.subject || null,
          message: data.message,
        });
        if (error) {
          console.error("[Supabase] Insert error:", error);
          errors.push(`Supabase error: ${error.message}`);
        } else {
          supabaseSaved = true;
          console.log("[Supabase] Successfully saved contact message!");
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("[Supabase] Failed to save contact message:", errorMsg);
        errors.push(`Supabase init/insert failed: ${errorMsg}`);
      }
    } else {
      console.log("[Supabase] Skipping database save (credentials not configured).");
    }

    // 2. Try to save to Google Sheets
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhookUrl) {
      console.log("Submitting contact message to Google Sheets Webhook:", webhookUrl);
      try {
        const payload = {
          timestamp: new Date().toLocaleString(),
          name: data.name,
          email: data.email,
          subject: data.subject || "",
          message: data.message,
        };

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }

        googleSheetSaved = true;
        console.log("Successfully submitted message to Google Sheet Webhook!");
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Error submitting to Google Sheets Webhook:", errorMsg);
        errors.push(`Google Sheets Webhook failed: ${errorMsg}`);
      }
    } else {
      console.warn(
        "GOOGLE_SHEETS_WEBHOOK_URL environment variable is not defined. Skipping Google Sheets submission.",
      );
    }

    // If both integrations are attempted but both failed, throw an error
    const hasGoogleSheetConfig = !!webhookUrl;

    // We want to make sure we succeed if either succeeds.
    // However, if the user explicitly configured Google Sheets but it failed, we should probably let them know unless Supabase succeeded.
    if (!supabaseSaved && !googleSheetSaved) {
      const errorMessage = hasGoogleSheetConfig
        ? "Failed to save message to both database and Google Sheet. Errors: " + errors.join("; ")
        : "Failed to save message to database, and GOOGLE_SHEETS_WEBHOOK_URL is not configured.";
      throw new Error(errorMessage);
    }

    return { ok: true, supabaseSaved, googleSheetSaved };
  });
