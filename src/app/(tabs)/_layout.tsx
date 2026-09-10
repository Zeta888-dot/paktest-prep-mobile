import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import {
  LayoutDashboard,
  FileText,
  Bookmark,
  Upload,
  Settings as SettingsIcon,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";

type IconComponent = typeof LayoutDashboard;

function TabIcon({
  Icon,
  focused,
  isDark,
  theme,
}: {
  Icon: IconComponent;
  focused: boolean;
  isDark: boolean;
  theme: (typeof Colors)["light"];
}) {
  const pillBg = isDark ? theme.primary : theme.foreground;
  const activeIconColor = isDark ? theme.primaryForeground : theme.background;

  return (
    <View
      className="items-center justify-center"
      style={{
        height: 32,
        width: 32,
        borderRadius: 16,
        backgroundColor: focused ? pillBg : "transparent",
      }}
    >
      <Icon
        size={19}
        color={focused ? activeIconColor : theme.mutedForeground}
        strokeWidth={focused ? 2.3 : 2}
      />
    </View>
  );
}

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[isDark ? "dark" : "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? theme.primary : theme.foreground,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.sidebar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={LayoutDashboard} focused={focused} isDark={isDark} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: "Tests",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={FileText} focused={focused} isDark={isDark} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Bookmark} focused={focused} isDark={isDark} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Upload} focused={focused} isDark={isDark} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={SettingsIcon} focused={focused} isDark={isDark} theme={theme} />
          ),
        }}
      />
    </Tabs>
  );
}