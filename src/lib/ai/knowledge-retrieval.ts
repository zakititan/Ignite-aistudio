import { ARTICLES } from "@/lib/library";
import { GLOSSARY_TERMS } from "@/lib/support-data";

export interface KbExcerpt {
  title: string;
  text: string;
  route: string;
}

export function retrieveKbExcerpts(query: string, maxChars = 2500): KbExcerpt[] {
  const q = query.toLowerCase();
  const scored: Array<{ excerpt: KbExcerpt; score: number }> = [];

  for (const article of ARTICLES) {
    const text = `${article.title} ${article.summary} ${article.category}`.toLowerCase();
    let score = 0;
    for (const word of q.split(/\s+/)) {
      if (word.length < 3) continue;
      if (text.includes(word)) score += 1;
    }
    if (score > 0) {
      scored.push({
        excerpt: {
          title: article.title,
          text: `${article.title}: ${article.summary}`,
          route: "/learn",
        },
        score,
      });
    }
  }

  for (const term of GLOSSARY_TERMS) {
    const text = `${term.term} ${term.definition} ${term.category}`.toLowerCase();
    let score = 0;
    for (const word of q.split(/\s+/)) {
      if (term.term.toLowerCase().includes(word) || text.includes(word)) score += 1;
    }
    if (score > 0) {
      scored.push({
        excerpt: {
          title: term.term,
          text: `${term.term}: ${term.definition}`,
          route: term.relatedTo,
        },
        score,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const result: KbExcerpt[] = [];
  let total = 0;
  for (const s of scored) {
    if (result.length >= 3) break;
    const len = s.excerpt.text.length;
    if (total + len > maxChars) continue;
    result.push(s.excerpt);
    total += len;
  }
  return result;
}
