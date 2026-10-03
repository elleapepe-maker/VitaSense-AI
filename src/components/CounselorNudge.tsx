import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { HeartHandshake } from "lucide-react";
import { getCounselorReport } from "@/lib/counselor.functions";

/** Gentle prompt shown only when a whole week of anxiety scores stayed high. */
export function CounselorNudge() {
  const load = useServerFn(getCounselorReport);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("vs_counselor_nudge_dismissed") === "1") return;
    let alive = true;
    load({ data: undefined } as never)
      .then((r) => {
        if (alive && (r as { elevatedWeek: boolean }).elevatedWeek) setShow(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [load]);

  if (!show) return null;

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <HeartHandshake className="w-5 h-5 text-primary" />
        <div className="font-display font-bold text-lg">This week has felt heavy 💗</div>
      </div>
      <p className="text-sm text-muted-foreground">
        Would you like to download your 30-day wellness data to share with your school counselor or a trusted adult?
        You never have to carry this alone.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            localStorage.setItem("vs_counselor_nudge_dismissed", "1");
            setShow(false);
          }}
          className="rounded-2xl py-3 font-semibold bg-white/70 border border-white"
        >
          Not right now
        </button>
        <Link
          to="/counselor"
          className="rounded-2xl py-3 font-semibold text-center gradient-pink text-white soft-shadow"
        >
          See my report 🤝
        </Link>
      </div>
    </div>
  );
}
