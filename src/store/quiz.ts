import { create } from "zustand";

export type Question = {
  id: string;
  text: string;
  options: string[];
  correct: number;
};

type Phase = "setup" | "quiz" | "review";

type QuizState = {
  phase: Phase;
  questions: Question[];
  current: number;
  answers: (number | null)[];
  start: (qs: Question[]) => void;
  answer: (i: number) => void;
  next: () => void;
  reset: () => void;
};

export const useQuiz = create<QuizState>((set) => ({
  phase: "setup",
  questions: [],
  current: 0,
  answers: [],
  start: (qs) => set({ phase: "quiz", questions: qs, current: 0, answers: qs.map(() => null) }),
  answer: (i) => set((s) => ({ answers: s.answers.map((a, idx) => (idx === s.current ? i : a)) })),
  next: () => set((s) => (s.current + 1 >= s.questions.length ? { phase: "review" } : { current: s.current + 1 })),
  reset: () => set({ phase: "setup", questions: [], current: 0, answers: [] }),
}));