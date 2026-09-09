import { Question } from "../store/quiz";

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export async function generateQuestions(
  topic: string,
  count: number,
  apiKey: string
): Promise<Question[]> {
  const model = "gemini-2.5-flash";
  const prompt = `Generate ${count} multiple choice questions about "${topic}" for Pakistani exam preparation. Return ONLY a JSON array with this exact format, no markdown, no extra text:
[{"id":"q1","text":"question text","options":["A","B","C","D"],"correct":0}]
correct is the index (0-3) of the right answer.`;

  const res = await fetch(`${API_URL}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = await res.json();
  const raw = data.candidates[0].content.parts[0].text;
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as Question[];
}