import { describe, expect, it } from 'vitest';
import { parseNaturalLanguageTask } from '../lib/nlpParser';

describe('parseNaturalLanguageTask', () => {
  it('extracts duration in hours and a relative date', () => {
    const result = parseNaturalLanguageTask('Study networking for two hours tomorrow morning');
    expect(result.title.toLowerCase()).toContain('study networking');
    expect(result.estimatedMinutes).toBe(120);
    expect(result.suggestedTimeOfDay).toBe('morning');
    expect(result.scheduledDate).toBeTruthy();
  });

  it('extracts numeric minute durations', () => {
    const result = parseNaturalLanguageTask('Call John for 15 minutes');
    expect(result.estimatedMinutes).toBe(15);
  });

  it('falls back to the raw input when nothing can be parsed', () => {
    const result = parseNaturalLanguageTask('Buy milk');
    expect(result.title).toBe('Buy milk');
    expect(result.estimatedMinutes).toBeUndefined();
  });
});
