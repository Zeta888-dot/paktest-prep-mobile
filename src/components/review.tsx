import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { useQuiz } from "../store/quiz";

export default function Review() {
  const questions = useQuiz((s) => s.questions);
  const answers = useQuiz((s) => s.answers);
  const reset = useQuiz((s) => s.reset);
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  return (
    <ScrollView className="flex-1 bg-background px-5 pt-6" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      <Text className="text-3xl font-bold text-foreground">Score: {score}/{questions.length}</Text>
      {questions.map((q, i) => {
        const ok = answers[i] === q.correct;
        return (
          <View key={q.id} className={`rounded-2xl border-2 p-4 ${ok ? "border-emerald" : "border-red"}`}>
            <Text className="font-semibold text-foreground">{q.text}</Text>
            <Text className="mt-2 text-emerald">Correct: {q.options[q.correct]}</Text>
            {!ok && <Text className="mt-1 text-red">Your answer: {answers[i] === null ? "Skipped" : q.options[answers[i] as number]}</Text>}
          </View>
        );
      })}
      <Pressable onPress={() => { reset(); router.back(); }} className="items-center rounded-full bg-lime py-4">
        <Text className="text-lg font-bold text-black">Back to Tests</Text>
      </Pressable>
    </ScrollView>
  );
}