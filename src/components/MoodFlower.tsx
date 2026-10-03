type Mood = "Great" | "Good" | "Meh" | "Low" | "Overwhelmed" | null | undefined;

const GOLD = "#F5C445";
const GOLD_DEEP = "#E0A82E";
const PINK = "#F7A8C6";
const PINK_DEEP = "#E58AB0";
const STEM = "#8BB89A";

/**
 * Flower whose colors reflect a mood:
 * - Great: all gold
 * - Good: gold petals with pink center
 * - Meh: gold petals with pink tips + pink center
 * - Low: half of the petals pink + pink center, rest gold
 * - Overwhelmed: entire flower pink, gold stem
 */
export function MoodFlower({ mood, size = 120 }: { mood: Mood; size?: number }) {
  const petalCount = 8;
  const cx = 60;
  const cy = 60;
  const petalRy = 22;
  const petalRx = 11;
  const petalOffset = 26;

  const stemColor = mood === "Overwhelmed" ? GOLD : STEM;

  const petalFill = (i: number): string => {
    if (!mood) return "#E9D8C4";
    if (mood === "Great") return GOLD;
    if (mood === "Good") return GOLD;
    if (mood === "Overwhelmed") return PINK;
    if (mood === "Low") return i % 2 === 0 ? PINK : GOLD;
    return GOLD; // Meh handled with tip gradient
  };

  const petalTip = (i: number): string | null => {
    if (mood === "Meh") return PINK;
    return null;
  };

  const centerFill =
    mood === "Great" ? GOLD_DEEP :
    mood === "Overwhelmed" ? PINK_DEEP :
    mood ? PINK : "#D9C6B0";

  return (
    <svg viewBox="0 0 120 160" width={size} height={size * (160 / 120)} aria-hidden>
      {/* stem */}
      <path
        d={`M60 78 Q 55 110 60 150`}
        stroke={stemColor}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* leaf */}
      <path
        d="M60 115 Q 40 108 32 122 Q 48 128 60 122 Z"
        fill={stemColor}
        opacity="0.85"
      />

      {/* petals */}
      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = (i * 360) / petalCount;
        const tipColor = petalTip(i);
        return (
          <g key={i} transform={`rotate(${angle} ${cx} ${cy})`}>
            <ellipse
              cx={cx}
              cy={cy - petalOffset}
              rx={petalRx}
              ry={petalRy}
              fill={petalFill(i)}
              stroke="white"
              strokeWidth="1.5"
            />
            {tipColor && (
              <ellipse
                cx={cx}
                cy={cy - petalOffset - petalRy * 0.55}
                rx={petalRx * 0.85}
                ry={petalRy * 0.42}
                fill={tipColor}
                opacity="0.95"
              />
            )}
          </g>
        );
      })}

      {/* center */}
      <circle cx={cx} cy={cy} r="14" fill={centerFill} stroke="white" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="6" fill="white" opacity="0.35" />
    </svg>
  );
}
