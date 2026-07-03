import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { verifyPaystackTransaction } from "@/lib/paystack.functions";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  reference: z.string().optional(),
  trxref: z.string().optional(),
});

export const Route = createFileRoute("/donate/success")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Thank you · Global Alliance on Environment" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Success,
});

function Success() {
  const search = useSearch({ from: "/donate/success" });
  const verify = useServerFn(verifyPaystackTransaction);
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ok"; amount: number; currency: string }
    | { kind: "fail"; msg: string }
  >({ kind: "loading" });

  useEffect(() => {
    const ref = search.reference ?? search.trxref;
    if (!ref) {
      setState({ kind: "fail", msg: "Missing transaction reference." });
      return;
    }
    verify({ data: { reference: ref } })
      .then((r) => {
        if (r.success) setState({ kind: "ok", amount: r.amount, currency: r.currency });
        else setState({ kind: "fail", msg: "Payment was not completed." });
      })
      .catch((e) =>
        setState({ kind: "fail", msg: e instanceof Error ? e.message : "Verification failed" }),
      );
  }, [search, verify]);

  return (
    <SiteLayout>
      <section className="container-page max-w-xl py-24 text-center">
        {state.kind === "loading" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Confirming your donation…</p>
          </>
        )}
        {state.kind === "ok" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
            <h1 className="mt-6 font-display text-3xl font-bold">Thank you for your gift!</h1>
            <p className="mt-3 text-muted-foreground">
              We received your donation of {state.currency} {state.amount.toLocaleString()}. Your
              support helps us plant trees, restore land and empower communities across Ghana.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Return home
            </Link>
          </>
        )}
        {state.kind === "fail" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-destructive" />
            <h1 className="mt-6 font-display text-3xl font-bold">
              We couldn't confirm your payment
            </h1>
            <p className="mt-3 text-muted-foreground">{state.msg}</p>
            <Link
              to="/donate"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </Link>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
