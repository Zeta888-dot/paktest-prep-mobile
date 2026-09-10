import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import "../global.css";
import { useSettings } from "../store/settings";
import { useHistory } from "../store/history";
import { useAuth } from "../store/auth";
import { useBookmarks } from "../store/bookmarks";

export default function RootLayout() {
  const load = useSettings((s) => s.load);
  const theme = useSettings((s) => s.theme);
  const loaded = useSettings((s) => s.loaded);
  const { setColorScheme } = useColorScheme();

  const loadHistory = useHistory((s) => s.load);
  const loadAuth = useAuth((s) => s.load);
  const loadBookmarks = useBookmarks((s) => s.load);

  useEffect(() => {
    async function boot() {
      await loadAuth();
      await load();
      await loadHistory();
      await loadBookmarks();
    }
    boot();
  }, [loadAuth, load, loadHistory, loadBookmarks]);

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