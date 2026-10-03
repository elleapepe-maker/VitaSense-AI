import { LifeBuoy, Phone, MessageSquare, Globe } from "lucide-react";

// Simple, conservative keyword sweep. False positives are OK — we'd rather
// gently surface help than miss someone.
const CRISIS_PATTERNS = [
  /suicid/i,
  /kill\s+myself/i,
  /kill\s+me/i,
  /end\s+(it|my\s+life)/i,
  /don'?t\s+want\s+to\s+(live|be\s+here|be\s+alive)/i,
  /want\s+to\s+die/i,
  /hurt\s+myself/i,
  /harm\s+myself/i,
  /self[\s-]?harm/i,
  /cut(ting)?\s+myself/i,
  /can'?t\s+(go\s+on|do\s+this\s+anymore|keep\s+going)/i,
  /no\s+reason\s+to\s+live/i,
  /better\s+off\s+(dead|without\s+me)/i,
];

export function detectCrisis(text: string): boolean {
  if (!text) return false;
  return CRISIS_PATTERNS.some((p) => p.test(text));
}

export function CrisisCare({ compact = false }: { compact?: boolean }) {
  return (
    <div className="glass-card p-5 border-2 border-primary/40">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl gradient-pink flex items-center justify-center soft-shadow shrink-0">
          <LifeBuoy className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold text-lg">You are not alone 💗</div>
          <p className="text-sm text-muted-foreground mt-1">
            If you're having thoughts of hurting yourself or in a mental-health crisis, please reach out — real, kind humans are ready to listen right now.
          </p>
          <div className="mt-3 space-y-2">
            <a href="tel:988" className="flex items-center gap-2 rounded-2xl bg-white/80 border border-white px-3 py-2 text-sm font-semibold hover:bg-white transition">
              <Phone className="w-4 h-4 text-primary" />
              Call or text <span className="text-gradient-pink">988</span> — Suicide & Crisis Lifeline (US)
            </a>
            <a href="sms:741741&body=HOME" className="flex items-center gap-2 rounded-2xl bg-white/80 border border-white px-3 py-2 text-sm font-semibold hover:bg-white transition">
              <MessageSquare className="w-4 h-4 text-primary" />
              Text <span className="text-gradient-pink">HOME to 741741</span> — Crisis Text Line
            </a>
            <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl bg-white/80 border border-white px-3 py-2 text-sm font-semibold hover:bg-white transition">
              <Globe className="w-4 h-4 text-primary" />
              International helplines — findahelpline.com
            </a>
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-3">
              If you or someone else is in immediate danger, please call your local emergency number.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
