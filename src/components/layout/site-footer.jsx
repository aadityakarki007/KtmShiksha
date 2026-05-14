import Link from "next/link";
import { MapPin } from "lucide-react";
import { CAMPUS_ADDRESS_INLINE } from "@/lib/school-site";

export function SiteFooter() {
  return (
    <footer className="border-t bg-gradient-to-b from-muted/50 to-muted/30 py-10 dark:from-muted/20 dark:to-muted/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-2">
          <p className="font-semibold">Kathmandu Shikshyalaya</p>
          <p className="text-muted-foreground text-sm">Montessori · Nursery · LKG · UKG · Grades 1–10</p>
          <p className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed">
            <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{CAMPUS_ADDRESS_INLINE}, Nepal</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/contact" className="hover:text-primary text-muted-foreground transition-colors">
            Contact
          </Link>
          <Link href="/admissions" className="hover:text-primary text-muted-foreground transition-colors">
            Admissions
          </Link>
          <Link href="/notices" className="hover:text-primary text-muted-foreground transition-colors">
            Notices
          </Link>
          <Link href="/updates" className="hover:text-primary text-muted-foreground transition-colors">
            Updates
          </Link>
          <Link href="/about" className="hover:text-primary text-muted-foreground transition-colors">
            About
          </Link>
        </div>
      </div>
      <p className="text-muted-foreground mx-auto mt-8 max-w-6xl px-4 text-center text-xs">
        © {new Date().getFullYear()} Kathmandu Shikshyalaya. All rights reserved.
      </p>
    </footer>
  );
}
