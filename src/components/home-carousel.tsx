import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getImgSrc } from "@/lib/images";
import type { CarouselSlide } from "@/lib/db.functions";

interface HomeCarouselProps {
  slides: CarouselSlide[];
}

export function HomeCarousel({ slides }: HomeCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <section
      id="homepage-carousel"
      className="relative h-[550px] w-full overflow-hidden bg-slate-950 sm:h-[600px] md:h-[650px]"
    >
      {/* Slides container */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 z-10 translate-x-0 scale-100"
                  : "opacity-0 z-0 translate-x-4 scale-105 pointer-events-none"
              }`}
            >
              {/* Background image */}
              <img
                src={getImgSrc(slide.imageUrl)}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Gradient dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent md:bg-gradient-to-br md:from-slate-950/90 md:via-slate-950/60 md:to-primary/20" />

              {/* Content / Caption overlay */}
              <div className="container-page relative z-20 flex h-full flex-col justify-center text-white">
                <div className="max-w-2xl px-4 py-8 md:px-0">
                  <p className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent border border-accent/30 animate-pulse">
                    Global Alliance on Environment
                  </p>
                  <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl text-white">
                    {slide.title}
                  </h2>
                  <p className="mt-6 text-base text-slate-200 sm:text-lg md:text-xl leading-relaxed text-slate-100">
                    {slide.description}
                  </p>
                  <div className="mt-10 flex flex-wrap gap-4">
                    <Link
                      to="/donate"
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-lg transition hover:brightness-105 active:scale-95"
                    >
                      Support Our Work
                    </Link>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                    >
                      What We Do
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Navigation Controls */}
      {slides.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50 hover:scale-105 active:scale-95 sm:left-6"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50 hover:scale-105 active:scale-95 sm:right-6"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Bottom Bar: Indicators & Play/Pause */}
          <div className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-6">
            {/* Play / Pause button */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white border border-white/10 backdrop-blur-md hover:bg-white/20 transition"
              aria-label={
                isPlaying ? "Pause automatic slide rotation" : "Play automatic slide rotation"
              }
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsPlaying(false); // pause on interaction
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === activeIndex ? "w-8 bg-accent" : "w-2.5 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
