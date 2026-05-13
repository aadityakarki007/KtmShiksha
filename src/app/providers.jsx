"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }) {
  return (
    <ClerkProvider>
      {children}
      <Toaster richColors closeButton />
    </ClerkProvider>
  );
}
