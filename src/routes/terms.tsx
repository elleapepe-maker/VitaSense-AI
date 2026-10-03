import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, FileText, ShieldCheck, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — VitaSense AI" },
      { name: "description", content: "The rules and conditions for using VitaSense AI and Haven💫." },
      { property: "og:title", content: "Terms & Conditions — VitaSense AI" },
      { property: "og:description", content: "The rules and conditions for using VitaSense AI and Haven💫." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
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
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: July 23, 2026
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            This page is maintained by the creator of VitaSense AI. By using the app, you agree to these terms. If you have questions, contact{" "}
            <a href="mailto:ellea.pepe@gmail.com" className="text-primary underline">ellea.pepe@gmail.com</a>.
          </p>
        </div>

        <div className="space-y-6">
          <Section title="1. Acceptance of terms" icon={FileText}>
            <p>
              By creating an account or using VitaSense AI, you agree to these Terms & Conditions and our{" "}
              <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>. If you do not agree, please do not use the app.
            </p>
          </Section>

          <Section title="2. Eligibility" icon={ShieldCheck}>
            <p>
              You must be at least 12 years old to use VitaSense AI. If you are under 18, you should use the app with the permission and supervision of a parent or guardian. Accounts belonging to users under 11 years old may be deleted.
            </p>
          </Section>

          <Section title="3. Your account" icon={ShieldCheck}>
            <p>
              You are responsible for keeping your account credentials safe. You may update your profile or delete your account at any time from the Profile page. Deleting your account will remove your personal data and wellness history from active systems, subject to reasonable retention for legal or security purposes.
            </p>
          </Section>

          <Section title="4. Acceptable use" icon={ShieldCheck}>
            <p>
              VitaSense AI is meant to be a supportive, judgement-free space. Please do not use the app to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-2">
              <li>Harass, abuse, or spam other users.</li>
              <li>Share harmful, illegal, or hateful content.</li>
              <li>Impersonate someone else or create fake accounts.</li>
              <li>Attempt to access or interfere with other users' accounts or the app's systems.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              We may suspend or remove accounts that violate these rules.
            </p>
          </Section>

          <Section title="5. Haven💫 and AI-generated content" icon={Heart}>
            <p>
              Haven💫 is an AI companion designed to be warm, encouraging, and gentle. It is not a doctor, therapist, or medical professional. Any suggestions, insights, or responses from Haven💫 are for informational and wellness support only and should not be taken as medical advice, diagnosis, or treatment.
            </p>
            <p className="text-muted-foreground mt-3">
              If you are experiencing a medical emergency, severe symptoms, or thoughts of harming yourself or others, please contact emergency services or a qualified professional immediately. The app includes crisis resources if you type something urgent.
            </p>
          </Section>

          <Section title="6. Subscriptions and payments" icon={FileText}>
            <p>
              Premium features may be offered through the app. Some premium access is reserved for the creator of VitaSense AI. Where paid subscriptions are available, they are processed through Stripe and are subject to Stripe's terms and the pricing shown in the app.
            </p>
            <p className="text-muted-foreground mt-3">
              You can manage or cancel your subscription from the Profile page or through the payment portal.
            </p>
          </Section>

          <Section title="7. Intellectual property" icon={ShieldCheck}>
            <p>
              VitaSense AI, Haven💫, and the app's design, graphics, and content are owned by creator Ellea Pepe. You may not copy, reproduce, or redistribute the app or its code without permission. Your own journal entries and wellness data belong to you.
            </p>
          </Section>

          <Section title="8. Limitation of liability" icon={AlertCircle}>
            <p>
              To the fullest extent allowed by law, the creator of VitaSense AI is not liable for any direct, indirect, incidental, or consequential damages resulting from your use of the app, including reliance on AI-generated guidance or wellness recommendations.
            </p>
            <p className="text-muted-foreground mt-3">
              The app is provided "as is" without warranties of any kind. We do our best to keep things running smoothly, but we do not guarantee uninterrupted access or perfect accuracy.
            </p>
          </Section>

          <Section title="9. Changes to these terms" icon={FileText}>
            <p>
              We may update these Terms & Conditions from time to time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the app after changes means you accept the updated terms.
            </p>
          </Section>

          <Section title="10. Contact" icon={Heart}>
            <p>
              Questions about these terms? Email{" "}
              <a href="mailto:ellea.pepe@gmail.com" className="text-primary underline">ellea.pepe@gmail.com</a>.
            </p>
          </Section>
        </div>

        <div className="mt-10 text-center">
          <Link to="/privacy" className="text-primary underline text-sm font-semibold">
            Read our Privacy Policy
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
