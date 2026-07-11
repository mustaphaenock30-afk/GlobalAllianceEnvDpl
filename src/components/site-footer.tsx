import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { getImgSrc } from "@/lib/images";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={getImgSrc("/images/Logo3.jpg")}
              alt=""
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-md object-cover"
            />
            <div>
              <p className="font-display text-lg font-semibold">Global Alliance on Environment</p>
              <p className="text-sm text-muted-foreground">
                Protecting nature. Empowering communities.
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            A Ghana-based environmental NGO working on afforestation, climate action, conservation,
            and community capacity building across Bono East and beyond.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-muted-foreground hover:text-foreground">
                Services
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="text-muted-foreground hover:text-foreground">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/donate" className="text-muted-foreground hover:text-foreground">
                Donate
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Contact</h3>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              Tico Road, Bono East Region, Techiman, Ghana
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <a href="tel:+233596789429" className="hover:text-foreground">
                +233 596 789 429
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <a href="mailto:globalalliance97@gmail.com" className="hover:text-foreground">
                globalalliance97@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© 2020–{year} Global Alliance on Environment. All rights reserved.</p>
          <p>Built with care for our planet.</p>
        </div>
      </div>
    </footer>
  );
}
