import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services · Global Alliance on Environment" },
      {
        name: "description",
        content:
          "Afforestation, climate change projects, conservation, capacity building, public awareness and more.",
      },
      { property: "og:title", content: "Our Services" },
      {
        property: "og:description",
        content: "Programmes that protect the environment and empower communities.",
      },
      { property: "og:image", content: "/images/Afforestation.jpeg" },
    ],
  }),
  component: Services,
});

const services = [
  {
    title: "Afforestation & Reforestation",
    img: "Afforestation.jpeg",
    text: "Restoring degraded landscapes with native tree species in partnership with local farmers.",
  },
  {
    title: "Public Awareness Campaigns",
    img: "Awareness.png",
    text: "Community outreach, schools programmes and media campaigns that change how people relate to nature.",
  },
  {
    title: "Climate Change Mitigation",
    img: "ClimateChange.jpeg",
    text: "Reducing emissions through clean cookstoves, renewable energy pilots and forest conservation.",
  },
  {
    title: "Climate Change Adaptation",
    img: "CapacityBuilding.jpg",
    text: "Helping communities adapt with climate-smart agriculture, water security and early warning systems.",
  },
  {
    title: "Conservation & Biodiversity",
    img: "Conservation.jpg",
    text: "Protecting threatened habitats and species through habitat restoration and community-led conservation areas.",
  },
  {
    title: "Sustainable Practices",
    img: "Sustainable.jpeg",
    text: "Promoting circular economy practices, sustainable agriculture and responsible waste management.",
  },
  {
    title: "Capacity Building & Training",
    img: "PublicEducation.jpeg",
    text: "Equipping community leaders, youth and partner organisations with the skills to lead change.",
  },
  {
    title: "Clean Water & Sanitation",
    img: "CleanWater.jpg",
    text: "Improving access to safe water and sanitation in underserved communities.",
  },
  {
    title: "Land Restoration",
    img: "LandRestoration.jpg",
    text: "Reversing land degradation through soil restoration, agroforestry and erosion control.",
  },
];

function Services() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 -z-10 opacity-25">
          <img
            src="/images/Afforestation.jpeg"
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container-page py-20 md:py-28">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Services</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
            We provide the best services aimed at protecting the environment and empowering
            communities.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article
              key={s.title}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={`/images/${s.img}`}
                  alt={s.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-primary/5 p-8 text-center">
          <p className="font-display text-xl font-semibold">
            Want to partner or sponsor a programme?
          </p>
          <p className="mt-2 text-muted-foreground">We're always open to collaboration.</p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Get in touch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
