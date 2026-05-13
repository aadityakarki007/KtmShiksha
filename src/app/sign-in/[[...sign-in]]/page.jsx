import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-sky-50 px-4 py-16 dark:from-emerald-950/30 dark:via-background dark:to-sky-950/30">
      <div className="mb-8 text-center">
        <p className="text-primary text-sm font-semibold uppercase tracking-wide">Kathmandu Shikshyalaya</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in to continue</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Use your school account. You&apos;ll choose your dashboard from your profile menu after signing in.
        </p>
      </div>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
