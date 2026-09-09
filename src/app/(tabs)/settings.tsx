import { useEffect, useState } from "react";
import {
    Alert,
    Appearance,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { Theme, useSettings } from "../../store/settings";

export default function Settings() {
  const loaded = useSettings((s) => s.loaded);
  const load = useSettings((s) => s.load);
  const update = useSettings((s) => s.update);
  const clearAll = useSettings((s) => s.clearAll);
  const displayName = useSettings((s) => s.displayName);
  const apiKey = useSettings((s) => s.apiKey);
  const questionsPerTest = useSettings((s) => s.questionsPerTest);
  const theme = useSettings((s) => s.theme);

  const [saved, setSaved] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loaded) {
      // Keep local drafts aligned with persisted settings loaded from the store.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApiKeyInput(apiKey);
      setNameInput(displayName);
    }
  }, [loaded, apiKey, displayName]);

  const save = async () => {
    await update({ apiKey: apiKeyInput, displayName: nameInput });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    Alert.alert("Reset App", "This will delete all local data. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => await clearAll(),
      },
    ]);
  };

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="px-5 pt-6">
        <Text className="text-2xl font-bold text-foreground">Settings</Text>

        <View className="mt-6 rounded-2xl border border-border bg-card p-5">
          <Text className="text-lg font-semibold text-foreground">Profile</Text>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="e.g. Zahi"
            placeholderTextColor="#6B6B6B"
            className="mt-3 rounded-xl border border-border bg-background p-3 text-foreground"
          />
        </View>

        <View className="mt-4 rounded-2xl border border-border bg-card p-5">
          <Text className="text-lg font-semibold text-foreground">
            Gemini API Key
          </Text>
          <TextInput
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            placeholder="Paste API key"
            placeholderTextColor="#6B6B6B"
            className="mt-3 rounded-xl border border-border bg-background p-3 text-foreground"
            autoCapitalize="none"
          />
        </View>

        <View className="mt-4 rounded-2xl border border-border bg-card p-5">
          <Text className="text-lg font-semibold text-foreground">
            Questions per test
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {[5, 10, 15, 20, 25].map((q) => (
              <Pressable
                key={q}
                onPress={() => update({ questionsPerTest: q })}
                className={`rounded-xl border px-4 py-2 ${questionsPerTest === q ? "border-primary bg-primary" : "border-border bg-background"}`}
              >
                <Text
                  className={
                    questionsPerTest === q
                      ? "font-bold text-primary-foreground"
                      : "text-foreground"
                  }
                >
                  {q}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-border bg-card p-5">
          <Text className="text-lg font-semibold text-foreground">
            Appearance
          </Text>
          <View className="mt-3 flex-row gap-2">
            {(["dark", "light", "system"] as Theme[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  if (t !== "system") Appearance.setColorScheme(t);
                  update({ theme: t });
                }}
                className={`flex-1 rounded-xl border p-3 items-center ${theme === t ? "border-primary bg-primary" : "border-border bg-background"}`}
              >
                <Text
                  className={`font-semibold capitalize ${theme === t ? "text-primary-foreground" : "text-foreground"}`}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <Pressable
            onPress={reset}
            className="items-center rounded-xl border border-red-500/30 py-3"
          >
            <Text className="font-semibold text-red-500">Reset All Data</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={save}
          className="mt-6 items-center rounded-full bg-primary py-4"
        >
          <Text className="text-lg font-bold text-primary-foreground">
            {saved ? "Saved!" : "Save Changes"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
