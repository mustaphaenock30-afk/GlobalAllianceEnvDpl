import { Link } from "@tanstack/react-router";
import { Menu, X, LogIn, LogOut, User as UserIcon, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getImgSrc } from "@/lib/images";
import { initAuth, googleSignIn, logout } from "@/lib/auth";
import type { User } from "firebase/auth";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

const ADMIN_EMAIL = "mustaphaenock30@gmail.com";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      () => {
        setUser(null);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        toast.success(`Welcome back, ${result.user.displayName || "Admin"}!`);
      }
    } catch (err: unknown) {
      console.error("Sign-in error:", err);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully.");
    } catch (err) {
      console.error("Sign-out error:", err);
      toast.error("Failed to sign out.");
    }
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={getImgSrc("/images/Logo3.jpg")}
            alt="Global Alliance on Environment"
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-md object-cover"
          />
          <span className="hidden font-display text-base font-semibold leading-tight sm:block">
            Global Alliance
            <br />
            <span className="text-xs font-normal text-muted-foreground">on Environment</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground"
            >
              {n.label}
            </Link>
          ))}

          {/* Dynamic Admin link */}
          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-3 py-2 text-sm font-semibold transition hover:bg-amber-500/20 [&.active]:bg-amber-500 [&.active]:text-white"
            >
              Admin
            </Link>
          )}

          {/* User Sign In / Profile action */}
          {!loading &&
            (user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border ml-2">
                <img
                  src={user.photoURL || ""}
                  alt={user.displayName || "User"}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full border border-primary/20"
                  title={`${user.displayName || "Admin"} (${user.email})`}
                />
                <button
                  onClick={handleSignOut}
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="ml-2 rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition flex items-center gap-1.5 text-sm"
                title="Sign In with Google"
              >
                <LogIn className="h-4 w-4" />
                <span className="text-xs font-medium">Sign In</span>
              </button>
            ))}

          <Link
            to="/donate"
            className="ml-2 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-95"
          >
            Donate
          </Link>
        </nav>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        className={cn(
          "border-t border-border/60 bg-background md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="container-page flex flex-col gap-1 py-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary [&.active]:bg-secondary [&.active]:text-foreground"
            >
              {n.label}
            </Link>
          ))}

          {/* Mobile Admin Link */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-3 py-2 text-sm font-semibold hover:bg-amber-500/20 [&.active]:bg-amber-500 [&.active]:text-white"
            >
              Admin Dashboard
            </Link>
          )}

          {/* Mobile Sign In / Out */}
          {!loading &&
            (user ? (
              <div className="flex items-center justify-between px-3 py-2 border-t border-border mt-1 pt-2">
                <div className="flex items-center gap-2">
                  <img
                    src={user.photoURL || ""}
                    alt={user.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-full"
                  />
                  <span className="text-xs text-muted-foreground font-medium truncate max-w-[150px]">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" /> Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  handleSignIn();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary transition mt-1"
              >
                <LogIn className="h-4 w-4" /> Sign In with Google
              </button>
            ))}

          <Link
            to="/donate"
            onClick={() => setOpen(false)}
            className="mt-1 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            Donate
          </Link>
        </nav>
      </div>
    </header>
  );
}
