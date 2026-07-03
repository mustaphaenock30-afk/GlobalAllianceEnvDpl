import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · Global Alliance on Environment" },
      {
        name: "description",
        content: "Privacy policy for the Global Alliance on Environment website.",
      },
      { property: "og:title", content: "Privacy Policy" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <section className="container-page max-w-3xl py-16">
        <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="prose mt-8 max-w-none space-y-5 text-muted-foreground">
          <p>
            At Global Alliance on Environment, accessible from this website, the privacy of our
            visitors is one of our main priorities. This Privacy Policy explains the types of
            information we collect, how we use it, and the rights you have over your data.
          </p>

          <h2 className="font-display text-xl font-semibold text-foreground">
            Information we collect
          </h2>
          <p>
            The personal information you provide — such as your name, email, phone number, message,
            and donation details — is collected only when you submit a form or make a donation. The
            reasons we ask for each piece of information are made clear at the point of collection.
          </p>

          <h2 className="font-display text-xl font-semibold text-foreground">
            How we use your information
          </h2>
          <p>
            We use the information you share to respond to your enquiries, deliver and acknowledge
            donations, send updates about our work when you've opted in, and improve our website and
            programmes.
          </p>

          <h2 className="font-display text-xl font-semibold text-foreground">Donations</h2>
          <p>
            Donations are processed by Paystack. We do not store your card details on our servers —
            payment data is handled directly by Paystack under their PCI-compliant infrastructure.
            We store the transaction reference, amount, currency and your donor details only.
          </p>

          <h2 className="font-display text-xl font-semibold text-foreground">
            Log files & cookies
          </h2>
          <p>
            Like most websites, we collect standard log information and use cookies to keep the site
            functioning. These are used only to analyse trends and improve user experience and are
            not linked to personally identifiable information.
          </p>

          <h2 className="font-display text-xl font-semibold text-foreground">Your rights</h2>
          <p>
            You may request access, correction, or deletion of your personal data at any time by
            contacting us at{" "}
            <a href="mailto:globalalliance97@gmail.com" className="text-primary hover:underline">
              globalalliance97@gmail.com
            </a>
            . We will respond within one month.
          </p>

          <h2 className="font-display text-xl font-semibold text-foreground">
            Children's information
          </h2>
          <p>
            We do not knowingly collect personal information from children under the age of 13. If
            you believe your child has provided us with such information, please contact us
            immediately and we will remove it.
          </p>

          <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
          <p>
            For any questions about this policy, write to us at{" "}
            <a href="mailto:globalalliance97@gmail.com" className="text-primary hover:underline">
              globalalliance97@gmail.com
            </a>
            .
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
