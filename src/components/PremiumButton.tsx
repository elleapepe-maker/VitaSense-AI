import { useState } from "react";
import { Crown } from "lucide-react";
import { PremiumDialog } from "./PremiumDialog";
import { useSubscription } from "@/hooks/useSubscription";

export function PremiumButton() {
  const [open, setOpen] = useState(false);
  const { isActive } = useSubscription();
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`rounded-full p-2 border border-white transition ${isActive ? "gradient-pink text-white" : "bg-white/70 hover:bg-white"}`}
        aria-label={isActive ? "Premium" : "Unlock Premium"}
        title={isActive ? "Premium" : "Unlock Premium"}
      >
        <Crown className="w-4 h-4" />
      </button>
      <PremiumDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
