import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Colors } from "../../constants/theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, focused, color }: { name: IoniconName; focused: boolean; color: string }) {
  // Web jaisa behavior: active icon filled, inactive outline
  const filled = name.replace("-outline", "") as IoniconName;
  return <Ionicons name={focused ? filled : name} size={22} color={color} />;
}

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.sidebar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tests",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="document-text-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="cloud-upload-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chatbubbles-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bookmark-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings-outline" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}