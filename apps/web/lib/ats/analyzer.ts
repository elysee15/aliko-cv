// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AtsResult = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  jobKeywords: string[];
  cvKeywords: string[];
  tips: string[];
};

// ---------------------------------------------------------------------------
// French + English stop words (common words to ignore)
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  // French
  "le", "la", "les", "de", "du", "des", "un", "une", "et", "ou", "en",
  "est", "a", "au", "aux", "ce", "ces", "se", "sa", "son", "ses",
  "nous", "vous", "ils", "elles", "sur", "pour", "par", "avec", "dans",
  "qui", "que", "ne", "pas", "plus", "tout", "tous", "être", "avoir",
  "faire", "comme", "mais", "aussi", "très", "bien", "même", "cette",
  "sont", "été", "nos", "vos", "leurs", "notre", "votre", "leur",
  "dont", "où", "quand", "comment", "si", "car", "donc", "afin",
  // English
  "the", "a", "an", "and", "or", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "must",
  "shall", "can", "not", "no", "but", "if", "so", "as", "it",
  "its", "this", "that", "these", "those", "we", "you", "they",
  "our", "your", "their", "my", "his", "her", "who", "what",
  "which", "when", "where", "how", "all", "each", "every",
  "both", "few", "more", "most", "other", "some", "such",
  "than", "too", "very", "just", "about", "also", "then",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\-\+#.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Extract meaningful keywords/phrases from text.
 * Keeps single words + common 2-grams for tech terms.
 */
function extractKeywords(text: string): string[] {
  const tokens = extractTokens(text);
  const freq = new Map<string, number>();

  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }

  // Also extract bigrams for compound terms (e.g. "machine learning")
  const normalized = normalize(text);
  const words = normalized.split(" ");
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (
      words[i]!.length > 2 &&
      words[i + 1]!.length > 2 &&
      !STOP_WORDS.has(words[i]!) &&
      !STOP_WORDS.has(words[i + 1]!)
    ) {
      freq.set(bigram, (freq.get(bigram) ?? 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

function extractCvText(sections: CvSection[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    parts.push(s.title);
    for (const e of s.entries) {
      if (e.title) parts.push(e.title);
      if (e.subtitle) parts.push(e.subtitle);
      if (e.organization) parts.push(e.organization);
      if (e.description) parts.push(e.description);
    }
  }
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Main analyzer
// ---------------------------------------------------------------------------

type CvEntry = {
  title: string;
  subtitle?: string | null;
  organization?: string | null;
  description?: string | null;
};

type CvSection = {
  title: string;
  entries: CvEntry[];
};

type CvData = {
  title: string;
  summary?: string | null;
  sections: CvSection[];
};

export function analyzeAts(jobDescription: string, cv: CvData): AtsResult {
  const jobText = jobDescription;
  const cvText = [cv.title, cv.summary ?? "", extractCvText(cv.sections)].join(" ");

  const jobKeywords = extractKeywords(jobText);
  const cvKeywords = extractKeywords(cvText);
  const cvTokenSet = new Set(extractTokens(cvText));

  const matched: string[] = [];
  const missing: string[] = [];

  // Check job keywords against CV content
  for (const kw of jobKeywords) {
    const kwTokens = kw.split(" ");
    const isMatch = kwTokens.every((t) => cvTokenSet.has(t));
    if (isMatch) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  // Deduplicate and limit
  const uniqueMatched = [...new Set(matched)].slice(0, 30);
  const uniqueMissing = [...new Set(missing)].slice(0, 20);

  // Score: ratio of matched job keywords
  const totalRelevant = Math.max(jobKeywords.length, 1);
  const rawScore = (uniqueMatched.length / totalRelevant) * 100;
  const score = Math.min(Math.round(rawScore), 100);

  // Tips
  const tips: string[] = [];

  if (score < 30) {
    tips.push(
      "Votre CV correspond peu à cette offre. Envisagez d'ajouter les compétences manquantes si elles reflètent votre expérience.",
    );
  } else if (score < 60) {
    tips.push(
      "Score moyen. Ajoutez les mots-clés manquants les plus pertinents pour améliorer la compatibilité.",
    );
  } else if (score < 80) {
    tips.push(
      "Bonne compatibilité ! Quelques ajustements de vocabulaire pourraient encore améliorer le score.",
    );
  } else {
    tips.push("Excellente compatibilité avec cette offre !");
  }

  if (uniqueMissing.length > 5) {
    tips.push(
      `${uniqueMissing.length} mots-clés de l'offre ne figurent pas dans votre CV. Priorisez les plus importants.`,
    );
  }

  if (!cv.summary) {
    tips.push(
      "Ajoutez un résumé/accroche à votre CV — c'est souvent la première chose analysée par les ATS.",
    );
  }

  const skillSection = cv.sections.find(
    (s) => s.title.toLowerCase().includes("compétence") || s.title.toLowerCase().includes("skill"),
  );
  if (!skillSection || skillSection.entries.length < 3) {
    tips.push(
      "Enrichissez votre section Compétences — les ATS y cherchent des correspondances directes.",
    );
  }

  return {
    score,
    matchedKeywords: uniqueMatched,
    missingKeywords: uniqueMissing,
    jobKeywords: jobKeywords.slice(0, 40),
    cvKeywords: cvKeywords.slice(0, 40),
    tips,
  };
}
