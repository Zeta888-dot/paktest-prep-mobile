import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  FileText,
  Flame,
  GraduationCap,
  Search,
  Shield,
  Stethoscope,
  Target,
  UsersRound,
  Zap,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useHistory } from "../../store/history";
import { Colors } from "../../constants/theme";

const tests = [
  {
    name: "Police Constable (KPK / Islamabad)",
    category: "Defense & Police",
    label: "Police Constable",
    difficulty: "Medium",
    estQs: 100,
    estTime: "75 min",
    icon: Shield,
    description: "GK, English, Islamiat, Pakistan Studies and current affairs",
  },
  {
    name: "Junior / Senior Clerk",
    category: "Clerical & Admin",
    label: "Clerk",
    difficulty: "Easy",
    estQs: 75,
    estTime: "60 min",
    icon: FileText,
    description: "Typing, English, computer basics and office aptitude",
  },
  {
    name: "Stenotypist",
    category: "Clerical & Admin",
    label: "Stenotypist",
    difficulty: "Medium",
    estQs: 80,
    estTime: "65 min",
    icon: FileText,
    description: "English, shorthand concepts, computer and aptitude",
  },
  {
    name: "ASF",
    category: "Defense & Police",
    label: "ASF",
    difficulty: "Hard",
    estQs: 120,
    estTime: "90 min",
    icon: Target,
    description: "Security-force focused screening subjects",
  },
  {
    name: "Air Force Commission Posts",
    category: "Defense & Police",
    label: "Air Force",
    difficulty: "Hard",
    estQs: 150,
    estTime: "110 min",
    icon: GraduationCap,
    description: "Academic and aptitude selection tests",
  },
  {
    name: "MDCAT",
    category: "Medical & Engineering",
    label: "MDCAT",
    difficulty: "Hard",
    estQs: 200,
    estTime: "150 min",
    icon: Stethoscope,
    description: "Biology, Chemistry, Physics and English",
  },
  {
    name: "ECAT",
    category: "Medical & Engineering",
    label: "ECAT",
    difficulty: "Medium",
    estQs: 150,
    estTime: "110 min",
    icon: BookOpen,
    description: "Mathematics, Physics, Chemistry/Computer and English",
  },
  {
    name: "SST (Senior Subject Specialist)",
    category: "Teaching",
    label: "SST",
    difficulty: "Medium",
    estQs: 100,
    estTime: "75 min",
    icon: BookOpen,
    description: "Subject knowledge plus teaching aptitude",
  },
  {
    name: "CT (Certified Teacher)",
    category: "Teaching",
    label: "CT",
    difficulty: "Easy",
    estQs: 80,
    estTime: "60 min",
    icon: BookOpen,
    description: "Primary-level teaching and pedagogy",
  },
  {
    name: "PST (Primary School Teacher)",
    category: "Teaching",
    label: "PST",
    difficulty: "Easy",
    estQs: 75,
    estTime: "55 min",
    icon: BookOpen,
    description: "Primary teaching, English, GK and pedagogy",
  },
  {
    name: "PASI (Assistant Sub Inspector)",
    category: "Defense & Police",
    label: "PASI",
    difficulty: "Hard",
    estQs: 120,
    estTime: "90 min",
    icon: Shield,
    description: "Police screening with aptitude and knowledge",
  },
  {
    name: "CSS & PMS",
    category: "Civil Services",
    label: "CSS / PMS",
    difficulty: "Hard",
    estQs: 300,
    estTime: "225 min",
    icon: UsersRound,
    description: "Civil service compulsory screening areas",
  },
] as const;

const categories = [
  "All",
  "Defense & Police",
  "Clerical & Admin",
  "Teaching",
  "Medical & Engineering",
  "Civil Services",
];

function difficultyBadge(d: string) {
  if (d === "Hard") return "bg-red-500/10 text-red-500";
  if (d === "Medium") return "bg-amber-500/10 text-amber-500";
  return "bg-emerald-500/10 text-emerald-500";
}

function ProgressRing({ value, size = 40, primaryColor, borderColor, foregroundColor }: { value: number; size?: number; primaryColor: string; borderColor: string; foregroundColor: string }) {
  const stroke = 4;
  const radius = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * radius;
  const safe = Math.min(100, Math.max(0, value));
  const offset = c - (safe / 100) * c;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={borderColor} strokeWidth={stroke} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={primaryColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 9, fontWeight: "700", color: foregroundColor }}>{value}%</Text>
      </View>
    </View>
  );
}

type Test = (typeof tests)[number];

function TestCard({
  test,
  progress,
  attempts,
  onOpen,
  theme,
}: {
  test: Test;
  progress: number;
  attempts: number;
  onOpen: () => void;
  theme: (typeof Colors)["light"];
}) {
  const Icon = test.icon;
  const started = attempts > 0;

  return (
    <Pressable onPress={onOpen} className="w-[48%] rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-start justify-between">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon size={18} color={theme.primary} />
        </View>
        <View className={`rounded-full px-2 py-1 ${difficultyBadge(test.difficulty)}`}>
          <Text className={`text-[9px] font-bold ${test.difficulty === "Hard" ? "text-red-500" : test.difficulty === "Medium" ? "text-amber-500" : "text-emerald-500"}`}>
            {test.difficulty}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-1">
        <View className="flex-row items-center gap-1.5">
          <View className="h-1 w-1 rounded-full bg-primary" />
          <Text className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground" numberOfLines={1}>
            {test.category}
          </Text>
        </View>
        <Text className="mt-1 text-base font-bold text-foreground" numberOfLines={1}>{test.label}</Text>
        <Text className="mt-1.5 text-[11px] leading-4 text-muted-foreground" numberOfLines={2}>{test.description}</Text>
      </View>

      <View className="mt-3 flex-row items-center gap-3 border-t border-border pt-3">
        <View className="flex-row items-center gap-1">
          <Clock3 size={11} color={theme.mutedForeground} />
          <Text className="text-[10px] text-muted-foreground">{test.estTime}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <FileText size={11} color={theme.mutedForeground} />
          <Text className="text-[10px] text-muted-foreground">{test.estQs} Qs</Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        {started ? (
          <>
            <ProgressRing value={progress} primaryColor={theme.primary} borderColor={theme.border} foregroundColor={theme.foreground} />
            <View className="items-end">
              <Text className="text-[9px] text-muted-foreground">Attempts</Text>
              <Text className="text-xs font-bold text-foreground">{attempts}</Text>
            </View>
          </>
        ) : (
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-[10px] font-semibold text-muted-foreground">Ready to start</Text>
            <View className="h-7 w-7 items-center justify-center rounded-full border border-border bg-background">
              <ArrowRight size={13} color={theme.foreground} />
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function FeaturedCard({ test, progress, attempts, onOpen, theme }: { test: Test; progress: number; attempts: number; onOpen: () => void; theme: (typeof Colors)["light"] }) {
  return (
    <Pressable onPress={onOpen} className="rounded-3xl border border-border bg-card p-6">
      <View className="flex-row flex-wrap items-center gap-2">
        <View className="flex-row items-center gap-1.5 rounded-full bg-primary px-3 py-1.5">
          <Zap size={11} color={theme.primaryForeground} />
          <Text className="text-[9px] font-bold uppercase tracking-wider text-primary-foreground">Featured</Text>
        </View>
        <View className="rounded-full bg-secondary px-3 py-1.5">
          <Text className="text-[9px] font-bold text-secondary-foreground">{test.difficulty}</Text>
        </View>
      </View>

      <Text className="mt-4 text-2xl font-bold leading-tight text-foreground">{test.label}</Text>
      <Text className="mt-2 text-sm leading-5 text-muted-foreground">
        {test.description}. Prepare with focused MCQs and progress tracking.
      </Text>

      <View className="mt-5 flex-row flex-wrap items-center gap-3">
        <View className="flex-row items-center gap-2 rounded-full bg-primary px-5 py-2.5">
          <Text className="text-xs font-bold text-primary-foreground">Start Practice</Text>
          <ArrowRight size={14} color={theme.primaryForeground} />
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock3 size={13} color={theme.mutedForeground} />
          <Text className="text-xs text-muted-foreground">{test.estTime}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <FileText size={13} color={theme.mutedForeground} />
          <Text className="text-xs text-muted-foreground">{test.estQs} questions</Text>
        </View>
      </View>

      <View className="mt-5 rounded-2xl border border-border bg-background p-4">
        <View className="flex-row items-center gap-4">
          <ProgressRing value={progress} size={56} primaryColor={theme.primary} borderColor={theme.border} foregroundColor={theme.foreground} />
          <View className="flex-1">
            <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Your Performance</Text>
            <Text className="mt-1 text-xl font-bold text-foreground">{progress > 0 ? `${progress}%` : "Not started"}</Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">{attempts} attempt{attempts === 1 ? "" : "s"} recorded</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function Tests() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[isDark ? "dark" : "light"];

  const rows = useHistory((s) => s.rows);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const { attempts, progress, lastAttempted } = useMemo(() => {
    const attempts: Record<string, number> = {};
    const totals: Record<string, { correct: number; total: number }> = {};
    const lastAttempted: Record<string, string> = {};
    for (const r of rows) {
      attempts[r.testName] = (attempts[r.testName] ?? 0) + 1;
      if (!totals[r.testName]) totals[r.testName] = { correct: 0, total: 0 };
      totals[r.testName].correct += r.correct;
      totals[r.testName].total += r.total;
      if (!lastAttempted[r.testName] || r.createdAt > lastAttempted[r.testName]) {
        lastAttempted[r.testName] = r.createdAt;
      }
    }
    const progress: Record<string, number> = {};
    for (const [name, v] of Object.entries(totals)) {
      progress[name] = v.total ? Math.round((v.correct / v.total) * 100) : 0;
    }
    return { attempts, progress, lastAttempted };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((t) => {
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      const matchesCategory = category === "All" || t.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  const recentlyPracticed = useMemo(() => {
    return [...tests]
      .filter((t) => lastAttempted[t.name])
      .sort((a, b) => new Date(lastAttempted[b.name]).getTime() - new Date(lastAttempted[a.name]).getTime())
      .slice(0, 6);
  }, [lastAttempted]);

  const featured = tests[0];

  function openTest(name: string) {
    router.push({ pathname: "/test/[id]", params: { id: name } });
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 24 }}>
      {/* Hero */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-bold leading-tight text-foreground">Choose your exam.</Text>
          <Text className="text-2xl font-bold leading-tight text-primary">Start practicing.</Text>
        </View>
        <View className="flex-row gap-2">
          <View className="rounded-2xl border border-border bg-card px-3 py-2.5 items-center">
            <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Available</Text>
            <Text className="mt-0.5 text-lg font-bold text-foreground">{tests.length}</Text>
          </View>
          <View className="rounded-2xl border border-border bg-card px-3 py-2.5 items-center">
            <View className="flex-row items-center gap-1">
              <Flame size={11} color="#F97316" />
              <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Streak</Text>
            </View>
            <Text className="mt-0.5 text-[11px] font-bold text-foreground">Keep going</Text>
          </View>
        </View>
      </View>

      {/* Featured */}
      <FeaturedCard
        test={featured}
        progress={progress[featured.name] ?? 0}
        attempts={attempts[featured.name] ?? 0}
        onOpen={() => openTest(featured.name)}
        theme={theme}
      />

      {/* Continue practicing */}
      {recentlyPracticed.length > 0 && (
        <View>
          <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Continue Practicing</Text>
          <Text className="mt-1 text-xl font-bold text-foreground">Pick up where you left off</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-5 px-5">
            <View className="flex-row gap-3">
              {recentlyPracticed.map((t) => (
                <View key={t.name} style={{ width: 220 }}>
                  <TestCard
                    test={t}
                    attempts={attempts[t.name] ?? 0}
                    progress={progress[t.name] ?? 0}
                    onOpen={() => openTest(t.name)}
                    theme={theme}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Search + filters */}
      <View>
        <View className="rounded-2xl border border-border bg-card p-4">
          <View className="flex-row items-center gap-3 rounded-xl border border-border bg-background px-4">
            <Search size={15} color={theme.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search tests..."
              placeholderTextColor={theme.mutedForeground}
              className="flex-1 py-3 text-sm text-foreground"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2">
              {categories.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  className={`rounded-full px-4 py-2.5 ${category === item ? "bg-foreground" : "border border-border bg-background"}`}
                >
                  <Text className={`text-xs font-bold ${category === item ? "text-background" : "text-muted-foreground"}`}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-6 flex-row items-end justify-between">
          <View>
            <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">All Tests</Text>
            <Text className="mt-1 text-xl font-bold text-foreground">Find your exam</Text>
          </View>
          <Text className="text-xs font-semibold text-muted-foreground">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </Text>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-3 justify-between">
          {filtered.map((t) => (
            <TestCard
              key={t.name}
              test={t}
              attempts={attempts[t.name] ?? 0}
              progress={progress[t.name] ?? 0}
              onOpen={() => openTest(t.name)}
              theme={theme}
            />
          ))}
        </View>

        {filtered.length === 0 && (
          <View className="mt-4 items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16">
            <View className="h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary">
              <Search size={18} color={theme.mutedForeground} />
            </View>
            <Text className="mt-4 text-lg font-bold text-foreground">No test found</Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">Try another keyword or category.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}