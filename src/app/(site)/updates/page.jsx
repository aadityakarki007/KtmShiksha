// src/app/(site)/updates/page.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { SitePageShell } from "@/components/site/site-page-shell";
import { X } from "lucide-react";

function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    fetch("/api/updates?limit=50")
      .then((r) => r.json())
      .then((json) => setUpdates(json.data ?? []));
  }, []);

  return (
    <SitePageShell
      title="School updates"
      description="Photos and news from Kathmandu Shikshyalaya—shared for families and visitors."
    >
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      <div className="flex flex-col gap-4">
        {updates.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed px-4 py-10 text-center text-sm">
            No updates yet. Please check back soon.
          </p>
        ) : (
          updates.map((update) => (
            <div
              key={update._id}
              id={update._id}
              className={`scroll-mt-24 flex flex-col overflow-hidden rounded-2xl border bg-card/90 transition-all duration-300 hover:shadow-md dark:bg-card/50 sm:flex-row ${
                update.pinned ? "border-l-4 border-l-amber-500/70" : ""
              }`}
            >
              {update.imageUrl ? (
                <button
                  onClick={() => setLightboxSrc(update.imageUrl)}
                  className="group w-full shrink-0 cursor-zoom-in overflow-hidden bg-muted/20 sm:w-64 md:w-72"
                  aria-label="View full image"
                >
                  {update.imageUrl.startsWith("https://") ? (
                    <Image
                      src={update.imageUrl}
                      alt=""
                      width={800}
                      height={600}
                      className="h-64 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-full"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 256px, 288px"
                      priority={false}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- legacy data URLs
                    <img
                      src={update.imageUrl}
                      alt=""
                      className="h-64 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-full"
                    />
                  )}
                </button>
              ) : null}

              <div className="flex flex-1 flex-col justify-center gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold leading-tight">{update.title}</h2>
                  {update.pinned ? <Badge>Pinned</Badge> : null}
                </div>
                <p className="text-muted-foreground text-xs">
                  {format(new Date(update.publishedAt), "MMMM d, yyyy")}
                </p>
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {update.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-muted-foreground mt-10 text-center text-sm">
        Looking for official notices?{" "}
        <Link href="/notices" className="text-primary font-medium underline-offset-4 hover:underline">
          View notices
        </Link>
      </p>
    </SitePageShell>
  );
}