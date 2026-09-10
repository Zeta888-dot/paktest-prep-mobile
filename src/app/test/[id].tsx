import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import Svg, { Circle } from "react-native-svg";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flag,
  FolderOpen,
  Home,
  PenLine,
  RotateCcw,
  Timer,
  Trophy,
  X,
  XCircle,
  BookOpen,
} from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { getSyllabus, Subject } from "../../lib/syllabus";
import { apiFetch } from "../../lib/api";
import { useHistory } from "../../store/history";
import { useBookmarks } from "../../store/bookmarks";
import { useSettings } from "../../store/settings";

type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

function stripHtml(text: string) {
  return text.replace(/<\/?[^>]+(>|$)/g, "");
}

function CircularTimer({
  duration,
  onTimeout,
  resetKey,
  theme,
}: {
  duration: number;
  onTimeout: () => void;
  resetKey: number;
  theme: (typeof Colors)["light"];
}) {
  const [left, setLeft] = useState(duration);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  useState(() => {
    const interval = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const pct = left / duration;
  const offset = circumference * (1 - pct);
  const color = pct > 0.5 ? theme.primary : pct > 0.2 ? "#F59E0B" : "#EF4444";

  return (
    <View style={{ width: 40, height: 40 }}>
      <Svg width={40} height={40} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={20} cy={20} r={radius} fill="none" strokeWidth={3} stroke={theme.muted} />
        <Circle
          cx={20}
          cy={20}
          r={radius}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 10, fontWeight: "700", color: theme.foreground }}>{left}</Text>
      </View>
    </View>
  );
}

function QuestionPalette({
  total,
  current,
  answers,
  flagged,
  onJump,
  theme,
}: {
  total: number;
  current: number;
  answers: Record<number, string>;
  flagged: Set<number>;
  onJump: (i: number) => void;
  theme: (typeof Colors)["light"];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
      >
        <View className="h-5 w-5 items-center justify-center rounded bg-primary">
          <Text className="text-[10px] font-bold text-primary-foreground">{current + 1}</Text>
        </View>
        <Text className="text-xs font-medium text-muted-foreground">/ {total}</Text>
        <ChevronDown size={12} color={theme.mutedForeground} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)}>
          <View className="mt-24 mx-6 rounded-2xl border border-border bg-card p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-xs font-medium text-card-foreground">Question Palette</Text>
              <Pressable onPress={() => setOpen(false)}>
                <X size={16} color={theme.mutedForeground} />
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {Array.from({ length: total }, (_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isFlagged = flagged.has(i);
                const isCurrent = i === current;
                return (
                  <Pressable
                    key={i}
                    onPress={() => {
                      onJump(i);
                      setOpen(false);
                    }}
                    className={`h-9 w-9 items-center justify-center rounded-md ${isCurrent ? "bg-primary" : isAnswered ? "bg-foreground" : "bg-muted"}`}
                  >
                    <Text className={`text-xs font-medium ${isCurrent ? "text-primary-foreground" : isAnswered ? "text-background" : "text-muted-foreground"}`}>
                      {i + 1}
                    </Text>
                    {isFlagged && <View className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />}
                  </Pressable>
                );
              })}
            </View>
            <View className="mt-3 flex-row flex-wrap items-center gap-3 border-t border-border pt-2">
              <View className="flex-row items-center gap-1">
                <View className="h-2 w-2 rounded-full bg-foreground" />
                <Text className="text-[10px] text-muted-foreground">Answered</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="h-2 w-2 rounded-full bg-primary" />
                <Text className="text-[10px] text-muted-foreground">Current</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="h-2 w-2 rounded-full bg-amber-500" />
                <Text className="text-[10px] text-muted-foreground">Flagged</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function TestPractice() {
  const params = useLocalSearchParams<{ id: string }>();
  const testName = params.id ?? "";
  const syllabus = getSyllabus(testName);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[isDark ? "dark" : "light"];

  const addAttempt = useHistory((s) => s.addAttempt);
  const saved = useBookmarks((s) => s.saved);
  const toggleSavedQ = useBookmarks((s) => s.toggleSaved);
  const defaultCount = useSettings((s) => s.questionsPerTest);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(defaultCount || 5);

  const [phase, setPhase] = useState<"setup" | "quiz">("setup");
  const [mode, setMode] = useState<"syllabus" | "quick">(syllabus ? "syllabus" : "quick");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(syllabus?.subjects[0] ?? null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showExpl, setShowExpl] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const correctCountRef = useRef(0);
  const startedAtRef = useRef(0);
  const submittedRef = useRef(false);

  const topicString =
    mode === "syllabus" && selectedTopics.length > 0
      ? `${selectedSubject?.name}: ${selectedTopics.join(", ")}`
      : selectedSubject?.name || testName;

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError("");
    setIndex(0);
    setPicked(null);
    correctCountRef.current = 0;
    setDone(false);
    setShowExpl(false);
    setReviewMode(false);
    setAnswers({});
    setFlagged(new Set());
    submittedRef.current = false;
    try {
      const res = await apiFetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ test: testName, topic: topicString, count, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions");
      setQuestions(data.questions ?? []);
      startedAtRef.current = Date.now();
      setPhase("quiz");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [testName, topicString, count, difficulty]);

  const q = questions[index];
  const answered = picked !== null;

  function pick(opt: string) {
    if (answered) return;
    setPicked(opt);
    setShowExpl(false);
    setAnswers((prev) => ({ ...prev, [index]: opt }));
    if (opt === q.answer) correctCountRef.current += 1;
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
      if (!submittedRef.current) {
        submittedRef.current = true;
        addAttempt({
          testName,
          source: "syllabus",
          correct: correctCountRef.current,
          total: questions.length,
          duration: startedAtRef.current ? Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000)) : null,
        });
      }
    } else {
      setIndex(index + 1);
      setPicked(null);
      setShowExpl(false);
    }
  }

  function jumpTo(i: number) {
    if (i < 0 || i >= questions.length) return;
    setIndex(i);
    setPicked(answers[i] ?? null);
    setShowExpl(false);
  }

  function toggleFlag() {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleBookmark() {
    if (!q) return;
    toggleSavedQ(testName, q.question, { options: q.options, answer: q.answer, explanation: q.explanation });
  }

  function handleTimeout() {
    if (!answered && q) {
      setPicked("TIMEOUT");
      setAnswers((prev) => ({ ...prev, [index]: "TIMEOUT" }));
    }
  }

  function restart() {
    setDone(false);
    setReviewMode(false);
    setSelectedTopics([]);
    setPhase("setup");
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  function selectAllTopics() {
    if (!selectedSubject) return;
    if (selectedTopics.length === selectedSubject.topics.length) setSelectedTopics([]);
    else setSelectedTopics([...selectedSubject.topics]);
  }

  const savedForTest = useMemo(() => saved.filter((b) => b.test === testName), [saved, testName]);
  const canStartSyllabus = mode === "syllabus" ? selectedSubject !== null && selectedTopics.length > 0 : true;

  // ---------- Loading ----------
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background gap-3">
        <ActivityIndicator size="large" color={theme.primary} />
        <Text className="text-sm text-muted-foreground">Generating your questions...</Text>
      </View>
    );
  }

  // ---------- Error ----------
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8 gap-4">
        <AlertCircle size={40} color="#EF4444" />
        <Text className="text-lg font-semibold text-foreground">Oops!</Text>
        <Text className="text-center text-sm text-muted-foreground">{error}</Text>
        <View className="flex-row gap-3 mt-2">
          <Pressable
            onPress={() => {
              setError("");
              if (phase === "setup") loadQuestions();
            }}
            className="flex-row items-center gap-2 rounded-full bg-primary px-5 py-3"
          >
            <RotateCcw size={14} color={theme.primaryForeground} />
            <Text className="text-sm font-semibold text-primary-foreground">Try Again</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/tests")} className="rounded-full border border-border px-5 py-3">
            <Text className="text-sm font-semibold text-foreground">Back to Tests</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---------- Setup ----------
  if (phase === "setup") {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Pressable onPress={() => router.push("/tests")} className="mb-5 flex-row items-center gap-1.5">
          <ChevronLeft size={16} color={theme.mutedForeground} />
          <Text className="text-sm text-muted-foreground">Back to Tests</Text>
        </Pressable>

        <View className="mb-2 self-start rounded-full bg-primary px-3 py-1">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Practice Studio</Text>
        </View>
        <Text className="text-2xl font-bold text-foreground">{testName}</Text>
        <Text className="mt-2 text-sm leading-5 text-muted-foreground">
          Build a focused practice session. Choose your topics, difficulty and question count.
        </Text>

        {/* Mode cards */}
        <View className="mt-6 flex-row flex-wrap gap-3">
          {syllabus && (
            <Pressable
              onPress={() => {
                setMode("syllabus");
                if (!selectedSubject) setSelectedSubject(syllabus.subjects[0] ?? null);
              }}
              className={`w-[48%] rounded-2xl border p-4 ${mode === "syllabus" ? "border-foreground/40 bg-accent" : "border-border bg-card"}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="rounded-xl bg-primary p-2.5">
                  <BookOpen size={18} color={theme.primaryForeground} />
                </View>
                {mode === "syllabus" && <CheckCircle2 size={18} color={theme.primary} />}
              </View>
              <Text className="mt-3 font-semibold text-card-foreground">Syllabus Practice</Text>
              <Text className="mt-1 text-xs leading-4 text-muted-foreground">Target exact subjects and topics.</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => setMode("quick")}
            className={`w-[48%] rounded-2xl border p-4 ${mode === "quick" ? "border-foreground/40 bg-accent" : "border-border bg-card"}`}
          >
            <View className="flex-row items-center justify-between">
              <View className="rounded-xl bg-foreground p-2.5">
                <Timer size={18} color={theme.background} />
              </View>
              {mode === "quick" && <CheckCircle2 size={18} color={theme.primary} />}
            </View>
            <Text className="mt-3 font-semibold text-card-foreground">Quick Practice</Text>
            <Text className="mt-1 text-xs leading-4 text-muted-foreground">Jump straight into mixed questions.</Text>
          </Pressable>

          <Pressable
            onPress={() => Alert.alert("Coming soon", "Written Practice will be available in an upcoming update.")}
            className="w-[48%] rounded-2xl border border-border bg-card p-4 opacity-50"
          >
            <View className="rounded-xl bg-sky-500 p-2.5 self-start">
              <PenLine size={18} color="#FFFFFF" />
            </View>
            <Text className="mt-3 font-semibold text-card-foreground">Written Practice</Text>
            <Text className="mt-1 text-xs leading-4 text-muted-foreground">Coming soon</Text>
          </Pressable>

          <Pressable
            onPress={() => Alert.alert("Coming soon", "Full Mock test will be available in an upcoming update.")}
            className="w-[48%] rounded-2xl border border-border bg-card p-4 opacity-50"
          >
            <View className="rounded-xl bg-amber-500 p-2.5 self-start">
              <FolderOpen size={18} color="#FFFFFF" />
            </View>
            <Text className="mt-3 font-semibold text-card-foreground">Full Mock</Text>
            <Text className="mt-1 text-xs leading-4 text-muted-foreground">Coming soon</Text>
          </Pressable>
        </View>

        {mode === "syllabus" && syllabus && (
          <View className="mt-6 rounded-2xl border border-border bg-card p-5">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-card-foreground">Focus areas</Text>
              <Pressable onPress={selectAllTopics} disabled={!selectedSubject}>
                <Text className="text-xs font-medium text-primary">
                  {selectedSubject && selectedTopics.length === selectedSubject.topics.length ? "Clear all" : "Select all"}
                </Text>
              </Pressable>
            </View>

            <View className="mt-4 gap-2">
              {syllabus.subjects.map((subj) => {
                const active = selectedSubject?.name === subj.name;
                return (
                  <Pressable
                    key={subj.name}
                    onPress={() => {
                      setSelectedSubject(subj);
                      setSelectedTopics([]);
                    }}
                    className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${active ? "border-foreground/40 bg-accent" : "border-border bg-background/40"}`}
                  >
                    <View className="flex-1 pr-2">
                      <Text className={`text-sm font-medium ${active ? "text-foreground" : "text-card-foreground"}`} numberOfLines={1}>
                        {subj.name}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-muted-foreground">{subj.topics.length} topics</Text>
                    </View>
                    <View className={`rounded-full px-2.5 py-1 ${active ? "bg-primary" : "bg-muted"}`}>
                      <Text className={`text-[10px] font-semibold ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>{subj.weightage}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {selectedSubject && (
              <View className="mt-5 border-t border-border pt-4">
                <Text className="mb-3 text-xs font-medium text-muted-foreground">
                  {selectedTopics.length} of {selectedSubject.topics.length} topics selected
                </Text>
                <View className="gap-2">
                  {selectedSubject.topics.map((topic) => {
                    const active = selectedTopics.includes(topic);
                    return (
                      <Pressable
                        key={topic}
                        onPress={() => toggleTopic(topic)}
                        className={`flex-row items-center gap-3 rounded-2xl border px-3.5 py-3 ${active ? "border-foreground/40 bg-accent" : "border-border bg-background/30"}`}
                      >
                        <View className={`h-4 w-4 items-center justify-center rounded border ${active ? "border-primary bg-primary" : "border-border"}`}>
                          {active && <Check size={11} color={theme.primaryForeground} />}
                        </View>
                        <Text className={`flex-1 text-xs ${active ? "text-foreground" : "text-muted-foreground"}`}>{topic}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Session settings */}
        <View className="mt-6 rounded-2xl border border-border bg-card p-5">
          <Text className="font-semibold text-card-foreground">Session settings</Text>

          <View className="mt-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-xs font-medium text-muted-foreground">Difficulty</Text>
              <Text className="text-xs font-semibold capitalize text-primary">{difficulty}</Text>
            </View>
            <View className="flex-row gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDifficulty(d)}
                  className={`flex-1 items-center rounded-xl border py-2.5 ${difficulty === d ? "border-foreground/40 bg-accent" : "border-border"}`}
                >
                  <Text className={`text-xs font-medium capitalize ${difficulty === d ? "text-foreground" : "text-muted-foreground"}`}>{d}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-xs font-medium text-muted-foreground">Questions</Text>
              <Text className="text-xs font-semibold text-primary">{count}</Text>
            </View>
            <View className="flex-row gap-2">
              {[5, 10, 15, 20].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setCount(n)}
                  className={`flex-1 items-center rounded-xl border py-2.5 ${count === n ? "border-foreground/40 bg-accent" : "border-border"}`}
                >
                  <Text className={`text-xs font-semibold ${count === n ? "text-foreground" : "text-muted-foreground"}`}>{n}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-5 rounded-xl border border-border bg-background/40 p-3.5">
            <Text className="text-xs font-medium text-foreground">Ready when you are</Text>
            <Text className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
              {mode === "syllabus" && selectedSubject
                ? `${selectedTopics.length} topic${selectedTopics.length === 1 ? "" : "s"} selected from ${selectedSubject.name}.`
                : "Quick mixed practice for this exam."}
            </Text>
          </View>

          <Pressable
            onPress={loadQuestions}
            disabled={!canStartSyllabus}
            className={`mt-5 flex-row items-center justify-center gap-2 rounded-full py-4 ${canStartSyllabus ? "bg-primary" : "bg-muted"}`}
          >
            <Text className={`text-base font-bold ${canStartSyllabus ? "text-primary-foreground" : "text-muted-foreground"}`}>Start Practice</Text>
            <ArrowRight size={16} color={canStartSyllabus ? theme.primaryForeground : theme.mutedForeground} />
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ---------- Results ----------
  if (done && !reviewMode) {
    const pct = questions.length ? Math.round((correctCountRef.current / questions.length) * 100) : 0;
    const correct = correctCountRef.current;
    const timedOut = Object.values(answers).filter((a) => a === "TIMEOUT").length;
    const wrong = Math.max(questions.length - correct - timedOut, 0);
    const isWin = pct >= 80;
    const isAverage = pct >= 50 && pct < 80;
    const title = isWin ? "Excellent work!" : isAverage ? "Good attempt!" : "Keep practicing!";
    const subtitle = isWin
      ? "You have a strong grasp of this material."
      : isAverage
      ? "You're getting there. A quick review can push this score higher."
      : "Don't worry. Use the review to find the gaps and try again.";

    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center">
          <View className={`h-16 w-16 items-center justify-center rounded-2xl ${isWin ? "bg-primary" : "bg-amber-500"}`}>
            <Trophy size={30} color={isWin ? theme.primaryForeground : "#FFFFFF"} />
          </View>
          <Text className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Test complete</Text>
          <Text className="mt-2 text-2xl font-bold text-foreground">{title}</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-muted-foreground">{subtitle}</Text>
        </View>

        <View className="mt-6 rounded-2xl border border-border bg-card p-5">
          <View className="items-center gap-5">
            <View
              style={{
                height: 112,
                width: 112,
                borderRadius: 56,
                borderWidth: 8,
                borderColor: theme.primary + "26",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="text-3xl font-bold text-foreground">{pct}%</Text>
              <Text className="text-[10px] font-medium text-muted-foreground">SCORE</Text>
            </View>

            <View className="w-full flex-row gap-2">
              <View className="flex-1 items-center rounded-xl bg-primary p-3">
                <Text className="text-xl font-bold text-primary-foreground">{correct}</Text>
                <Text className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-primary-foreground/80">Correct</Text>
              </View>
              <View className="flex-1 items-center rounded-xl bg-red-500 p-3">
                <Text className="text-xl font-bold text-white">{wrong}</Text>
                <Text className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-white/80">Wrong</Text>
              </View>
              <View className="flex-1 items-center rounded-xl bg-amber-500 p-3">
                <Text className="text-xl font-bold text-white">{timedOut}</Text>
                <Text className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-white/80">Timed out</Text>
              </View>
            </View>
          </View>

          {savedForTest.length > 0 && (
            <View className="mt-5 flex-row items-center justify-center gap-2 border-t border-border pt-4">
              <Bookmark size={14} color={theme.primary} />
              <Text className="text-xs text-muted-foreground">{savedForTest.length} question{savedForTest.length > 1 ? "s" : ""} saved for later</Text>
            </View>
          )}
        </View>

        <View className="mt-4 gap-2">
          <Pressable onPress={() => setReviewMode(true)} className="flex-row items-center justify-center gap-2 rounded-full bg-primary py-3.5">
            <CheckCircle2 size={16} color={theme.primaryForeground} />
            <Text className="text-sm font-bold text-primary-foreground">Review answers</Text>
          </Pressable>
          <Pressable onPress={restart} className="flex-row items-center justify-center gap-2 rounded-full border border-border py-3.5">
            <RotateCcw size={15} color={theme.foreground} />
            <Text className="text-sm font-semibold text-foreground">Practice again</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push("/tests")} className="mt-4 items-center">
          <Text className="text-xs font-medium text-muted-foreground">Back to all tests →</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ---------- Review ----------
  if (reviewMode) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-foreground">Review Answers</Text>
          <Pressable onPress={() => setReviewMode(false)} className="flex-row items-center gap-1.5 rounded-full border border-border px-3 py-2">
            <X size={14} color={theme.foreground} />
            <Text className="text-xs font-semibold text-foreground">Close</Text>
          </Pressable>
        </View>

        {questions.map((qItem, i) => {
          const userAns = answers[i];
          const correct = userAns === qItem.answer;
          const timedOut = userAns === "TIMEOUT";
          return (
            <View key={i} className="rounded-2xl border border-border bg-card p-4">
              <View className="flex-row items-start justify-between gap-3">
                <Text className="flex-1 text-sm font-medium text-foreground">{i + 1}. {stripHtml(qItem.question)}</Text>
                <View className={`rounded-full px-2 py-0.5 ${correct ? "bg-primary" : timedOut ? "bg-amber-500" : "bg-red-500"}`}>
                  <Text className="text-[10px] font-medium text-white">{correct ? "Correct" : timedOut ? "Timed Out" : "Wrong"}</Text>
                </View>
              </View>
              <View className="mt-2 gap-1">
                {qItem.options.map((opt, j) => {
                  const isUser = userAns === opt;
                  const isAns = opt === qItem.answer;
                  let color = theme.mutedForeground;
                  if (isAns) color = theme.primary;
                  else if (isUser && !isAns) color = "#F87171";
                  return (
                    <Text key={j} style={{ color, fontSize: 13, fontWeight: isAns || isUser ? "600" : "400", textDecorationLine: isUser && !isAns ? "line-through" : "none" }}>
                      {String.fromCharCode(65 + j)}. {opt}{isAns ? " ✓" : ""}
                    </Text>
                  );
                })}
              </View>
              <Text className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">{qItem.explanation}</Text>
            </View>
          );
        })}

        <View className="flex-row justify-center gap-3 pb-4 pt-2">
          <Pressable onPress={restart} className="flex-row items-center gap-2 rounded-full bg-primary px-5 py-3">
            <RotateCcw size={14} color={theme.primaryForeground} />
            <Text className="text-sm font-semibold text-primary-foreground">Practice Again</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/")} className="flex-row items-center gap-2 rounded-full border border-border px-5 py-3">
            <Home size={14} color={theme.foreground} />
            <Text className="text-sm font-semibold text-foreground">Dashboard</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ---------- Active question ----------
  if (!q) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">No questions.</Text>
      </View>
    );
  }

  const isBookmarked = saved.some((b) => b.test === testName && b.question === q.question);
  const isCorrect = answered && picked === q.answer;
  const isFlagged = flagged.has(index);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => router.push("/tests")}>
          <X size={18} color={theme.mutedForeground} />
        </Pressable>
        <View className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <View className="h-full rounded-full bg-primary" style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </View>
        <QuestionPalette total={questions.length} current={index} answers={answers} flagged={flagged} onJump={jumpTo} theme={theme} />
      </View>

      <View className="flex-row items-center justify-between">
        <CircularTimer duration={45} onTimeout={handleTimeout} resetKey={index} theme={theme} />
        <View className="flex-row items-center gap-1">
          <Pressable onPress={toggleFlag} className={`rounded-full p-2.5 ${isFlagged ? "bg-amber-500" : ""}`}>
            <Flag size={16} color={isFlagged ? "#FFFFFF" : theme.mutedForeground} fill={isFlagged ? "#FFFFFF" : "none"} />
          </Pressable>
          <Pressable onPress={toggleBookmark} className={`rounded-full p-2.5 ${isBookmarked ? "bg-primary" : ""}`}>
            <Bookmark size={16} color={isBookmarked ? theme.primaryForeground : theme.mutedForeground} fill={isBookmarked ? theme.primaryForeground : "none"} />
          </Pressable>
        </View>
      </View>

      <View className="rounded-2xl border border-border bg-card p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase tracking-wider text-primary">Question {index + 1}</Text>
          <View className="rounded-full border border-border bg-background/60 px-2.5 py-1">
            <Text className="text-[10px] font-medium text-muted-foreground">{index + 1} of {questions.length}</Text>
          </View>
        </View>
        <Text className="text-lg font-semibold leading-6 text-foreground">{stripHtml(q.question)}</Text>
      </View>

      <View className="gap-2.5">
        {q.options.map((opt, j) => {
          const isPick = picked === opt;
          const isAns = opt === q.answer;
          let bg = "bg-card";
          let border = "border-border";
          let textColor = "text-foreground";
          if (answered && isAns) {
            bg = "bg-primary";
            border = "border-primary";
            textColor = "text-primary-foreground";
          } else if (answered && isPick && !isAns) {
            bg = "bg-red-500";
            border = "border-red-500";
            textColor = "text-white";
          } else if (answered) {
            bg = "bg-card/50";
            textColor = "text-muted-foreground";
          }
          return (
            <Pressable
              key={j}
              onPress={() => pick(opt)}
              disabled={answered}
              className={`flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 ${bg} ${border}`}
            >
              <View className={`h-8 w-8 items-center justify-center rounded-lg ${answered && (isAns || isPick) ? "bg-white/20" : "bg-muted"}`}>
                <Text className={`text-xs font-bold ${answered && (isAns || isPick) ? "text-white" : "text-muted-foreground"}`}>
                  {String.fromCharCode(65 + j)}
                </Text>
              </View>
              <Text className={`flex-1 text-sm ${textColor}`}>{opt}</Text>
              {answered && isAns && <CheckCircle2 size={18} color="#FFFFFF" />}
              {answered && isPick && !isAns && <XCircle size={18} color="#FFFFFF" />}
            </Pressable>
          );
        })}
      </View>

      {answered && (
        <View className={`overflow-hidden rounded-2xl border ${isCorrect ? "border-primary bg-primary" : "border-red-500 bg-red-500"}`}>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                {isCorrect ? <CheckCircle2 size={18} color="#FFFFFF" /> : <XCircle size={18} color="#FFFFFF" />}
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-white">{isCorrect ? "Correct answer" : picked === "TIMEOUT" ? "Time's up" : "Not quite"}</Text>
                <Text className="mt-0.5 text-xs text-white/80">{isCorrect ? "Nice work. Keep the momentum going." : "Review the explanation before moving on."}</Text>
              </View>
            </View>
            <Pressable onPress={next} className="flex-row items-center gap-1.5 rounded-lg bg-white px-3.5 py-2.5">
              <Text className="text-xs font-bold text-black">{index + 1 >= questions.length ? "Finish" : "Next"}</Text>
              <ArrowRight size={13} color="#000000" />
            </Pressable>
          </View>
          <Pressable onPress={() => setShowExpl(!showExpl)} className="flex-row items-center gap-1.5 px-4 pb-3">
            <Text className="text-xs font-medium text-white/80">Explanation</Text>
            <ChevronDown size={13} color="#FFFFFF" style={{ transform: [{ rotate: showExpl ? "180deg" : "0deg" }] }} />
          </Pressable>
          {showExpl && (
            <View className="border-t border-white/20 px-4 py-3">
              <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-white">Why this is the answer</Text>
              <Text className="text-xs leading-5 text-white/90">{q.explanation}</Text>
            </View>
          )}
        </View>
      )}

      <View className="flex-row items-center justify-between pt-1">
        <Pressable onPress={() => jumpTo(index - 1)} disabled={index === 0} className={`flex-row items-center gap-1 ${index === 0 ? "opacity-30" : ""}`}>
          <ChevronLeft size={15} color={theme.mutedForeground} />
          <Text className="text-xs text-muted-foreground">Previous</Text>
        </Pressable>
        <Pressable
          onPress={() => jumpTo(index + 1)}
          disabled={index === questions.length - 1 || !answered}
          className={`flex-row items-center gap-1 ${index === questions.length - 1 || !answered ? "opacity-30" : ""}`}
        >
          <Text className="text-xs text-muted-foreground">Next</Text>
          <ChevronRight size={15} color={theme.mutedForeground} />
        </Pressable>
      </View>
    </ScrollView>
  );
}