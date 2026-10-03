type Mood = "Great" | "Good" | "Meh" | "Low" | "Overwhelmed" | null | undefined;

const GOLD = "#F5C445";
const GOLD_DEEP = "#E0A82E";
const GREEN = "#7BC47F";
const GREEN_DEEP = "#4FA357";
const WHEEL = "#1F2937";

/**
 * Sports car whose colors reflect a mood (masculine theme):
 * - Great: all gold
 * - Good: gold body with green accents
 * - Meh: gold body with green tips (spoiler + bumper)
 * - Low: half gold / half green body
 * - Overwhelmed: fully green body, gold wheels/accents
 */
export function MoodCar({ mood, size = 120 }: { mood: Mood; size?: number }) {
  const bodyMain =
    !mood ? "#E9D8C4" :
    mood === "Great" || mood === "Good" || mood === "Meh" ? GOLD :
    mood === "Low" ? GOLD :
    /* Overwhelmed */ GREEN;

  const bodySecondary =
    !mood ? "#E9D8C4" :
    mood === "Great" ? GOLD :
    mood === "Good" ? GREEN :
    mood === "Meh" ? GOLD :
    mood === "Low" ? GREEN :
    GREEN;

  const accent =
    mood === "Great" ? GOLD_DEEP :
    mood === "Overwhelmed" ? GOLD :
    mood ? GREEN_DEEP : "#D9C6B0";

  const wheelRim = mood === "Overwhelmed" ? GOLD : mood === "Great" ? GOLD_DEEP : "#B5B8BE";
  const windowFill = mood === "Overwhelmed" ? "#C7EBCB" : "#E9F0FF";

  return (
    <svg viewBox="0 0 180 110" width={size} height={size * (110 / 180)} aria-hidden>
      {/* ground shadow */}
      <ellipse cx="90" cy="98" rx="70" ry="5" fill="#000" opacity="0.08" />

      {/* rear half body */}
      <path
        d="M12 78 Q 18 55 42 50 L 90 50 L 90 82 L 20 82 Q 12 82 12 78 Z"
        fill={bodyMain}
        stroke="white"
        strokeWidth="1.5"
      />
      {/* front half body */}
      <path
        d="M90 50 L 130 52 Q 160 55 170 72 L 170 80 Q 170 82 168 82 L 90 82 Z"
        fill={bodySecondary}
        stroke="white"
        strokeWidth="1.5"
      />

      {/* roof/cabin */}
      <path
        d="M45 50 Q 55 30 80 28 L 115 30 Q 128 32 138 52 Z"
        fill={bodySecondary}
        stroke="white"
        strokeWidth="1.5"
      />
      {/* windshield/windows */}
      <path
        d="M55 48 Q 62 34 82 33 L 112 34 Q 122 36 130 48 Z"
        fill={windowFill}
        opacity="0.9"
      />
      <line x1="90" y1="34" x2="90" y2="48" stroke="white" strokeWidth="1.2" />

      {/* spoiler (rear tip) */}
      <rect x="10" y="60" width="10" height="4" rx="1.5" fill={mood === "Meh" ? GREEN : accent} />

      {/* side accent stripe */}
      <rect x="25" y="70" width="140" height="3" fill={accent} opacity="0.85" />

      {/* headlight */}
      <circle cx="163" cy="66" r="4" fill={mood === "Meh" ? GREEN : "#FFF6C2"} stroke="white" strokeWidth="1" />
      {/* taillight */}
      <rect x="14" y="66" width="6" height="5" rx="1" fill={mood === "Overwhelmed" ? GOLD : "#E86A6A"} />

      {/* wheels */}
      {[45, 135].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={86} r="14" fill={WHEEL} />
          <circle cx={cx} cy={86} r="8" fill={wheelRim} />
          <circle cx={cx} cy={86} r="3" fill={WHEEL} />
        </g>
      ))}
    </svg>
  );
}
