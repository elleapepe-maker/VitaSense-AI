import { MoodFlower } from "./MoodFlower";
import { MoodCar } from "./MoodCar";
import { useTheme } from "@/lib/theme";

type Mood = "Great" | "Good" | "Meh" | "Low" | "Overwhelmed" | null | undefined;

/** Renders a flower or a sports car depending on the user's theme. */
export function MoodBloom({ mood, size = 120 }: { mood: Mood; size?: number }) {
  const { theme } = useTheme();
  if (theme === "masculine") return <MoodCar mood={mood} size={size} />;
  return <MoodFlower mood={mood} size={size} />;
}
