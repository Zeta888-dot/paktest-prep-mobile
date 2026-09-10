export type Subject = {
  name: string;
  weightage: string;
  topics: string[];
};

export type TestSyllabus = {
  testName: string;
  subjects: Subject[];
};

export const syllabi: TestSyllabus[] = [
  {
    testName: "Police Constable (KPK)",
    subjects: [
      {
        name: "English",
        weightage: "15 Marks",
        topics: [
          "Tenses & Sequence of Tenses",
          "Parts of Speech (Noun, Pronoun, Adjective, Adverb, Verb)",
          "Synonyms & Antonyms",
          "Correct Use of Articles (a, an, the)",
          "Prepositions (in, on, at, by, with, from, to)",
          "Conjunctions",
          "Sentence Correction / Error Detection",
          "Active & Passive Voice",
          "Direct & Indirect Speech",
          "Vocabulary (Matric level)",
          "Proverbs & their Meanings",
          "Idioms & Phrases",
          "Reading Comprehension",
          "Translation of Sentences (English to Urdu)",
        ],
      },
      {
        name: "Urdu",
        weightage: "15 Marks",
        topics: [
          "Grammar (Qawaid)",
          "Synonyms & Antonyms (Mutradif & Mutazad)",
          "Singular & Plural (Wahid & Jama)",
          "Masculine & Feminine (Muzakkar & Muannas)",
          "Idioms (Mahawarat)",
          "Proverbs (Zarb-ul-Amsal)",
          "Correct Spelling (Durust Imla)",
          "Comprehension (Fahm-e-Ibarat)",
          "Important Literary Information (Adbi Maloomat)",
          "Sentence Formation (Jumlon ki Tareeq-e-Taaleem)",
        ],
      },
      {
        name: "Islamiyat",
        weightage: "15 Marks",
        topics: [
          "Basic Beliefs of Islam (Aqaid)",
          "Arkan-e-Islam (Five Pillars)",
          "Seerat-un-Nabi (PBUH) - Key Events",
          "Quranic Knowledge (Surah names, themes)",
          "Ahadith (Selected hadith with meanings)",
          "Islamic History (Battles, Treaties)",
          "Khulafa-e-Rashideen (Lives & Contributions)",
          "Islamic Months & Important Events",
          "Namaz, Roza, Zakat & Hajj (Details)",
          "Islamic Teachings & Ethics (Akhlaq)",
          "Prophets of Allah (Anbiya stories)",
          "General Islamic Knowledge",
        ],
      },
      {
        name: "General Knowledge (incl. Pak Studies)",
        weightage: "20 Marks",
        topics: [
          "World Geography (Continents, Oceans)",
          "Countries, Capitals & Currencies",
          "World Organizations (UN, WHO, IMF, World Bank)",
          "International Borders & Lines",
          "Rivers, Mountains, Seas & Oceans",
          "Science & Technology (Basics)",
          "Everyday Science",
          "National & International Days",
          "Famous Personalities (World & Pakistan)",
          "Important Inventions & Discoveries",
          "Sports (World & Pakistan)",
          "Books & Authors",
          "World History (Major events)",
          "Current Affairs of Pakistan (Last 6 months)",
          "Government Institutions of Pakistan",
          "National Leadership (Post-independence)",
          "Pakistan's Economy (Basics)",
          "International Relations (Pakistan-centric)",
          "Ideology of Pakistan (Two Nation Theory)",
          "Pakistan Movement (1857-1947)",
          "Quaid-e-Azam & Allama Iqbal (Contributions)",
          "Creation of Pakistan (1947)",
          "Constitution of Pakistan (1956, 1962, 1973)",
          "Geography of Pakistan (Provinces, rivers, dams)",
          "Provinces, Capitals & Major Cities",
          "National Symbols (Flag, anthem, animal, bird)",
          "Important Historical Events (Post-1947)",
          "Natural Resources of Pakistan",
        ],
      },
      {
        name: "Mathematics",
        weightage: "15 Marks",
        topics: [
          "BODMAS Rule & Fractions",
          "LCM & HCF (GCD)",
          "Percentage & its Applications",
          "Profit & Loss",
          "Ratio & Proportion",
          "Averages & Age Problems",
          "Algebraic Formulas & Simplification",
          "Linear Equations",
          "Exponents & Powers",
          "Square Roots & Cube Roots",
          "Basic Shapes (Geometry)",
          "Area & Perimeter (Rectangle, Square, Circle, Triangle)",
          "Angles & Triangles",
          "Operations on Sets (Union, Intersection, Complement)",
          "Types of Sets (Empty, Finite, Infinite, Subset, Universal)",
        ],
      },
    ],
  },
  {
    testName: "Police Constable (Islamabad)",
    subjects: [
      {
        name: "English",
        weightage: "TBD",
        topics: ["TBD - Will be finalized later"],
      },
    ],
  },
];

export function getSyllabus(testName: string): TestSyllabus | undefined {
  const exact = syllabi.find((s) => s.testName === testName);
  if (exact) return exact;
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const a = norm(testName);
  return syllabi.find((s) => {
    const b = norm(s.testName);
    return a.includes(b) || b.includes(a);
  });
}