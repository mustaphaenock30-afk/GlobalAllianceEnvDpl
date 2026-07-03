import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PAYSTACK_BASE = "https://api.paystack.co";
const CURRENCY = "GHS"; // change here to switch currency

const initSchema = z.object({
  amount: z.number().int().min(100).max(100_000_000), // in major currency units
  email: z.string().trim().email().max(255),
  name: z.string().trim().min(1).max(120),
  callback_url: z.string().url(),
});

export const initializePaystackTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => initSchema.parse(data))
  .handler(async ({ data }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Paystack is not configured yet.");

    const amount_kobo = data.amount * 100;

    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        amount: amount_kobo,
        currency: CURRENCY,
        callback_url: data.callback_url,
        metadata: {
          donor_name: data.name,
          custom_fields: [
            { display_name: "Donor Name", variable_name: "donor_name", value: data.name },
          ],
        },
      }),
    });

    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string; access_code: string; reference: string };
    };

    if (!res.ok || !json.status || !json.data) {
      console.error("Paystack init failed:", json);
      throw new Error(json.message || "Could not start payment");
    }

    // Record pending donation if Supabase is configured
    const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (hasSupabase) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("donations").insert({
          reference: json.data.reference,
          amount_kobo,
          currency: CURRENCY,
          status: "pending",
          donor_email: data.email,
          donor_name: data.name,
        });
        console.log("[Supabase] Recorded pending donation successfully.");
      } catch (err: unknown) {
        console.warn(
          "[Supabase] Failed to record pending donation:",
          err instanceof Error ? err.message : String(err),
        );
      }
    } else {
      console.log(
        "[Supabase] Skipping recording of pending donation (credentials not configured).",
      );
    }

    return {
      authorization_url: json.data.authorization_url,
      reference: json.data.reference,
    };
  });

const verifySchema = z.object({ reference: z.string().min(1).max(120) });

export const verifyPaystackTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Paystack is not configured yet.");

    const res = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(data.reference)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
      },
    );
    const json = (await res.json()) as {
      status: boolean;
      data?: {
        status: string;
        amount: number;
        currency: string;
        reference: string;
        paid_at?: string;
      };
    };
    if (!res.ok || !json.status || !json.data) throw new Error("Could not verify transaction");

    const isSuccess = json.data.status === "success";

    // Update donation status if Supabase is configured
    const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (hasSupabase) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("donations")
          .update({
            status: json.data.status,
            paid_at: isSuccess && json.data.paid_at ? json.data.paid_at : null,
          })
          .eq("reference", json.data.reference);
        console.log("[Supabase] Updated donation status successfully.");
      } catch (err: unknown) {
        console.warn(
          "[Supabase] Failed to update donation status:",
          err instanceof Error ? err.message : String(err),
        );
      }
    } else {
      console.log("[Supabase] Skipping donation status update (credentials not configured).");
    }

    return {
      success: isSuccess,
      amount: json.data.amount / 100,
      currency: json.data.currency,
      reference: json.data.reference,
    };
  });
