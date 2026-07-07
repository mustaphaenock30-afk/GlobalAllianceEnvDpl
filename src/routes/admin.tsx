import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/site-layout";
import { initAuth, googleSignIn, logout } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppDb,
  updateCarousel,
  saveBlogPost,
  deleteBlogPost,
  type CarouselSlide,
  type BlogPost,
} from "@/lib/db.functions";
import { saveImageToServer } from "@/lib/images.functions";
import { getImgSrc, saveImageToLocalDB } from "@/lib/images";
import type { User } from "firebase/auth";
import { toast } from "sonner";
import {
  LayoutDashboard,
  SlidingScale,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Check,
  X,
  Lock,
  UserCheck,
  AlertTriangle,
  Loader2,
  LogOut,
  ArrowRight,
  Eye,
  Calendar,
  User as UserIcon,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — Global Alliance on Environment" }],
  }),
  component: AdminDashboard,
});

const ADMIN_EMAIL = "mustaphaenock30@gmail.com";

const SYSTEM_IMAGES = [
  {
    filename: "Logo3.jpg",
    label: "Main Logo (Header/Footer)",
    desc: "The main emblem displayed across the header and footer.",
  },
  {
    filename: "Founder.jpg",
    label: "Mr. Michael Mustapha (Founder)",
    desc: "Founder portrait on the About page.",
  },
  {
    filename: "Director.jpeg",
    label: "Mr. Yong Osman Husen (Director)",
    desc: "Director portrait on the About page.",
  },
  {
    filename: "Engineer.jpeg",
    label: "Mr. Enock Mustapha (Engineer)",
    desc: "Engineer portrait on the About page.",
  },
  {
    filename: "Secretary.jpg",
    label: "Secretariat (Secretary)",
    desc: "Secretary portrait on the About page.",
  },
  {
    filename: "Environment.jpg",
    label: "About Page Main Banner",
    desc: "Hero image banner on the About page.",
  },
  {
    filename: "Afforestation.jpeg",
    label: "Afforestation & Reforestation Banner",
    desc: "Banner used for afforestation, donating, and services hero.",
  },
  {
    filename: "CleanWater.jpg",
    label: "Clean Water Service",
    desc: "Representative image for safe water and WASH campaigns.",
  },
  {
    filename: "Conservation.jpg",
    label: "Conservation & Biodiversity",
    desc: "Image used for nature conservation programs.",
  },
  {
    filename: "CapacityBuilding.jpg",
    label: "Capacity Building Service",
    desc: "Training sessions and community meetings.",
  },
  {
    filename: "PublicEducation.jpeg",
    label: "Public Education Banner",
    desc: "Schools and public outreach programs.",
  },
  {
    filename: "LandRestoration.jpg",
    label: "Land Restoration Banner",
    desc: "Degraded land recovery and soils management.",
  },
  {
    filename: "Sustainable.jpeg",
    label: "Sustainable Agriculture Banner",
    desc: "Sustainable farming systems and permaculture.",
  },
  {
    filename: "Awareness.png",
    label: "Climate Awareness Banner",
    desc: "General campaign brochures and advocacy.",
  },
];

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "carousel" | "blog" | "images">(
    "overview",
  );

  // Fetch application db (carousel + blog)
  const {
    data: db,
    isLoading: loadingDb,
    refetch: refetchDb,
  } = useQuery({
    queryKey: ["appDb"],
    queryFn: () => getAppDb(),
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
        setLoadingAuth(false);
      },
      () => {
        setUser(null);
        setLoadingAuth(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        toast.success(`Welcome, ${result.user.displayName || "Admin"}!`);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to authenticate.");
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign out.");
    }
  };

  // MUTATIONS
  const saveCarouselMutation = useMutation({
    mutationFn: (newSlides: CarouselSlide[]) => updateCarousel({ data: newSlides }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appDb"] });
      toast.success("Homepage carousel updated successfully!");
    },
    onError: (err) => {
      toast.error(`Error saving carousel: ${err.message}`);
    },
  });

  const saveBlogMutation = useMutation({
    mutationFn: (post: Omit<BlogPost, "id"> & { id?: string }) => saveBlogPost({ data: post }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appDb"] });
      toast.success("Blog post saved successfully!");
      setEditingBlog(null);
      setIsAddingBlog(false);
    },
    onError: (err) => {
      toast.error(`Error saving blog post: ${err.message}`);
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => deleteBlogPost({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appDb"] });
      toast.success("Blog post deleted!");
    },
    onError: (err) => {
      toast.error(`Error deleting blog post: ${err.message}`);
    },
  });

  // CAROUSEL FORM STATE
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [slideForm, setSlideForm] = useState({ title: "", description: "", imageUrl: "" });

  // Sync state representation
  useEffect(() => {
    if (db?.carousel) {
      setCarouselSlides(db.carousel);
    }
  }, [db]);

  // BLOG FORM STATE
  const [isAddingBlog, setIsAddingBlog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    date: new Date().toISOString().split("T")[0],
    imageUrl: "/images/Afforestation.jpeg",
  });

  // Sync editing blog values
  useEffect(() => {
    if (editingBlog) {
      setBlogForm({
        title: editingBlog.title,
        excerpt: editingBlog.excerpt,
        content: editingBlog.content,
        author: editingBlog.author,
        date: editingBlog.date,
        imageUrl: editingBlog.imageUrl,
      });
    } else if (isAddingBlog) {
      setBlogForm({
        title: "",
        excerpt: "",
        content: "",
        author: user?.displayName || "Michael Mustapha",
        date: new Date().toISOString().split("T")[0],
        imageUrl: "/images/Afforestation.jpeg",
      });
    }
  }, [editingBlog, isAddingBlog, user]);

  // SYSTEM IMAGES STATE
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // File Upload Helper
  const handleFileUpload = (filename: string, onUploadSuccess: (savedFilename: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadingImage(filename);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const dataUrl = reader.result as string;
          const base64Data = dataUrl.split(",")[1];

          await saveImageToServer({ filename, base64Data });

          try {
            await saveImageToLocalDB(filename, base64Data);
          } catch (localDbErr) {
            console.error(
              "[Cache] Failed to save to local IndexedDB during admin upload:",
              localDbErr,
            );
          }

          toast.success(`Image "${filename}" updated successfully!`);
          onUploadSuccess(`/images/${filename}`);

          // Force recache images
          queryClient.invalidateQueries({ queryKey: ["appDb"] });
          refetchDb();
        } catch (err: unknown) {
          console.error(err);
          const msg = err instanceof Error ? err.message : String(err);
          toast.error(`Upload failed: ${msg}`);
        } finally {
          setUploadingImage(null);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Render Authentication and Access Guards
  if (loadingAuth || loadingDb) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-background px-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Authenticating and initializing dashboard...
          </p>
        </div>
      </SiteLayout>
    );
  }

  // If no user is logged in
  if (!user) {
    return (
      <SiteLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4 py-16">
          <div className="max-w-md w-full border border-border bg-card shadow-lg rounded-2xl p-8 text-center">
            <div className="h-14 w-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Admin Authentication
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Access to this dashboard is strictly restricted to the registered administrator of the
              Global Alliance on Environment. Please sign in below.
            </p>
            <div className="mt-8">
              <button
                onClick={handleSignIn}
                className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-primary py-3.5 px-4 text-sm font-semibold text-primary-foreground hover:brightness-95 active:scale-[0.98] transition shadow-md"
              >
                Sign In with Google
              </button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // If user is logged in, but is NOT the designated admin
  if (user.email !== ADMIN_EMAIL) {
    return (
      <SiteLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4 py-16">
          <div className="max-w-md w-full border border-red-200 bg-red-50/5 dark:bg-red-950/5 shadow-lg rounded-2xl p-8 text-center border-dashed">
            <div className="h-14 w-14 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
              Unauthorized Account
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your account (<span className="font-semibold text-foreground">{user.email}</span>)
              does not have access to this portal. Only{" "}
              <span className="font-semibold text-foreground">{ADMIN_EMAIL}</span> is authorized.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              <button
                onClick={handleSignOut}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 px-4 text-sm font-semibold text-foreground hover:bg-secondary transition active:scale-95"
              >
                <LogOut className="h-4 w-4" /> Sign Out & Switch Account
              </button>
              <Link
                to="/"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="min-h-screen bg-secondary/10 py-10">
        <div className="container-page">
          {/* Admin Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" /> Authorized System Administrator
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight mt-1">
                Alliance Admin Workspace
              </h1>
            </div>
            <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL || ""}
                  alt="Admin Profile"
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full border border-primary/20"
                />
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                title="Log Out Admin"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
            {[
              { label: "Carousel Slides", value: carouselSlides.length, color: "text-blue-500" },
              {
                label: "Blog Articles",
                value: (db?.blogs || []).length,
                color: "text-emerald-500",
              },
              { label: "Website Photos", value: SYSTEM_IMAGES.length, color: "text-amber-500" },
              { label: "Server Identity", value: "ADMIN", color: "text-indigo-500" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border p-5 rounded-2xl shadow-sm text-center"
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-2xl md:text-3xl font-extrabold mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Dashboard Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 bg-card border border-border p-1.5 rounded-2xl shadow-sm mb-8">
            <button
              onClick={() => {
                setActiveTab("overview");
                setIsAddingBlog(false);
                setEditingBlog(null);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition shrink-0 ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("carousel");
                setIsAddingBlog(false);
                setEditingBlog(null);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition shrink-0 ${
                activeTab === "carousel"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <FileImage className="h-4 w-4" /> Homepage Carousel
            </button>
            <button
              onClick={() => {
                setActiveTab("blog");
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition shrink-0 ${
                activeTab === "blog"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4" /> Blog Manager
            </button>
            <button
              onClick={() => {
                setActiveTab("images");
                setIsAddingBlog(false);
                setEditingBlog(null);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition shrink-0 ${
                activeTab === "images"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <ImageIcon className="h-4 w-4" /> Image Replacer
            </button>
          </div>

          {/* TAB CONTENTS */}

          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-display text-xl font-bold mb-4">
                    Welcome back, Administrator!
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    In this portal, you have direct write permissions to customize the website's
                    dynamic sections in real-time. No code changes are required. Any updates to
                    carousel layouts, blog items, or key system graphics take effect instantly
                    across all client views.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Simply use the navigation tabs above to swap homepage media, issue field blogs,
                    or upload new replacements for the core logos and portrait images.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-display text-xl font-bold mb-4">Recent Published Blogs</h2>
                  <div className="divide-y divide-border">
                    {(db?.blogs || []).slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div>
                          <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                            {post.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {post.author} · {post.date}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("blog");
                            setEditingBlog(post);
                          }}
                          className="text-xs font-semibold text-primary hover:underline shrink-0"
                        >
                          Edit Post
                        </button>
                      </div>
                    ))}
                    {(db?.blogs || []).length === 0 && (
                      <p className="text-sm text-muted-foreground py-2">No blogs found.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2">
                    <ShieldAlert className="h-5 w-5" /> Security Guidelines
                  </h3>
                  <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-3 leading-relaxed">
                    <li>
                      · Ensure images uploaded are compressed and high-quality for fast loading
                      times.
                    </li>
                    <li>· Keep blog content verified and proofread before publishing.</li>
                    <li>
                      · Homepage Carousel updates should be visually balanced with short, concise
                      captions.
                    </li>
                    <li>
                      · Avoid deleting default system images unless you are uploading high-fidelity
                      equivalents.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. CAROUSEL TAB */}
          {activeTab === "carousel" && (
            <div className="space-y-8">
              {/* Active Slides Grid */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold">Homepage Slideshow</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rearrange, edit captions, or add fresh slides to the homepage carousel.
                    </p>
                  </div>
                  {!isAddingSlide && !editingSlide && (
                    <button
                      onClick={() => {
                        setSlideForm({
                          title: "",
                          description: "",
                          imageUrl: "/images/Afforestation.jpeg",
                        });
                        setIsAddingSlide(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-bold transition hover:brightness-95 shadow"
                    >
                      <Plus className="h-4 w-4" /> Add New Slide
                    </button>
                  )}
                </div>

                {/* Form Editor Block */}
                {(isAddingSlide || editingSlide) && (
                  <div className="border border-primary/20 bg-primary/5 rounded-2xl p-6 mb-8">
                    <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2 text-primary">
                      {isAddingSlide ? "Add New Slide Settings" : "Modify Slide Settings"}
                    </h3>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Slide Title
                          </label>
                          <input
                            type="text"
                            value={slideForm.title}
                            onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                            placeholder="e.g. Protecting Our Waterways"
                            className="w-full rounded-xl border border-border bg-card py-2.5 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Slide Description
                          </label>
                          <textarea
                            value={slideForm.description}
                            onChange={(e) =>
                              setSlideForm({ ...slideForm, description: e.target.value })
                            }
                            placeholder="e.g. Empowering community committees with clean water facilities..."
                            rows={3}
                            className="w-full rounded-xl border border-border bg-card py-2.5 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Slide Image Source
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={slideForm.imageUrl}
                              onChange={(e) =>
                                setSlideForm({ ...slideForm, imageUrl: e.target.value })
                              }
                              className="flex-1 rounded-xl border border-border bg-card py-2.5 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="/images/Gallery1.jpg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                // Upload carousel slide image with unique timestamped filename
                                const fn = `carousel_${Date.now()}.jpg`;
                                handleFileUpload(fn, (url) => {
                                  setSlideForm((prev) => ({ ...prev, imageUrl: url }));
                                });
                              }}
                              disabled={uploadingImage !== null}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-secondary transition disabled:opacity-50"
                            >
                              <Upload className="h-4 w-4" /> Upload
                            </button>
                          </div>
                          {slideForm.imageUrl && (
                            <div className="aspect-[16/9] w-full max-w-[280px] border border-border overflow-hidden rounded-xl bg-muted relative">
                              <img
                                src={getImgSrc(slideForm.imageUrl)}
                                alt="Slide preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/60">
                      <button
                        onClick={() => {
                          setIsAddingSlide(false);
                          setEditingSlide(null);
                        }}
                        className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (
                            !slideForm.title.trim() ||
                            !slideForm.description.trim() ||
                            !slideForm.imageUrl.trim()
                          ) {
                            toast.error("Please fill in all slide fields.");
                            return;
                          }
                          let updated: CarouselSlide[];
                          if (isAddingSlide) {
                            updated = [
                              ...carouselSlides,
                              { id: `slide-${Date.now()}`, ...slideForm },
                            ];
                          } else {
                            updated = carouselSlides.map((s) =>
                              s.id === editingSlide?.id ? { id: s.id, ...slideForm } : s,
                            );
                          }
                          setCarouselSlides(updated);
                          saveCarouselMutation.mutate(updated);
                          setIsAddingSlide(false);
                          setEditingSlide(null);
                        }}
                        className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:brightness-95 transition"
                      >
                        Apply & Save Slide
                      </button>
                    </div>
                  </div>
                )}

                {/* Slides List */}
                <div className="space-y-4">
                  {carouselSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between border border-border bg-card/50 rounded-2xl p-5 gap-4 hover:border-primary/20 transition"
                    >
                      <div className="flex items-center gap-5">
                        <div className="aspect-[16/9] h-20 w-32 shrink-0 border border-border rounded-xl overflow-hidden bg-muted relative">
                          <img
                            src={getImgSrc(slide.imageUrl)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-accent mb-0.5">Slide #{index + 1}</p>
                          <h4 className="font-display font-bold text-base leading-snug">
                            {slide.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1 max-w-xl">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => {
                            setEditingSlide(slide);
                            setSlideForm({
                              title: slide.title,
                              description: slide.description,
                              imageUrl: slide.imageUrl,
                            });
                            setIsAddingSlide(false);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:bg-secondary transition"
                          title="Edit Slide Text"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          disabled={carouselSlides.length <= 1}
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this carousel slide?")) {
                              const updated = carouselSlides.filter((s) => s.id !== slide.id);
                              setCarouselSlides(updated);
                              saveCarouselMutation.mutate(updated);
                            }
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition disabled:opacity-40"
                          title="Delete Slide"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {carouselSlides.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No slides configured. Add a slide above!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. BLOG TAB */}
          {activeTab === "blog" && (
            <div className="space-y-8">
              {/* Blog Form Block */}
              {isAddingBlog || editingBlog ? (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-display text-xl font-bold border-b border-border pb-4 mb-6 text-primary flex items-center gap-2">
                    <FileText className="h-5 w-5" />{" "}
                    {isAddingBlog ? "Publish New Blog Post" : "Edit Blog Post"}
                  </h2>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Blog Title
                        </label>
                        <input
                          type="text"
                          value={blogForm.title}
                          onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                          placeholder="e.g. 10,000 Native Saplings Planted in Bono East"
                          className="w-full rounded-xl border border-border bg-card py-2.5 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="grid gap-4 grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Author
                          </label>
                          <input
                            type="text"
                            value={blogForm.author}
                            onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                            placeholder="e.g. Michael Mustapha"
                            className="w-full rounded-xl border border-border bg-card py-2.5 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Publish Date
                          </label>
                          <input
                            type="date"
                            value={blogForm.date}
                            onChange={(e) => setBlogForm({ ...blogForm, date: e.target.value })}
                            className="w-full rounded-xl border border-border bg-card py-2.5 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Excerpt (Brief Summary)
                        </label>
                        <input
                          type="text"
                          value={blogForm.excerpt}
                          onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                          placeholder="Provide a 1-2 sentence high-level summary of the article..."
                          className="w-full rounded-xl border border-border bg-card py-2.5 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Article Content
                        </label>
                        <textarea
                          value={blogForm.content}
                          onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                          placeholder="Write the full body content. Separate paragraphs with a blank line (double enter) for automatic typesetting rendering."
                          rows={12}
                          className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed font-sans"
                        />
                      </div>
                    </div>

                    {/* Blog Cover Image Upload column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Article Cover Image
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={blogForm.imageUrl}
                            onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
                            placeholder="/images/Gallery12.jpg"
                            className="flex-1 rounded-xl border border-border bg-card py-2.5 px-3.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Upload with unique filename
                              const fn = `blog_${Date.now()}.jpg`;
                              handleFileUpload(fn, (url) => {
                                setBlogForm((prev) => ({ ...prev, imageUrl: url }));
                              });
                            }}
                            disabled={uploadingImage !== null}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold hover:bg-secondary transition disabled:opacity-50"
                          >
                            <Upload className="h-4 w-4 shrink-0" /> Upload
                          </button>
                        </div>
                        {blogForm.imageUrl && (
                          <div className="aspect-[16/10] w-full border border-border overflow-hidden rounded-xl bg-muted relative shadow-inner">
                            <img
                              src={getImgSrc(blogForm.imageUrl)}
                              alt="Blog cover preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                          Recommended format: JPG/PNG landscape ratio of 16:10. Uploaded files are
                          directly optimized and saved on-server.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border">
                    <button
                      onClick={() => {
                        setIsAddingBlog(false);
                        setEditingBlog(null);
                      }}
                      className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => {
                        if (
                          !blogForm.title.trim() ||
                          !blogForm.excerpt.trim() ||
                          !blogForm.content.trim() ||
                          !blogForm.author.trim() ||
                          !blogForm.imageUrl.trim()
                        ) {
                          toast.error("Please fill in all blog fields before saving.");
                          return;
                        }
                        saveBlogMutation.mutate({
                          id: editingBlog?.id,
                          ...blogForm,
                        });
                      }}
                      className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:brightness-95 transition flex items-center gap-2 shadow"
                    >
                      Publish Article &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                /* Archive List Table */
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                    <div>
                      <h2 className="font-display text-xl font-bold">Published Articles</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Manage the news archive and field reports on the Blog section.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingBlog(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-bold transition hover:brightness-95 shadow"
                    >
                      <Plus className="h-4 w-4" /> Add Blog Post
                    </button>
                  </div>

                  {/* Table List of blogs */}
                  <div className="divide-y divide-border">
                    {(db?.blogs || []).map((post) => (
                      <div
                        key={post.id}
                        className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="aspect-[16/10] h-14 w-22 border border-border rounded-lg overflow-hidden bg-muted shrink-0 relative shadow-sm">
                            <img
                              src={getImgSrc(post.imageUrl)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <h3 className="font-display text-base font-bold leading-tight group-hover:text-primary transition">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {post.date}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-3 w-3" /> By {post.author}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1 max-w-2xl">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => {
                              setEditingBlog(post);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:bg-secondary transition"
                            title="Edit Article"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete the article: "${post.title}"?`,
                                )
                              ) {
                                deleteBlogMutation.mutate(post.id);
                              }
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                            title="Delete Article"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(db?.blogs || []).length === 0 && (
                      <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No articles found. Write your first post above!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. IMAGE REPLACER TAB */}
          {activeTab === "images" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-xl font-bold mb-1">Core Graphic Replacer</h2>
                <p className="text-xs text-muted-foreground border-b border-border pb-4 mb-6 leading-relaxed">
                  Directly overwrite core graphics, badges, logos, and team portraits on the server
                  disk. Overwriting these files changes them instantly on all respective views
                  across the website. Ensure you preserve their aspect ratios.
                </p>

                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {SYSTEM_IMAGES.map((img) => {
                    const isUploadingThis = uploadingImage === img.filename;
                    const fullSrc = `/images/${img.filename}`;
                    return (
                      <div
                        key={img.filename}
                        className="border border-border bg-card rounded-2xl p-4 flex flex-col justify-between hover:border-primary/20 hover:shadow-sm transition text-left"
                      >
                        <div>
                          <div className="aspect-square w-full rounded-xl border border-border/80 overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-inner mb-3">
                            <img
                              src={getImgSrc(fullSrc)}
                              alt={img.label}
                              className="max-h-full max-w-full object-contain"
                            />
                            {isUploadingThis && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 text-xs">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Uploading...</span>
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-sm leading-tight text-foreground">
                            {img.label}
                          </h4>
                          <code className="text-[10px] text-muted-foreground mt-1.5 block bg-secondary/50 p-1 px-1.5 rounded w-fit border border-border font-mono">
                            {img.filename}
                          </code>
                          <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                            {img.desc}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60">
                          <button
                            type="button"
                            onClick={() => handleFileUpload(img.filename, () => {})}
                            disabled={uploadingImage !== null}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold py-2 transition disabled:opacity-50"
                          >
                            <Upload className="h-3.5 w-3.5" /> Replace Image
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
