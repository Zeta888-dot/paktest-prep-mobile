import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Filter,
  Play,
  RotateCcw,
  Search,
  Trash2,
  Trophy,
  XCircle,
} from "lucide-react-native";
import { useBookmarks } from "../../store/bookmarks";
import { Colors } from "../../constants/theme";

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

export default function Saved() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[isDark ? "dark" : "light"];

  const list = useBookmarks((s) => s.saved);
  const removeOne = useBookmarks((s) => s.remove);

  const [query, setQuery] = useState("");
  const [selectedTest, setSelectedTest] = useState("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [practice, setPractice] = useState(false);
  const [pIndex, setPIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const practicable = useMemo(() => list.filter((b) => b.options && b.answer), [list]);
  const tests = useMemo(() => Array.from(new Set(list.map((b) => b.test))), [list]);

  const filtered = useMemo(() => {
    return list.filter((b) => {
      const matchQuery = b.question.toLowerCase().includes(query.toLowerCase());
      const matchTest = selectedTest === "all" || b.test === selectedTest;
      return matchQuery && matchTest;
    });
  }, [list, query, selectedTest]);

  const filteredPracticable = useMemo(() => {
    return practicable.filter((b) => selectedTest === "all" || b.test === selectedTest);
  }, [practicable, selectedTest]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkDelete() {
    selected.forEach((id) => removeOne(id));
    setSelected(new Set());
    setSelectMode(false);
  }

  function startPractice() {
    if (filteredPracticable.length === 0) return;
    setPractice(true);
    setPIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  }

  const q = filteredPracticable[pIndex];

  function pick(opt: string) {
    if (picked || !q) return;
    setPicked(opt);
    if (opt === q.answer) setScore((s) => s + 1);
  }

  function next() {
    if (pIndex + 1 >= filteredPracticable.length) setFinished(true);
    else {
      setPIndex(pIndex + 1);
      setPicked(null);
    }
  }

  // ---------- Practice results ----------
  if (practice && finished) {
    const pct = filteredPracticable.length ? Math.round((score / filteredPracticable.length) * 100) : 0;
    const passed = pct >= 60;
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="overflow-hidden rounded-3xl border border-border bg-card">
          <View className={`items-center px-6 py-10 ${passed ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
            <View className={`h-16 w-16 items-center justify-center rounded-2xl ${passed ? "bg-emerald-500" : "bg-red-500"}`}>
              <Trophy size={30} color="#FFFFFF" />
            </View>
            <Text className="mt-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Revision Complete</Text>
            <Text className="mt-2 text-3xl font-bold text-foreground">{score}/{filteredPracticable.length}</Text>
            <Text className="mt-2 text-sm text-muted-foreground">{pct}% accuracy</Text>
            <View className={`mt-4 rounded-full border px-3 py-1 ${passed ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}>
              <Text className={`text-[10px] font-bold ${passed ? "text-emerald-500" : "text-red-500"}`}>
                {passed ? "PASSED" : "KEEP PRACTICING"}
              </Text>
            </View>
          </View>
          <View className="flex-row border-t border-border">
            <View className="flex-1 items-center border-r border-border p-4">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Correct</Text>
              <Text className="mt-1 text-2xl font-bold text-foreground">{score}</Text>
            </View>
            <View className="flex-1 items-center border-r border-border p-4">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Total</Text>
              <Text className="mt-1 text-2xl font-bold text-foreground">{filteredPracticable.length}</Text>
            </View>
            <View className="flex-1 items-center p-4">
              <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Wrong</Text>
              <Text className="mt-1 text-2xl font-bold text-foreground">{filteredPracticable.length - score}</Text>
            </View>
          </View>
        </View>

        <View className="mt-6 flex-row justify-center gap-3">
          <Pressable onPress={startPractice} className="flex-row items-center gap-2 rounded-full bg-primary px-5 py-3">
            <RotateCcw size={14} color={theme.primaryForeground} />
            <Text className="text-sm font-semibold text-primary-foreground">Practice Again</Text>
          </Pressable>
          <Pressable onPress={() => setPractice(false)} className="rounded-full border border-border px-5 py-3">
            <Text className="text-sm font-semibold text-foreground">Back to Saved</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ---------- Practice mode (active question) ----------
  if (practice && q) {
    const answered = picked !== null;
    const isCorrect = picked === q.answer;
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="mb-6 flex-row items-center gap-3">
          <Pressable onPress={() => setPractice(false)} className="h-9 w-9 items-center justify-center rounded-full border border-border">
            <XCircle size={16} color={theme.mutedForeground} />
          </Pressable>
          <View className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <View className="h-full rounded-full bg-primary" style={{ width: `${((pIndex + (answered ? 1 : 0)) / filteredPracticable.length) * 100}%` }} />
          </View>
          <View className="rounded-full border border-border bg-card px-3 py-1">
            <Text className="text-xs font-bold text-foreground">{pIndex + 1}/{filteredPracticable.length}</Text>
          </View>
        </View>

        <View className="rounded-2xl border border-border bg-card p-5">
          <View className="self-start rounded-full bg-secondary px-3 py-1">
            <Text className="text-[9px] font-bold uppercase tracking-wider text-secondary-foreground">{q.test}</Text>
          </View>
          <Text className="mt-4 text-lg font-semibold leading-6 text-foreground">{q.question}</Text>

          <View className="mt-5 gap-2">
            {(q.options ?? []).map((opt, j) => {
              const isPick = picked === opt;
              const isAns = opt === q.answer;
              let border = "border-border";
              let bg = "bg-background";
              let textColor = "text-foreground";
              if (answered && isAns) {
                border = "border-emerald-500";
                bg = "bg-emerald-500/10";
              } else if (answered && isPick && !isAns) {
                border = "border-red-500";
                bg = "bg-red-500/10";
              } else if (answered) {
                textColor = "text-muted-foreground";
              }
              return (
                <Pressable
                  key={j}
                  onPress={() => pick(opt)}
                  disabled={answered}
                  className={`flex-row items-center gap-3 rounded-2xl border px-4 py-3 ${border} ${bg}`}
                >
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-lg ${
                      answered && isAns ? "bg-emerald-500" : answered && isPick && !isAns ? "bg-red-500" : "bg-muted"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${answered && (isAns || isPick) ? "text-white" : "text-muted-foreground"}`}>
                      {String.fromCharCode(65 + j)}
                    </Text>
                  </View>
                  <Text className={`flex-1 text-sm ${textColor}`}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>

          {answered && (
            <View className={`mt-5 rounded-2xl border p-4 ${isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  {isCorrect ? <CheckCircle2 size={20} color="#10B981" /> : <XCircle size={20} color="#EF4444" />}
                  <Text className={`font-semibold ${isCorrect ? "text-emerald-500" : "text-red-500"}`}>
                    {isCorrect ? "Correct!" : "Wrong!"}
                  </Text>
                </View>
                <Pressable onPress={next} className="flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-2.5">
                  <Text className="text-xs font-semibold text-primary-foreground">
                    {pIndex + 1 >= filteredPracticable.length ? "Finish" : "Next"}
                  </Text>
                  <ArrowRight size={13} color={theme.primaryForeground} />
                </Pressable>
              </View>
              {q.explanation && (
                <Text className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{q.explanation}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // ---------- List ----------
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">Saved Questions</Text>
          <Text className="mt-1.5 text-sm text-muted-foreground">Review bookmarked questions.</Text>
        </View>
        <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Bookmark size={16} color={theme.primaryForeground} />
          </View>
          <View>
            <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Total</Text>
            <Text className="text-sm font-semibold text-foreground">{list.length}</Text>
          </View>
        </View>
      </View>

      {list.length > 0 && (
        <>
          <View className="mt-5 flex-row items-center gap-3 rounded-full border border-border bg-card px-4">
            <Search size={14} color={theme.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search saved questions..."
              placeholderTextColor={theme.mutedForeground}
              className="flex-1 py-3 text-sm text-foreground"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row items-center gap-2">
              <Filter size={13} color={theme.mutedForeground} />
              <Pressable
                onPress={() => setSelectedTest("all")}
                className={`rounded-full border px-3 py-1.5 ${selectedTest === "all" ? "border-primary bg-primary" : "border-border"}`}
              >
                <Text className={`text-xs font-semibold ${selectedTest === "all" ? "text-primary-foreground" : "text-muted-foreground"}`}>All</Text>
              </Pressable>
              {tests.map((test) => (
                <Pressable
                  key={test}
                  onPress={() => setSelectedTest(test)}
                  className={`rounded-full border px-3 py-1.5 ${selectedTest === test ? "border-primary bg-primary" : "border-border"}`}
                >
                  <Text className={`text-xs font-semibold ${selectedTest === test ? "text-primary-foreground" : "text-muted-foreground"}`} numberOfLines={1}>
                    {test.split(" ")[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">{filtered.length} questions</Text>
            <View className="flex-row gap-2">
              {filteredPracticable.length > 0 && !selectMode && (
                <Pressable onPress={startPractice} className="flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-2.5">
                  <Play size={13} color={theme.primaryForeground} />
                  <Text className="text-xs font-semibold text-primary-foreground">Practice ({filteredPracticable.length})</Text>
                </Pressable>
              )}
              {selectMode && selected.size > 0 ? (
                <Pressable onPress={bulkDelete} className="flex-row items-center gap-1.5 rounded-full border border-red-500/30 px-4 py-2.5">
                  <Trash2 size={13} color="#EF4444" />
                  <Text className="text-xs font-semibold text-red-500">Delete ({selected.size})</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    setSelectMode(!selectMode);
                    setSelected(new Set());
                  }}
                  className="rounded-full border border-border px-4 py-2.5"
                >
                  <Text className="text-xs font-semibold text-foreground">{selectMode ? "Cancel" : "Select"}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </>
      )}

      {filtered.length === 0 ? (
        <View className="mt-8 items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14">
          <View className="h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary">
            <Bookmark size={18} color={theme.mutedForeground} />
          </View>
          <Text className="mt-4 text-lg font-bold text-foreground">
            {query || selectedTest !== "all" ? "No matches found" : "No saved questions yet"}
          </Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            {query || selectedTest !== "all"
              ? "Try a different search or filter."
              : "Bookmark tricky questions during practice and they'll appear here."}
          </Text>
          {!query && selectedTest === "all" && (
            <Pressable onPress={() => router.push("/tests")} className="mt-4 flex-row items-center gap-2 rounded-full bg-primary px-4 py-2.5">
              <Text className="text-sm font-semibold text-primary-foreground">Browse Tests</Text>
              <ArrowRight size={14} color={theme.primaryForeground} />
            </Pressable>
          )}
        </View>
      ) : (
        <View className="mt-4 gap-2">
          {filtered.map((b) => (
            <View
              key={b.id}
              className={`flex-row items-start justify-between gap-3 rounded-2xl border bg-card px-4 py-3.5 ${
                selectMode && selected.has(b.id) ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              {selectMode && (
                <Pressable
                  onPress={() => toggleSelect(b.id)}
                  className={`h-6 w-6 items-center justify-center rounded-lg border ${selected.has(b.id) ? "border-primary bg-primary" : "border-border bg-background"}`}
                >
                  {selected.has(b.id) && <CheckCircle2 size={14} color={theme.primaryForeground} />}
                </Pressable>
              )}
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">{b.question}</Text>
                <View className="mt-2 flex-row flex-wrap items-center gap-2">
                  <View className="rounded-full bg-secondary px-2.5 py-0.5">
                    <Text className="text-[9px] font-bold text-secondary-foreground">{b.test}</Text>
                  </View>
                  <Text className="text-[9px] text-muted-foreground">{timeAgo(b.savedAt)}</Text>
                </View>
              </View>
              {!selectMode && (
                <Pressable onPress={() => removeOne(b.id)} className="rounded-full p-2">
                  <Trash2 size={15} color={theme.mutedForeground} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}