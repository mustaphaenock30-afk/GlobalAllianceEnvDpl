import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Leaf,
  Droplets,
  TreePine,
  Users,
  Megaphone,
  Sprout,
  Calendar,
  User,
  ArrowUpRight,
  MessageCircle,
  Play,
  Info,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { getImgSrc } from "@/lib/images";
import { useQuery } from "@tanstack/react-query";
import { getAppDb } from "@/lib/db.functions";
import { HomeCarousel } from "@/components/home-carousel";

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
      { property: "og:image", content: "/images/gallery1.jpg" },
      { name: "twitter:image", content: "/images/gallery1.jpg" },
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
  const { data: db } = useQuery({
    queryKey: ["appDb"],
    queryFn: () => getAppDb(),
  });

  const carouselSlides = db?.carousel || [
    {
      id: "slide-1",
      imageUrl: "/images/Afforestation.jpeg",
      title: "Protecting Our Forests",
      description:
        "Restoring native trees to fight climate change and reverse land degradation in Bono East and beyond.",
    },
  ];

  return (
    <SiteLayout>
      <HomeCarousel slides={carouselSlides} />

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

      {/* Campaign Video Section */}
      <section className="border-t border-border bg-background py-20">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Play className="h-3 w-3 fill-current" /> Official Campaign
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              Our Environment, Our Life
            </h2>
            <p className="mt-3 text-muted-foreground">
              Watch our official advertising video to see our activities on the ground, including
              afforestation, clean water campaigns, and public education across Ghana.
            </p>
          </div>

          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border shadow-xl bg-card">
            {/* Aspect Ratio Video Container */}
            <div className="aspect-[16/9] w-full bg-slate-950 relative group">
              <video
                controls
                playsInline
                preload="metadata"
                poster={getImgSrc("/images/environment.jpg")}
                className="h-full w-full object-cover rounded-t-2xl"
              >
                {/* Primary local mp4 paths */}
                <source src="/images/advertising_video.mp4" type="video/mp4" />
                <source src="/video.mp4" type="video/mp4" />
                {/* Fallback to high-quality nature video CDN representing their forest/reforestation ecosystem */}
                <source
                  src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27dfcc692e03ced75a40560cce959ecb11475c1&profile_id=139&oauth2_token_id=57447761"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Campaign details and Action button */}
            <div className="p-6 md:p-8 bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-border">
              <div className="space-y-1.5 max-w-xl">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  Global Alliance on Environment Campaign Video
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Join our mission for environmental conservation and climate action. Reach out
                  directly to Enock Mustapha (Engineer) and the team to collaborate.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-md mt-1">
                  <Info className="h-3 w-3" />
                  <span>
                    To change this video, place your <b>advertising_video.mp4</b> in{" "}
                    <b>public/images/</b>
                  </span>
                </div>
              </div>

              <a
                href="https://wa.me/233596789429"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white px-6 py-3 text-sm font-bold hover:bg-[#20ba5a] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all duration-300"
              >
                <MessageCircle className="h-5 w-5 fill-current" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
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
                  src={getImgSrc(`/images/${img}`)}
                  alt="Field work"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Blog Posts Section */}
      <section className="container-page py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Latest News & Blog</h2>
            <p className="mt-2 text-muted-foreground">
              Stay updated with our latest field operations and sustainability insights.
            </p>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Read all posts &rarr;
          </Link>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {db?.blogs && db.blogs.length > 0 ? (
            db.blogs.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                to="/blog"
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={getImgSrc(post.imageUrl)}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold group-hover:text-primary transition line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <div className="mt-auto pt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                    Read article{" "}
                    <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
              No blog posts published yet.
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-14 text-primary-foreground md:px-14 md:py-20">
          <div className="absolute inset-0 -z-10 opacity-20">
            <img
              src={getImgSrc("/images/Afforestation.jpeg")}
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
