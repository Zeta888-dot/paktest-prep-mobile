import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuiz, Question } from "../../store/quiz";
import Quiz from "../../components/quiz";
import Review from "../../components/review";

const DUMMY: Question[] = [
  { id: "q1", text: "What is the capital of Pakistan?", options: ["Lahore", "Karachi", "Islamabad", "Quetta"], correct: 2 },
  { id: "q2", text: "2 + 2 x 3 = ?", options: ["12", "8", "10", "6"], correct: 1 },
];

export default function TestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const phase = useQuiz((s) => s.phase);
  const start = useQuiz((s) => s.start);

  if (phase === "quiz") return <Quiz />;

  if (phase === "review") return <Review />;

  return (
    <View className="flex-1 justify-center bg-background px-5">
      <Text className="text-3xl font-bold text-foreground capitalize">{id}</Text>
      <Text className="mt-2 text-muted-foreground">{DUMMY.length} questions | 5 min | AI generated</Text>
      <Pressable onPress={() => start(DUMMY)} className="mt-8 items-center rounded-full bg-lime py-4">
        <Text className="text-lg font-bold text-black">Start Test</Text>
      </Pressable>
    </View>
  );
}