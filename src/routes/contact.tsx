import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactMessage } from "@/lib/contact.functions";
import { toast } from "sonner";
import { getImgSrc } from "@/lib/images";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · Global Alliance on Environment" },
      {
        name: "description",
        content: "Reach out to Global Alliance on Environment — Techiman, Bono East, Ghana.",
      },
      { property: "og:title", content: "Contact Us" },
      { property: "og:description", content: "Get in touch with our team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const submit = useServerFn(submitContactMessage);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      await submit({
        data: {
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          subject: String(data.get("subject") ?? ""),
          message: String(data.get("message") ?? ""),
        },
      });
      toast.success("Message sent. We'll get back to you soon.");
      form.reset();
    } catch (err) {
      toast.error("Could not send. Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 -z-10 opacity-25">
          <img
            src={getImgSrc("/images/Gallery20.jpg")}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container-page py-20 md:py-24">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Contact us</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
            Want to reach out? We're a call or message away.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-16 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold">Our office</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <span>Tico Road, Bono East Region, Techiman, Ghana, West Africa</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-primary" />
                <a href="tel:+233596789429" className="hover:underline">
                  +233 596 789 429
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <a href="mailto:globalalliance97@gmail.com" className="hover:underline">
                  globalalliance97@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-border bg-card p-6 lg:col-span-3"
        >
          <h2 className="font-display text-xl font-semibold">Send a message</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">Name</span>
              <input
                name="name"
                required
                maxLength={100}
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
          <label className="mt-4 block text-sm">
            <span className="font-medium">Subject</span>
            <input
              name="subject"
              maxLength={150}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-medium">Message</span>
            <textarea
              name="message"
              required
              rows={6}
              maxLength={2000}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <button
            disabled={busy}
            type="submit"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}
