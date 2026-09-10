import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import Svg, { Circle, Polyline } from "react-native-svg";
import {
  BarChart3,
  HelpCircle,
  Target,
  History as HistoryIcon,
  ArrowRight,
  Activity,
  Flame,
  AlertTriangle,
  Clock,
  Zap,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  ChevronRight,
  Trophy,
  Brain,
  Dumbbell,
  Calendar,
  FolderOpen,
  PenLine,
  Timer,
  BookOpen,
} from "lucide-react-native";
import { useSettings } from "../../store/settings";
import { useHistory, HistoryRow } from "../../store/history";
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

function formatDuration(seconds: number) {
  if (!seconds) return "0m";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

function accuracyClasses(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function barClasses(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function calcStreak(rows: HistoryRow[]) {
  const days = new Set(rows.map((r) => new Date(r.createdAt).toDateString()));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function summarize(rows: HistoryRow[]) {
  const byTest: Record<string, { correct: number; total: number; attempts: number; history: number[] }> = {};
  for (const r of rows) {
    if (!byTest[r.testName]) byTest[r.testName] = { correct: 0, total: 0, attempts: 0, history: [] };
    byTest[r.testName].correct += r.correct;
    byTest[r.testName].total += r.total;
    byTest[r.testName].attempts += 1;
    const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
    byTest[r.testName].history.push(pct);
  }
  return Object.entries(byTest)
    .map(([name, v]) => ({
      name,
      attempts: v.attempts,
      pct: v.total ? Math.round((v.correct / v.total) * 100) : 0,
      history: v.history,
      trend: v.history.length > 1 ? v.history[v.history.length - 1] - v.history[v.history.length - 2] : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts);
}

function sourceIcon(source: string) {
  if (source === "material") return FolderOpen;
  if (source === "subjective") return PenLine;
  if (source === "mock") return Timer;
  return BookOpen;
}

function GoalRing({ done, goal, primaryColor, mutedColor, foregroundColor }: { done: number; goal: number; primaryColor: string; mutedColor: string; foregroundColor: string }) {
  const p = Math.min(done / Math.max(goal, 1), 1);
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ height: 112, width: 112 }}>
      <Svg viewBox="0 0 100 100" style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx="50" cy="50" r={r} fill="none" strokeWidth={10} stroke={mutedColor} />
        <Circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          stroke={primaryColor}
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p)}
        />
      </Svg>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: foregroundColor }} className="text-xl font-bold">{done}</Text>
        <Text className="text-[10px] text-muted-foreground">of {goal}</Text>
      </View>
    </View>
  );
}

function MiniSparkline({ data, color, mutedColor, width = 60, height = 24 }: { data: number[]; color: string; mutedColor: string; width?: number; height?: number }) {
  if (data.length < 2) return <Minus size={12} color={mutedColor} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const lastY = height - ((data[data.length - 1] - min) / range) * height;
  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={width} cy={lastY} r={2} fill={color} />
    </Svg>
  );
}

function StatCard({ Icon, label, value, primaryFg }: { Icon: any; label: string; value: string; primaryFg: string }) {
  return (
    <View className="w-[48%] rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-2">
        <View className="rounded-lg bg-primary p-1.5">
          <Icon size={14} color={primaryFg} />
        </View>
        <Text className="text-xs text-muted-foreground flex-shrink">{label}</Text>
      </View>
      <Text className="mt-3 text-2xl font-semibold text-card-foreground">{value}</Text>
    </View>
  );
}

const DAILY_GOAL = 20;
const XP_PER_LEVEL = 250;

export default function Dashboard() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = Colors[isDark ? "dark" : "light"];

  const name = useSettings((s) => s.displayName);
  const rows = useHistory((s) => s.rows);
  const loaded = useHistory((s) => s.loaded);

  const [hour] = useState(() => new Date().getHours());

  const attempts = rows.length;
  const answered = rows.reduce((a, r) => a + r.total, 0);
  const correctTotal = rows.reduce((a, r) => a + r.correct, 0);
  const accuracy = answered ? Math.round((correctTotal / answered) * 100) : 0;
  const streak = calcStreak(rows);
  const totalDuration = rows.reduce((a, r) => a + (r.duration ?? 0), 0);
  const breakdown = summarize(rows);
  const weak = breakdown.filter((t) => t.pct < 50).sort((a, b) => a.pct - b.pct);

  const xp = correctTotal * 10;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    const dayRows = rows.filter((r) => new Date(r.createdAt).toDateString() === key);
    return {
      label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      qs: dayRows.reduce((a, r) => a + r.total, 0),
      isToday: i === 6,
    };
  });
  const maxQs = Math.max(...week.map((w) => w.qs), 1);
  const todayQs = week[6].qs;

  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const GreetingIcon = hour < 6 || hour > 18 ? Moon : Sun;

  // 90-day heatmap, grouped into weeks (columns)
  const days: Record<string, number> = {};
  for (const r of rows) {
    const key = new Date(r.createdAt).toDateString();
    days[key] = (days[key] ?? 0) + r.total;
  }
  const weeks: { qs: number }[][] = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  let currentWeek: { qs: number }[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    currentWeek.push({ qs: days[d.toDateString()] ?? 0 });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);
  const maxHeatQs = Math.max(...Object.values(days), 1);
  function heatClass(qs: number) {
    if (qs === 0) return "bg-muted";
    if (qs <= maxHeatQs * 0.25) return "bg-primary/25";
    if (qs <= maxHeatQs * 0.5) return "bg-primary/45";
    if (qs <= maxHeatQs * 0.75) return "bg-primary/70";
    return "bg-primary";
  }

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}>
      <View className="flex-row items-center gap-3">
        <GreetingIcon size={20} color="#F59E0B" />
        <Text className="font-bold text-2xl text-foreground">
          {greeting}{name ? `, ${name}` : ""}
        </Text>
      </View>

      {/* Quick actions */}
      <View className="flex-row gap-3">
        <Pressable onPress={() => router.push("/tests")} className="flex-1 rounded-2xl border border-border bg-card p-3.5 items-start">
          <View className="rounded-lg bg-primary p-2 mb-2">
            <Brain size={16} color={theme.primaryForeground} />
          </View>
          <Text className="text-xs font-medium text-foreground">Practice Now</Text>
          <Text className="text-[10px] text-muted-foreground">Pick any test</Text>
        </Pressable>

        {weak.length > 0 ? (
          <Pressable
            onPress={() => router.push({ pathname: "/test/[id]", params: { id: weak[0].name } })}
            className="flex-1 rounded-2xl border border-border bg-card p-3.5 items-start"
          >
            <View className="rounded-lg bg-red-500 p-2 mb-2">
              <Dumbbell size={16} color="#FFFFFF" />
            </View>
            <Text className="text-xs font-medium text-foreground">Weak Area</Text>
            <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>{weak[0].name}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push("/tests")} className="flex-1 rounded-2xl border border-border bg-card p-3.5 items-start">
            <View className="rounded-lg bg-primary p-2 mb-2">
              <Star size={16} color={theme.primaryForeground} />
            </View>
            <Text className="text-xs font-medium text-foreground">Daily Challenge</Text>
            <Text className="text-[10px] text-muted-foreground">20 questions</Text>
          </Pressable>
        )}

        <Pressable onPress={() => router.push("/tests")} className="flex-1 rounded-2xl border border-border bg-card p-3.5 items-start">
          <View className="rounded-lg bg-foreground p-2 mb-2">
            <Trophy size={16} color={theme.background} />
          </View>
          <Text className="text-xs font-medium text-foreground">Mock Test</Text>
          <Text className="text-[10px] text-muted-foreground">Full sim</Text>
        </Pressable>
      </View>

      {/* Level card */}
      <View className="rounded-2xl border border-border bg-card p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="rounded-lg bg-primary p-1.5">
              <Zap size={14} color={theme.primaryForeground} />
            </View>
            <Text className="text-sm text-muted-foreground">Level {level}</Text>
          </View>
          <Text className="text-xs font-medium text-primary">{xp} XP</Text>
        </View>
        <View className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <View className="h-full rounded-full bg-primary" style={{ width: `${Math.max((intoLevel / XP_PER_LEVEL) * 100, 2)}%` }} />
        </View>
        <Text className="mt-2 text-xs text-muted-foreground">{XP_PER_LEVEL - intoLevel} XP to Level {level + 1}</Text>
      </View>

      {/* Daily goal */}
      <View className="rounded-2xl border border-border bg-card p-5 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <View className="rounded-lg bg-primary p-1.5">
              <Target size={14} color={theme.primaryForeground} />
            </View>
            <Text className="text-sm text-muted-foreground">Daily Goal</Text>
          </View>
          <Text className="mt-3 text-sm font-medium text-card-foreground">
            {todayQs >= DAILY_GOAL ? "Goal complete! Well done!" : `${DAILY_GOAL - todayQs} questions to go`}
          </Text>
          <Text className="mt-1 text-xs text-muted-foreground">Answer {DAILY_GOAL} questions a day</Text>
        </View>
        <GoalRing done={todayQs} goal={DAILY_GOAL} primaryColor={theme.primary} mutedColor={theme.muted} foregroundColor={theme.foreground} />
      </View>

      {/* This week */}
      <View className="rounded-2xl border border-border bg-card p-5">
        <View className="flex-row items-center gap-2">
          <View className="rounded-lg bg-primary p-1.5">
            <Activity size={14} color={theme.primaryForeground} />
          </View>
          <Text className="text-sm text-muted-foreground">This Week</Text>
        </View>
        <View className="mt-4 h-20 flex-row items-end gap-1.5">
          {week.map((w, i) => (
            <View key={i} className="flex-1 h-full items-center justify-end gap-1">
              <View
                className={`w-full rounded-t-md ${w.qs === 0 ? "bg-muted" : w.isToday ? "bg-primary" : "bg-foreground/30"}`}
                style={{ height: `${Math.max((w.qs / maxQs) * 100, 4)}%` }}
              />
              <Text className={`text-[10px] ${w.isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>{w.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stat cards */}
      <View className="flex-row flex-wrap gap-3 justify-between">
        <StatCard Icon={BarChart3} label="Attempts" value={`${attempts}`} primaryFg={theme.primaryForeground} />
        <StatCard Icon={HelpCircle} label="Questions" value={`${answered}`} primaryFg={theme.primaryForeground} />
        <StatCard Icon={Clock} label="Study Time" value={formatDuration(totalDuration)} primaryFg={theme.primaryForeground} />
        <StatCard Icon={Target} label="Accuracy" value={`${accuracy}%`} primaryFg={theme.primaryForeground} />
        <StatCard Icon={Flame} label="Day Streak" value={`${streak}`} primaryFg={theme.primaryForeground} />
      </View>

      {/* Streak heatmap */}
      <View className="rounded-2xl border border-border bg-card p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="rounded-lg bg-primary p-1.5">
              <Calendar size={14} color={theme.primaryForeground} />
            </View>
            <Text className="text-sm text-muted-foreground">Activity Heatmap</Text>
          </View>
          <Text className="text-xs text-muted-foreground">Last 90 days</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          <View className="flex-row gap-1">
            {weeks.map((wk, wi) => (
              <View key={wi} className="gap-1">
                {wk.map((day, di) => (
                  <View key={di} className={`h-3 w-3 rounded-sm ${heatClass(day.qs)}`} />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Subject mastery */}
      <View className="rounded-2xl border border-border bg-card p-5">
        <View className="flex-row items-center gap-2">
          <View className="rounded-lg bg-primary p-1.5">
            <Target size={14} color={theme.primaryForeground} />
          </View>
          <Text className="text-sm text-muted-foreground">Subject Mastery</Text>
        </View>
        <View className="mt-4 gap-3">
          {breakdown.slice(0, 5).map((t) => (
            <View key={t.name} className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Text className="text-xs font-bold text-muted-foreground">{t.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-medium text-card-foreground flex-shrink" numberOfLines={1}>{t.name}</Text>
                  <Text className="text-xs text-muted-foreground">{t.pct}%</Text>
                </View>
                <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <View className={`h-full rounded-full ${barClasses(t.pct)}`} style={{ width: `${Math.max(t.pct, 2)}%` }} />
                </View>
              </View>
            </View>
          ))}
          {breakdown.length === 0 && (
            <Text className="text-xs text-muted-foreground">No data yet. Start practicing to see your mastery levels.</Text>
          )}
        </View>
      </View>

      {/* Weak area banner */}
      {weak.length > 0 && (
        <View className="flex-row items-center justify-between gap-3 rounded-2xl bg-foreground p-5">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="rounded-lg bg-primary p-2">
              <Target size={16} color={theme.primaryForeground} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-background">Focus today: {weak[0].name}</Text>
              <Text className="mt-0.5 text-xs text-background/60">Accuracy {weak[0].pct}%. Just 10 minutes can change that.</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: "/test/[id]", params: { id: weak[0].name } })}
            className="rounded-full bg-primary px-4 py-2"
          >
            <Text className="text-xs font-semibold text-primary-foreground">Practice</Text>
          </Pressable>
        </View>
      )}

      {/* Test breakdown */}
      {breakdown.length > 0 && (
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <BarChart3 size={14} color={theme.mutedForeground} />
            <Text className="font-medium text-foreground">Test Breakdown</Text>
          </View>
          <View className="gap-4 rounded-2xl border border-border bg-card p-5">
            {breakdown.map((t) => (
              <View key={t.name}>
                <View className="mb-1 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-shrink">
                    <Text className="text-xs font-medium text-card-foreground" numberOfLines={1}>{t.name}</Text>
                    {t.trend > 0 && <TrendingUp size={12} color="#34D399" />}
                    {t.trend < 0 && <TrendingDown size={12} color="#F87171" />}
                  </View>
                  <View className="flex-row items-center gap-3">
                    <MiniSparkline data={t.history} color={theme.primary} mutedColor={theme.mutedForeground} />
                    <Text className="text-xs text-muted-foreground">{t.pct}% · {t.attempts} att.</Text>
                  </View>
                </View>
                <View className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <View className={`h-full rounded-full ${barClasses(t.pct)}`} style={{ width: `${Math.max(t.pct, 2)}%` }} />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Needs improvement */}
      {weak.length > 0 && (
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <AlertTriangle size={14} color="#F87171" />
            <Text className="font-medium text-foreground">Needs Improvement</Text>
            <Text className="text-xs text-muted-foreground">(below 50%)</Text>
          </View>
          <View className="gap-2">
            {weak.map((t) => (
              <View key={t.name} className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-5 py-3">
                <View className="flex-1 pr-2">
                  <Text className="font-medium text-card-foreground" numberOfLines={1}>{t.name}</Text>
                  <Text className="text-xs text-muted-foreground">{t.attempts} attempt{t.attempts > 1 ? "s" : ""}</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="rounded-full bg-red-500 px-2.5 py-0.5">
                    <Text className="text-xs font-medium text-white">{t.pct}%</Text>
                  </View>
                  <Pressable
                    onPress={() => router.push({ pathname: "/test/[id]", params: { id: t.name } })}
                    className="rounded-full bg-primary px-3 py-1"
                  >
                    <Text className="text-xs font-semibold text-primary-foreground">Practice</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent attempts */}
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <HistoryIcon size={14} color={theme.mutedForeground} />
          <Text className="font-medium text-foreground">Recent Attempts</Text>
        </View>

        {rows.length === 0 ? (
          <View className="items-center rounded-2xl border border-border bg-card p-8">
            <HistoryIcon size={28} color={theme.mutedForeground} />
            <Text className="mt-3 font-medium text-foreground">No attempts yet</Text>
            <Text className="mt-1 text-center text-xs text-muted-foreground">Take your first test and start building your streak.</Text>
            <Pressable onPress={() => router.push("/tests")} className="mt-4 flex-row items-center gap-2 rounded-full bg-primary px-4 py-2">
              <Text className="text-sm font-semibold text-primary-foreground">Browse Tests</Text>
              <ArrowRight size={14} color={theme.primaryForeground} />
            </Pressable>
          </View>
        ) : (
          <View className="gap-2">
            {rows.slice(0, 5).map((r) => {
              const pct = Math.round((r.correct / r.total) * 100);
              const SIcon = sourceIcon(r.source);
              return (
                <View key={r.id} className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-5 py-3">
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className="rounded-lg bg-muted p-2">
                      <SIcon size={14} color={theme.mutedForeground} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-card-foreground" numberOfLines={1}>{r.testName}</Text>
                      <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                        {r.source === "material" ? "From Material" : r.source === "subjective" ? "Part B" : r.source === "mock" ? "Mock Test" : "From Syllabus"}
                        {" · "}{timeAgo(r.createdAt)}
                        {r.duration ? ` · ${formatDuration(r.duration)}` : ""}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-muted-foreground">{r.correct}/{r.total}</Text>
                    <View className={`rounded-full px-2.5 py-0.5 ${accuracyClasses(pct)}`}>
                      <Text className="text-xs font-medium text-white">{pct}%</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}