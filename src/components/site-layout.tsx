import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { MessageCircle } from "lucide-react";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />

      {/* Persistent Floating WhatsApp Widget */}
      <div
        id="whatsapp-floating-widget"
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      >
        {/* Chat Tooltip */}
        <div className="relative rounded-lg bg-card border border-border px-3 py-1.5 shadow-md text-xs font-medium text-foreground animate-bounce hidden md:block">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
            </span>
            Chat with us!
          </span>
          {/* Tooltip Arrow */}
          <div className="absolute right-5 bottom-[-6px] h-3 w-3 rotate-45 border-r border-b border-border bg-card"></div>
        </div>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/233596789429"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#20ba5a] hover:shadow-[0_0_20px_rgba(37,211,102,0.6)] group"
        >
          {/* Ripple Wave Animation */}
          <span className="absolute -inset-1 rounded-full border border-[#25D366] opacity-25 group-hover:animate-ping"></span>
          <MessageCircle className="h-7 w-7 transition duration-300 group-hover:rotate-12" />
        </a>
      </div>
    </div>
  );
}
