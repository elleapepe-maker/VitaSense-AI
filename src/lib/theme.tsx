import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Theme = "feminine" | "masculine" | "nonbinary" | "other";

const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; refresh: () => Promise<void> }>({
  theme: "feminine",
  setTheme: () => {},
  refresh: async () => {},
});

export function themeForGender(gender: string | null | undefined): Theme {
  if (!gender) return "feminine";
  const g = gender.trim().toLowerCase();
  if (g === "male" || g === "man") return "masculine";
  if (g === "female" || g === "woman") return "feminine";
  if (g === "non-binary" || g === "nonbinary" || g === "non binary" || g === "enby" || g === "nb") return "nonbinary";
  if (g === "other") return "other";
  return "feminine";
}


export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("feminine");

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("profiles").select("gender").eq("id", u.user.id).maybeSingle();
    setTheme(themeForGender(data?.gender));
  };

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("vitasense:theme-refresh", onRefresh);
    return () => window.removeEventListener("vitasense:theme-refresh", onRefresh);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-masculine", theme === "masculine");
    root.classList.toggle("theme-nonbinary", theme === "nonbinary");
    root.classList.toggle("theme-other", theme === "other");
  }, [theme]);


  return <ThemeCtx.Provider value={{ theme, setTheme, refresh: load }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}

/** Call after updating the user's gender so the theme re-applies immediately. */
export function requestThemeRefresh() {
  window.dispatchEvent(new Event("vitasense:theme-refresh"));
}
