export type Ritual = {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  moods: string[]; // which moods this suits
  steps: string[];
  closer: string;
};

export const RITUALS: Ritual[] = [
  {
    id: "box-breath",
    title: "Box Breathing",
    emoji: "🌬️",
    minutes: 2,
    moods: ["Overwhelmed", "Low", "Meh"],
    steps: [
      "Sit comfortably and soften your shoulders.",
      "Breathe in through your nose for 4 counts.",
      "Hold gently for 4.",
      "Exhale for 4. Hold empty for 4.",
      "Repeat 4 rounds.",
    ],
    closer: "You just gave your nervous system a real gift. 💗",
  },
  {
    id: "five-senses",
    title: "5-4-3-2-1 Grounding",
    emoji: "✨",
    minutes: 2,
    moods: ["Overwhelmed", "Low"],
    steps: [
      "Notice 5 things you can see.",
      "4 things you can touch.",
      "3 things you can hear.",
      "2 things you can smell (or like the smell of).",
      "1 thing you can taste — or one thing you're grateful for.",
    ],
    closer: "You're here, right now. That's enough. 🌸",
  },
  {
    id: "gratitude-3",
    title: "Three Tiny Thanks",
    emoji: "💗",
    minutes: 1,
    moods: ["Good", "Great", "Meh"],
    steps: [
      "Take one slow breath.",
      "Name one small thing today that felt kind.",
      "Name one person you're glad exists.",
      "Name one thing your body did for you today.",
    ],
    closer: "Gratitude is a muscle — and yours just flexed. ✨",
  },
  {
    id: "stretch-flow",
    title: "Gentle Stretch",
    emoji: "🌿",
    minutes: 2,
    moods: ["Meh", "Low", "Good"],
    steps: [
      "Roll your shoulders back 5 times, slowly.",
      "Reach up tall, then side-bend left and right.",
      "Fold forward and let your head hang for 3 breaths.",
      "Neck circles — 3 each way.",
    ],
    closer: "Movement is a love letter to your body. 💫",
  },
  {
    id: "self-hug",
    title: "Butterfly Hug",
    emoji: "🦋",
    minutes: 2,
    moods: ["Overwhelmed", "Low"],
    steps: [
      "Cross your arms over your chest.",
      "Tap your shoulders gently, left-right-left-right.",
      "Breathe slowly while you tap.",
      "Whisper: 'I'm safe right now.'",
      "Continue for a minute or two.",
    ],
    closer: "You just gave yourself the softest hug. 🌸",
  },
  {
    id: "journal-one",
    title: "One-Line Journal",
    emoji: "📓",
    minutes: 2,
    moods: ["Good", "Great", "Meh", "Low"],
    steps: [
      "Grab something to write on.",
      "Finish this: 'Right now, I feel ___ because ___.'",
      "Then: 'One thing I want to remember about today is ___.'",
    ],
    closer: "Every honest sentence is a small act of self-care. ✨",
  },
  {
    id: "cold-splash",
    title: "Cool Water Reset",
    emoji: "💧",
    minutes: 1,
    moods: ["Overwhelmed"],
    steps: [
      "Walk to a sink.",
      "Splash cool water on your wrists and face.",
      "Take 3 slow breaths.",
      "Notice how the world feels a little clearer.",
    ],
    closer: "A tiny reset can shift everything. 💫",
  },
  {
    id: "hum",
    title: "Humming Wave",
    emoji: "🎵",
    minutes: 2,
    moods: ["Overwhelmed", "Meh", "Low"],
    steps: [
      "Take a normal breath in.",
      "Hum on the exhale as long as feels good.",
      "Repeat 6 times.",
      "Feel the buzz in your chest — it calms the vagus nerve.",
    ],
    closer: "Your body already knows how to soothe itself. 🌿",
  },
];

export function ritualForMood(mood: string | null | undefined, doneToday: string[] = []): Ritual {
  const pool = RITUALS.filter((r) => (!mood || r.moods.includes(mood)) && !doneToday.includes(r.id));
  const list = pool.length > 0 ? pool : RITUALS.filter((r) => !doneToday.includes(r.id));
  const final = list.length > 0 ? list : RITUALS;
  const seed = new Date().getDate() + new Date().getHours();
  return final[seed % final.length];
}
