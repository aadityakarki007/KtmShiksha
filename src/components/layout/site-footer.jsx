import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">Kathmandu Shikshyalaya</p>
          <p className="text-muted-foreground text-sm">
            Montessori · Nursery · LKG · UKG · Grades 1–10
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/contact" className="hover:text-primary text-muted-foreground">
            Contact
          </Link>
          <Link href="/admissions" className="hover:text-primary text-muted-foreground">
            Admissions
          </Link>
          <Link href="/notices" className="hover:text-primary text-muted-foreground">
            Notices
          </Link>
        </div>
      </div>
      <p className="text-muted-foreground mx-auto mt-8 max-w-6xl px-4 text-center text-xs">
        © {new Date().getFullYear()} Kathmandu Shikshyalaya. All rights reserved.
      </p>
    </footer>
  );
}
