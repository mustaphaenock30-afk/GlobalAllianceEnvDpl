import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Droplets, TreePine, Users, Megaphone, Sprout } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Global Alliance on Environment — Protecting Nature in Ghana" },
      {
        name: "description",
        content:
          "We promote the protection and conservation of the environment through afforestation, climate action, conservation and community capacity building.",
      },
      { property: "og:title", content: "Global Alliance on Environment" },
      {
        property: "og:description",
        content:
          "A Ghana-based environmental NGO restoring land, fighting climate change, and empowering communities.",
      },
      { property: "og:image", content: "/images/Gallery1.jpg" },
      { name: "twitter:image", content: "/images/Gallery1.jpg" },
    ],
  }),
  component: Index,
});

const highlights = [
  {
    icon: TreePine,
    title: "Afforestation & Reforestation",
    text: "Planting native trees to restore degraded landscapes.",
  },
  {
    icon: Leaf,
    title: "Climate Action",
    text: "Mitigation and adaptation projects with local communities.",
  },
  { icon: Droplets, title: "Clean Water", text: "Improving access to safe water and sanitation." },
  { icon: Sprout, title: "Conservation", text: "Protecting biodiversity and natural habitats." },
  {
    icon: Users,
    title: "Capacity Building",
    text: "Training communities and partners on sustainability.",
  },
  {
    icon: Megaphone,
    title: "Public Awareness",
    text: "Education campaigns for environmental stewardship.",
  },
];

const featuredProjects = [
  "Gallery3.jpg",
  "Gallery12.jpg",
  "Gallery20.jpg",
  "Gallery27.jpg",
  "Gallery33.jpg",
  "Gallery38.jpeg",
];

function Index() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/Gallery1.jpg"
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-primary/40" />
        </div>
        <div className="container-page py-24 text-primary-foreground sm:py-32 md:py-40">
          <p className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
            Ghana · West Africa
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Protecting our planet, <span className="text-accent">one community</span> at a time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/90">
            Global Alliance on Environment works across Bono East and beyond — restoring forests,
            conserving biodiversity and equipping people with the tools to fight climate change.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-95"
            >
              Support Our Work <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/40 bg-primary-foreground/10 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/20"
            >
              What We Do
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="container-page grid grid-cols-2 gap-6 py-10 text-center md:grid-cols-4">
          {[
            { n: "10k+", l: "Trees Planted" },
            { n: "40+", l: "Communities Reached" },
            { n: "12", l: "Active Projects" },
            { n: "2020", l: "Founded" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-3xl font-bold text-primary md:text-4xl">{s.n}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">What we do</h2>
          <p className="mt-3 text-muted-foreground">
            Programmes designed for lasting environmental and social impact.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Explore all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">From the field</h2>
              <p className="mt-2 text-muted-foreground">
                Moments from our recent work with communities.
              </p>
            </div>
            <Link
              to="/gallery"
              className="hidden text-sm font-semibold text-primary hover:underline sm:inline"
            >
              View gallery →
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((img) => (
              <div key={img} className="aspect-[4/3] overflow-hidden rounded-xl">
                <img
                  src={`/images/${img}`}
                  alt="Field work"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-14 text-primary-foreground md:px-14 md:py-20">
          <div className="absolute inset-0 -z-10 opacity-20">
            <img
              src="/images/Afforestation.jpeg"
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Your donation plants the future.
            </h2>
            <p className="mt-3 text-primary-foreground/85">
              Every contribution funds tree seedlings, clean water access and community training.
              Secure payments via Paystack.
            </p>
            <Link
              to="/donate"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-95"
            >
              Donate now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
