import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return new Response("not configured", { status: 503 });

        const signature = request.headers.get("x-paystack-signature") ?? "";
        const body = await request.text();
        const expected = createHmac("sha512", secret).update(body).digest("hex");

        const sig = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return new Response("invalid signature", { status: 401 });
        }

        let event: {
          event?: string;
          data?: { reference?: string; status?: string; amount?: number; paid_at?: string };
        };
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("bad json", { status: 400 });
        }

        if (event.event === "charge.success" && event.data?.reference) {
          const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (hasSupabase) {
            try {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              await supabaseAdmin
                .from("donations")
                .update({
                  status: "success",
                  paid_at: event.data.paid_at ?? new Date().toISOString(),
                  paystack_payload: event.data,
                })
                .eq("reference", event.data.reference);
              console.log("[Supabase] Recorded successful charge via webhook.");
            } catch (err: unknown) {
              console.warn(
                "[Supabase] Webhook failed to update donation status:",
                err instanceof Error ? err.message : String(err),
              );
            }
          } else {
            console.log(
              "[Supabase] Skipping webhook donation update (credentials not configured).",
            );
          }
        }

        return new Response("ok");
      },
    },
  },
});
