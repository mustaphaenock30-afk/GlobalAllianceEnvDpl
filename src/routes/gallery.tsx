import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery · Global Alliance on Environment" },
      {
        name: "description",
        content:
          "Photos from our environmental projects, community programmes and field work across Ghana.",
      },
      { property: "og:title", content: "Gallery" },
      { property: "og:description", content: "A visual look at our work on the ground." },
      { property: "og:image", content: "/images/Gallery5.jpg" },
    ],
  }),
  component: Gallery,
});

const images: string[] = [
  ...Array.from({ length: 37 }, (_, i) => `Gallery${i + 1}.jpg`),
  "Gallery38.jpeg",
  "Gallery39.jpeg",
  "Gallery40.jpeg",
];

function Gallery() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 -z-10 opacity-25">
          <img
            src="/images/Gallery5.jpg"
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container-page py-20 md:py-24">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Gallery</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
            Moments from our projects and community engagements.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
          {images.map((src) => (
            <div key={src} className="overflow-hidden rounded-lg break-inside-avoid">
              <img
                src={`/images/${src}`}
                alt=""
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full transition duration-500 hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
