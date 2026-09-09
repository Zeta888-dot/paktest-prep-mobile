import { View, Text, Pressable } from "react-native";
import { useQuiz } from "../store/quiz";

export default function Quiz() {
  const questions = useQuiz((s) => s.questions);
  const current = useQuiz((s) => s.current);
  const answers = useQuiz((s) => s.answers);
  const answer = useQuiz((s) => s.answer);
  const next = useQuiz((s) => s.next);
  const q = questions[current];
  const selected = answers[current];

  return (
    <View className="flex-1 bg-background px-5 pt-6">
      <Text className="text-sm text-muted-foreground">Question {current + 1} of {questions.length}</Text>
      <Text className="mt-2 text-xl font-bold text-foreground">{q.text}</Text>
      <View className="mt-6" style={{ gap: 10 }}>
        {q.options.map((opt, i) => (
          <Pressable key={i} onPress={() => answer(i)} className={`rounded-2xl border p-4 ${selected === i ? "bg-lime border-lime" : "bg-card border-border"}`}>
            <Text className={selected === i ? "font-semibold text-black" : "text-foreground"}>{opt}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={next} disabled={selected === null} className={`mt-8 items-center rounded-full py-4 ${selected === null ? "bg-muted" : "bg-lime"}`}>
        <Text className="text-lg font-bold text-black">{current + 1 === questions.length ? "Finish" : "Next"}</Text>
      </Pressable>
    </View>
  );
}