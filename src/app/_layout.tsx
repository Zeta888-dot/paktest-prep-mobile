import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import "../global.css";
import { useSettings } from "../store/settings";

export default function RootLayout() {
  const load = useSettings((s) => s.load);
  const theme = useSettings((s) => s.theme);
  const loaded = useSettings((s) => s.loaded);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loaded) {
      if (theme === "system") {
        setColorScheme("system");
      } else {
        setColorScheme(theme);
      }
    }
  }, [loaded, setColorScheme, theme]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
