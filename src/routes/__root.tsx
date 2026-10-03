import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { applyPrefs } from "@/lib/appearance";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md text-center p-10">
        <div className="text-6xl mb-3">🌸</div>
        <h1 className="text-5xl font-display text-gradient-pink">404</h1>
        <p className="mt-3 text-muted-foreground">This page took a rest day.</p>
        <Link to="/" className="mt-6 inline-block rounded-full gradient-pink px-6 py-2.5 font-semibold soft-shadow">
          Back home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md text-center p-10">
        <h1 className="font-display text-2xl">Something wobbled 💗</h1>
        <p className="mt-2 text-sm text-muted-foreground">Take a breath — we can try that again.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full gradient-pink px-6 py-2.5 font-semibold soft-shadow"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VitaSense AI — AI wellness companion & Haven💫 chat" },
      { name: "description", content: "VitaSense AI pairs Haven💫 — a warm, judgement-free AI companion — with mood, anxiety and symptom check-ins in one softly pink, mindful little app." },
      { name: "author", content: "VitaSense AI" },
      { name: "keywords", content: "VitaSense AI, wellness app, AI health companion, mood check in, anxiety support, Haven chat" },
      { property: "og:title", content: "VitaSense AI — AI wellness companion & Haven💫 chat" },
      { property: "og:description", content: "Haven💫 chat, AI symptom guidance, and gentle mood check-ins in one calm little app." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://vitasense-ellea.lovable.app" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#f9a8c4" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "VitaSense AI" },
      {
        name: "google-site-verification",
        content: "a25dd71f6b68b612",
      },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "VitaSense AI",
          "applicationCategory": "HealthApplication",
          "url": "https://vitasense-ellea.lovable.app",
          "description": "VitaSense AI pairs Haven💫 — a warm, judgement-free AI companion — with mood, anxiety and symptom check-ins in one softly pink, mindful little app.",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
          },
          "author": {
            "@type": "Person",
            "name": "Ellea Pepe",
          },
        },
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/app-icon.png" },
      { rel: "apple-touch-icon", href: "/app-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "canonical", href: "https://vitasense-ellea.lovable.app" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Nunito:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  // Offline support: cache the app shell so VitaSense opens without signal.
  useEffect(() => {
    applyPrefs();
    if (!("serviceWorker" in navigator)) return;
    const id = window.setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }, 1200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
