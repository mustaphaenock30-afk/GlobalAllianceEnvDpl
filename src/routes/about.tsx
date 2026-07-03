import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Target, Eye, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us · Global Alliance on Environment" },
      {
        name: "description",
        content:
          "Meet the team behind Global Alliance on Environment and learn our mission, vision and values.",
      },
      { property: "og:title", content: "About Global Alliance on Environment" },
      {
        property: "og:description",
        content: "Our mission, vision and the team driving environmental change in Ghana.",
      },
      { property: "og:image", content: "/images/Environment.jpg" },
    ],
  }),
  component: About,
});

const team = [
  { name: "Mr. Michael Mustapha", role: "Founder & Director", img: "Founder.jpg" },
  { name: "Mr. Yong Osman Husen", role: "Director of Operations", img: "Director.jpeg" },
  { name: "Mr. Enock Mustapha", role: "Lead Engineer", img: "Engineer.jpeg" },
  { name: "Secretariat", role: "Administration", img: "Secretary.jpg" },
];

function About() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 -z-10 opacity-30">
          <img
            src="/images/Environment.jpg"
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container-page py-20 md:py-28">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">About us</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
            Know our team, our mission and the vision driving us to protect the planet.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Mission",
              text: "To promote environmental protection and sustainable development through grassroots action, education and partnerships.",
            },
            {
              icon: Eye,
              title: "Vision",
              text: "A Ghana — and Africa — where communities and ecosystems thrive together in balance.",
            },
            {
              icon: Heart,
              title: "Values",
              text: "Integrity, inclusion, scientific rigour, and unwavering care for nature and people.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <img
            src="/images/Gallery15.jpg"
            alt="Community work"
            referrerPolicy="no-referrer"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
          <div>
            <h2 className="font-display text-3xl font-bold">Our story</h2>
            <p className="mt-4 text-muted-foreground">
              Founded in 2020, Global Alliance on Environment was born from a simple conviction:
              that the people closest to a problem are also closest to its solution. Operating from
              Techiman in the Bono East Region of Ghana, we partner with farmers, schools,
              traditional authorities and government agencies to deliver projects that restore land,
              conserve water and build climate resilience.
            </p>
            <p className="mt-4 text-muted-foreground">
              From planting tens of thousands of seedlings to running awareness campaigns and
              training local leaders, our work is grounded in community ownership and measurable
              impact.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold">Our team</h2>
            <p className="mt-3 text-muted-foreground">
              Dedicated people working to make environmental change real.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div
                key={m.name}
                className="rounded-xl border border-border bg-card p-4 text-center shadow-sm"
              >
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={`/images/${m.img}`}
                    alt={m.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-4 font-semibold">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
