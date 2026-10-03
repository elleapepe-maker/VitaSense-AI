import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  title: string;
  headline: string;
  subline?: string;
  emoji?: string;
  filename?: string;
};

export function ShareCard({ title, headline, subline, emoji = "💗", filename = "vitasense-glow" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Saved to your device ✨");
    } catch {
      toast.error("Couldn't save the card");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${filename}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My VitaSense glow", text: headline });
      } else {
        await download();
      }
    } catch {
      /* user cancelled */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="rounded-3xl p-8 text-center relative overflow-hidden gradient-pink"
        style={{ width: "100%", aspectRatio: "1 / 1", maxWidth: 480 }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/30 blur-3xl" />
        <div className="relative h-full flex flex-col justify-between text-white">
          <div className="text-xs font-semibold uppercase tracking-widest opacity-90">VitaSense AI · {title}</div>
          <div className="space-y-3">
            <div className="text-6xl">{emoji}</div>
            <div className="font-display text-3xl font-bold leading-tight">{headline}</div>
            {subline && <div className="text-sm opacity-90">{subline}</div>}
          </div>
          <div className="text-[11px] opacity-80">Haven💫 · vitasense-ellea.lovable.app</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={share} disabled={busy} className="flex-1 flex items-center justify-center gap-2 rounded-2xl gradient-pink text-white font-semibold py-2.5 soft-shadow disabled:opacity-50">
          <Share2 className="w-4 h-4" /> Share
        </button>
        <button onClick={download} disabled={busy} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white/80 border border-white font-semibold py-2.5 disabled:opacity-50">
          <Download className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
}
