import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Calendar,
  User,
  ArrowLeft,
  Search,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { getImgSrc } from "@/lib/images";
import { useQuery } from "@tanstack/react-query";
import { getAppDb } from "@/lib/db.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "News & Blog — Global Alliance on Environment" },
      {
        name: "description",
        content:
          "Read the latest field updates, environment articles, and conservation news from Bono East, Ghana.",
      },
    ],
  }),
  component: Blog,
});

function Blog() {
  const { data: db, isLoading } = useQuery({
    queryKey: ["appDb"],
    queryFn: () => getAppDb(),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const posts = db?.blogs || [];

  const activePost = useMemo(() => {
    return posts.find((p) => p.id === activePostId) || null;
  }, [posts, activePostId]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query),
    );
  }, [posts, searchQuery]);

  const handleShare = (title: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Blog link copied to clipboard!");
    } else {
      toast.info("Sharing options are available on mobile browsers.");
    }
  };

  return (
    <SiteLayout>
      {activePost ? (
        /* Immersive Article Detail View */
        <article className="min-h-screen bg-background py-12 md:py-20">
          <div className="container-page max-w-3xl">
            {/* Back Button */}
            <button
              onClick={() => setActivePostId(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
              Back to all articles
            </button>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(activePost.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                {activePost.author}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl text-foreground mb-8">
              {activePost.title}
            </h1>

            {/* Hero Image */}
            <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted shadow-md mb-10">
              <img
                src={getImgSrc(activePost.imageUrl)}
                alt={activePost.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Content & Social Share Grid */}
            <div className="grid gap-10 md:grid-cols-[1fr_60px]">
              {/* Content Body */}
              <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:mb-6 text-foreground text-base md:text-lg">
                {activePost.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Share Actions */}
              <div className="flex md:flex-col items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6 h-fit sticky top-24">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground md:mb-2 md:rotate-90 md:h-12 flex items-center justify-center">
                  Share
                </p>
                <button
                  onClick={() => handleShare(activePost.title)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-primary hover:border-primary/50"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-[#1877F2] hover:border-[#1877F2]/50"
                  title="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}&text=${encodeURIComponent(activePost.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-black hover:border-black/50"
                  title="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Author Footer Card */}
            <div className="mt-16 border-t border-border pt-10 flex flex-col sm:flex-row items-center gap-6 bg-secondary/20 rounded-2xl p-6 border border-border/50">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display text-2xl font-bold">
                {activePost.author.charAt(0)}
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Written By
                </p>
                <h3 className="font-display text-lg font-bold text-foreground mt-0.5">
                  {activePost.author}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Dedicated contributor to the Global Alliance on Environment, reporting
                  on-the-ground ecological impact, conservation strategies, and community
                  partnerships.
                </p>
              </div>
            </div>
          </div>
        </article>
      ) : (
        /* Blog Archive Grid View */
        <div className="min-h-screen bg-background py-16 md:py-24">
          <div className="container-page">
            {/* Header */}
            <div className="max-w-2xl mx-auto text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">
                Field News & Insights
              </p>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mt-2">
                Our Environment Blog
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Stay informed with the latest reports, field breakthroughs, and environmental
                insights from our dedicated team working across Ghana.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-md mx-auto mb-12 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, author, content..."
                className="block w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="grid gap-8 md:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[16/10] bg-muted" />
                    <div className="p-6 flex-1 flex flex-col gap-3">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-6 bg-muted rounded w-4/5 mt-2" />
                      <div className="h-4 bg-muted rounded w-full mt-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              /* Grid Layout */
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setActivePostId(post.id)}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md cursor-pointer"
                  >
                    {/* Cover image */}
                    <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                      <img
                        src={getImgSrc(post.imageUrl)}
                        alt={post.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
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
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author}
                        </span>
                      </div>

                      <h2 className="font-display text-xl font-bold group-hover:text-primary transition duration-200 line-clamp-2">
                        {post.title}
                      </h2>

                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm font-semibold text-primary">
                        <span>Read article</span>
                        <span className="transition duration-300 group-hover:translate-x-1">
                          &rarr;
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-20 border border-dashed border-border rounded-2xl max-w-md mx-auto">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold">No results found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We couldn't find any articles matching your search query. Try typing something
                  else!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
