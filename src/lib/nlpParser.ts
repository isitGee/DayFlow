import { addDays, format } from 'date-fns';
import type { ParsedTaskDraft } from '../types';

// A small, dependency-free heuristic parser. Designed to be swapped out for
// an AI-backed implementation later via services/aiService.ts without
// changing the calling code (see QuickAddModal / MobileCapture).

const DURATION_RE = /\b(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m)\b/i;
const FOR_TWO_WORDS_RE = /\bfor\s+(an?|one|two|three|four|five|six)\s+(hours?|hrs?|minutes?|mins?)\b/i;
const WORD_NUM: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };

const TIME_OF_DAY: Array<{ re: RegExp; value: 'morning' | 'afternoon' | 'evening' }> = [
  { re: /\bmorning\b/i, value: 'morning' },
  { re: /\bafternoon\b/i, value: 'afternoon' },
  { re: /\b(evening|tonight|night)\b/i, value: 'evening' },
];

function stripAndCollect(input: string): { title: string; estimatedMinutes?: number; scheduledDate?: string | null; suggestedTimeOfDay?: 'morning' | 'afternoon' | 'evening' | null } {
  let text = input.trim();
  let estimatedMinutes: number | undefined;
  let scheduledDate: string | null | undefined;
  let suggestedTimeOfDay: 'morning' | 'afternoon' | 'evening' | null = null;

  const wordMatch = text.match(FOR_TWO_WORDS_RE);
  if (wordMatch) {
    const n = WORD_NUM[wordMatch[1].toLowerCase()] ?? 1;
    const unit = wordMatch[2].toLowerCase();
    estimatedMinutes = unit.startsWith('h') ? n * 60 : n;
    text = text.replace(wordMatch[0], '').trim();
  } else {
    const durMatch = text.match(DURATION_RE);
    if (durMatch) {
      const n = parseFloat(durMatch[1]);
      const unit = durMatch[2].toLowerCase();
      estimatedMinutes = unit.startsWith('h') ? Math.round(n * 60) : Math.round(n);
      text = text.replace(durMatch[0], '').trim();
    }
  }

  const today = new Date();
  if (/\btomorrow\b/i.test(text)) {
    scheduledDate = format(addDays(today, 1), 'yyyy-MM-dd');
    text = text.replace(/\btomorrow\b/i, '').trim();
  } else if (/\btoday\b/i.test(text)) {
    scheduledDate = format(today, 'yyyy-MM-dd');
    text = text.replace(/\btoday\b/i, '').trim();
  } else {
    const weekdayMatch = text.match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b/i);
    if (weekdayMatch) {
      // naive: just drop the word, leave scheduling to the user via the picker
      text = text.replace(weekdayMatch[0], '').trim();
    }
  }

  for (const { re, value } of TIME_OF_DAY) {
    if (re.test(text)) {
      suggestedTimeOfDay = value;
      text = text.replace(re, '').trim();
      break;
    }
  }

  text = text
    .replace(/\bfor\b\s*$/i, '')
    .replace(/\bat\b\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.-]+|[\s,.-]+$/g, '')
    .trim();

  // Capitalize first letter
  if (text.length) text = text[0].toUpperCase() + text.slice(1);

  return { title: text || input.trim(), estimatedMinutes, scheduledDate, suggestedTimeOfDay };
}

export function parseNaturalLanguageTask(input: string): ParsedTaskDraft {
  const { title, estimatedMinutes, scheduledDate, suggestedTimeOfDay } = stripAndCollect(input);
  return {
    title,
    estimatedMinutes,
    scheduledDate: scheduledDate ?? null,
    suggestedTimeOfDay: suggestedTimeOfDay ?? null,
    dueDate: scheduledDate ?? null,
  };
}
