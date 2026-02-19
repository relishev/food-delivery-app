import type { ReactNode } from "react";

// Minimal root layout for /r/[slug] redirect route.
// The user never sees this — server-side redirect fires before any render.
export default function BrandedRedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
