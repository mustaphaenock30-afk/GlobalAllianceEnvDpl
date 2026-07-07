import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { initializePaystackTransaction } from "@/lib/paystack.functions";
import { toast } from "sonner";
import { Leaf, ShieldCheck, HeartHandshake } from "lucide-react";
import { getImgSrc } from "@/lib/images";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate · Global Alliance on Environment" },
      {
        name: "description",
        content:
          "Support reforestation, clean water and climate action in Ghana. Secure donations via Paystack.",
      },
      { property: "og:title", content: "Donate to Global Alliance on Environment" },
      {
        property: "og:description",
        content: "Your gift plants trees, restores land and trains communities.",
      },
      { property: "og:image", content: "/images/afforestation.jpeg" },
    ],
  }),
  component: Donate,
});

const presets = [50, 100, 250, 500];

function Donate() {
  const init = useServerFn(initializePaystackTransaction);
  const [amount, setAmount] = useState<number>(100);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (!name || !email || amount < 1) {
      toast.error("Please fill in your details and choose an amount.");
      return;
    }
    setBusy(true);
    try {
      const { authorization_url } = await init({
        data: {
          amount,
          email,
          name,
          callback_url: `${window.location.origin}/donate/success`,
        },
      });
      window.location.href = authorization_url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start payment";
      toast.error(msg);
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 -z-10 opacity-25">
          <img
            src={getImgSrc("/images/Afforestation.jpeg")}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container-page py-20 md:py-24">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Support our work</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
            Every cedi plants seedlings, restores degraded land, and helps train communities.
            Donations are processed securely by Paystack.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-16 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {[
            {
              icon: Leaf,
              title: "Direct impact",
              text: "Funds go straight to seedlings, materials and training in Bono East communities.",
            },
            {
              icon: ShieldCheck,
              title: "Secure payments",
              text: "Card details handled by Paystack — never stored on our servers.",
            },
            {
              icon: HeartHandshake,
              title: "Stay informed",
              text: "We'll share project updates so you can see your gift at work.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3"
        >
          <h2 className="font-display text-2xl font-semibold">Make a donation</h2>

          <div className="mt-6">
            <p className="text-sm font-medium">Amount (GHS)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                    amount === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  ₵{p}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={1_000_000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                aria-label="Custom amount"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">Your name</span>
              <input
                name="name"
                required
                maxLength={120}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                maxLength={255}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </div>

          <button
            disabled={busy || amount < 1}
            type="submit"
            className="mt-8 w-full rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-95 disabled:opacity-60"
          >
            {busy ? "Redirecting to Paystack…" : `Donate ₵${amount.toLocaleString()} via Paystack`}
          </button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            You'll be redirected to Paystack's secure checkout to complete your donation.
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}
