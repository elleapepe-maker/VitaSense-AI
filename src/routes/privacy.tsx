import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShieldCheck, Lock, FileText } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — VitaSense AI" },
      { name: "description", content: "How VitaSense AI collects, uses, and protects your personal information and wellness data." },
      { property: "og:title", content: "Privacy Policy — VitaSense AI" },
      { property: "og:description", content: "How VitaSense AI collects, uses, and protects your personal information and wellness data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl gradient-pink flex items-center justify-center soft-shadow">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl">VitaSense AI</span>
        </Link>
        <Link to="/" className="rounded-full px-5 py-2 text-sm font-semibold bg-white/70 backdrop-blur border border-white hover:bg-white transition">
          Back home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="glass-card p-8 md:p-10 mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-pink flex items-center justify-center soft-shadow mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: July 23, 2026
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            This page is maintained by the creator of VitaSense AI to explain how the app handles your information. If you have questions, contact{" "}
            <a href="mailto:ellea.pepe@gmail.com" className="text-primary underline">ellea.pepe@gmail.com</a>.
          </p>
        </div>

        <div className="space-y-6">
          <Section title="1. Overview" icon={Lock}>
            <p>
              VitaSense AI is a gentle wellness companion app. Your journal entries, mood notes, and chat messages are meant to stay private to you. This policy describes what information we collect, why we collect it, and the choices you have.
            </p>
          </Section>

          <Section title="2. Information we collect" icon={FileText}>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong>Account information:</strong> email address, display name, and chosen avatar when you sign up.</li>
              <li><strong>Profile information:</strong> gender, hobbies, daily routine, activities, and other onboarding answers you choose to share.</li>
              <li><strong>Wellness data:</strong> mood and anxiety check-ins, symptom session notes, daily schedule inputs (water, sleep, movement, meals, screen time), and ritual completions.</li>
              <li><strong>Haven💫 chat and voice messages:</strong> text messages and voice audio you send to Haven are processed so the AI can respond. Voice audio is transcribed and not stored permanently unless needed for the active conversation.</li>
              <li><strong>Friend connections:</strong> friend requests, accepted friendships, and shared streak activity.</li>
              <li><strong>Reviews:</strong> optional star ratings and written reviews you choose to submit.</li>
              <li><strong>Technical data:</strong> device/browser type, approximate usage data, and authentication tokens needed to keep you signed in.</li>
            </ul>
          </Section>

          <Section title="3. How we use your information" icon={Heart}>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>To provide the app features: Haven💫 chat, mood tracking, symptom guidance, daily rituals, weekly reports, and friend streaks.</li>
              <li>To personalize tips, quotes, and rituals based on your profile, preferences, and history.</li>
              <li>To send gentle, contextual reminders about water, movement, and mood check-ins (only if you opt in via your device notification settings).</li>
              <li>To improve the app and fix issues.</li>
            </ul>
          </Section>

          <Section title="4. AI and service providers" icon={ShieldCheck}>
            <p className="text-muted-foreground">
              VitaSense AI uses third-party services to run the app. These providers may process your data only as needed to perform their services:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-2">
              <li><strong>Lovable Cloud / Supabase</strong> — hosts the database, authentication, and storage.</li>
              <li><strong>AI provider(s)</strong> — powers Haven💫 chat, voice transcription, and weekly insights through the Lovable AI Gateway.</li>
              <li><strong>Stripe</strong> — handles subscription payments where applicable.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              We do not sell your personal information or wellness data to advertisers.
            </p>
          </Section>

          <Section title="5. Your choices and rights" icon={Lock}>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>You can update your profile, gender, and theme preferences in the app.</li>
              <li>You can delete your account from the Profile page; this removes your personal profile and associated check-in data.</li>
              <li>You can turn off or manage browser/push notifications in your device settings.</li>
              <li>You can request a copy of your data or ask questions by emailing <a href="mailto:ellea.pepe@gmail.com" className="text-primary underline">ellea.pepe@gmail.com</a>.</li>
            </ul>
          </Section>

          <Section title="6. Data retention" icon={FileText}>
            <p className="text-muted-foreground">
              We keep your account and wellness data while your account is active. If you delete your account, personal data is removed from active systems within a reasonable period, typically within 90 days, except where we need to retain it for legal or security purposes.
            </p>
          </Section>

          <Section title="7. Security" icon={ShieldCheck}>
            <p className="text-muted-foreground">
              We use standard safeguards to protect your data, including encrypted connections, authentication, and database access controls. No service can guarantee perfect security, so please keep your password safe and use a strong, unique password.
            </p>
          </Section>

          <Section title="8. Children's privacy" icon={Lock}>
            <p className="text-muted-foreground">
              VitaSense AI is not intended for users under 13. If you believe a child under 13 has created an account, please contact us at{" "}
              <a href="mailto:ellea.pepe@gmail.com" className="text-primary underline">ellea.pepe@gmail.com</a>{" "}
              so we can delete the account.
            </p>
          </Section>

          <Section title="9. Important wellness disclaimer" icon={Heart}>
            <p className="text-muted-foreground">
              VitaSense AI and Haven💫 are supportive wellness tools, not healthcare providers. The app does not diagnose, treat, or replace medical advice. If you are in crisis or experiencing symptoms that feel serious, please contact a medical professional or emergency services. Crisis resources are available in the app if you type something urgent.
            </p>
          </Section>

          <Section title="10. Changes to this policy" icon={FileText}>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of VitaSense AI after changes means you accept the updated policy.
            </p>
          </Section>
        </div>

        <div className="mt-10 text-center">
          <Link to="/terms" className="text-primary underline text-sm font-semibold">
            Read our Terms & Conditions
          </Link>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 pb-12 text-center text-sm text-muted-foreground">
        <div className="glass-card p-6">
          © {new Date().getFullYear()} VitaSense AI · Creator: Ellea Pepe ·{" "}
          <Link to="/privacy" className="text-primary underline">Privacy</Link> ·{" "}
          <Link to="/terms" className="text-primary underline">Terms</Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Heart; children: ReactNode }) {
  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl gradient-lavender flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}
