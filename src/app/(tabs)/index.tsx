import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";

const exams = [
  { id: "police-constable", name: "Police Constable" },
  { id: "clerk", name: "Clerk" },
  { id: "mdcat", name: "MDCAT" },
  { id: "ecat", name: "ECAT" },
  { id: "css", name: "CSS" },
];

export default function Tests() {
  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-6 pb-4">
        <Text className="text-2xl font-bold text-foreground">PakTest Prep</Text>
        <View className="h-9 w-9 items-center justify-center rounded-full bg-lime">
          <Text className="text-lg font-bold text-black">P</Text>
        </View>
      </View>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        {exams.map((e) => (
          <Pressable key={e.id} onPress={() => router.push({ pathname: "/test/[id]", params: { id: e.id } })} className="rounded-2xl bg-card border border-border p-4">
            <Text className="text-lg font-semibold text-foreground">{e.name}</Text>
            <Text className="text-sm text-muted-foreground">Mock tests aur Part B prep</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}