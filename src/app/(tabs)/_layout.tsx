import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#a3e635",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: { backgroundColor: "#000000", borderTopColor: "#262626" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Tests", tabBarIcon: ({ color }) => <Ionicons name="clipboard-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="upload" options={{ title: "Upload", tabBarIcon: ({ color }) => <Ionicons name="cloud-upload-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="forum" options={{ title: "Forum", tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="saved" options={{ title: "Saved", tabBarIcon: ({ color }) => <Ionicons name="bookmark-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} /> }} />
    </Tabs>
  );
}