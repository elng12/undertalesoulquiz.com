import { describe, expect, it, vi } from 'vitest';
import {
  appendTypedSecretCharacter,
  shouldEnterRoom,
} from '../../src/quiz/special-rules';
import type { TypedSecretRule } from '../../src/quiz/types';
import { createSyntheticDataset } from '../fixtures/synthetic-dataset';

describe('shouldEnterRoom', () => {
  const rule = createSyntheticDataset().roomRule;

  it('enters below the 2% threshold in either direction', () => {
    const random = vi.fn(() => 0.019);

    expect(shouldEnterRoom({
      fromQuestionOrder: 57,
      toQuestionOrder: 58,
      hasEgg: false,
      random,
      rule,
    })).toBe(true);
    expect(shouldEnterRoom({
      fromQuestionOrder: 58,
      toQuestionOrder: 57,
      hasEgg: false,
      random,
      rule,
    })).toBe(true);
  });

  it('does not enter at the threshold, off the boundary, or after receiving the egg', () => {
    expect(shouldEnterRoom({
      fromQuestionOrder: 57,
      toQuestionOrder: 58,
      hasEgg: false,
      random: () => 0.02,
      rule,
    })).toBe(false);
    expect(shouldEnterRoom({
      fromQuestionOrder: 56,
      toQuestionOrder: 57,
      hasEgg: false,
      random: () => 0,
      rule,
    })).toBe(false);
    expect(shouldEnterRoom({
      fromQuestionOrder: 57,
      toQuestionOrder: 58,
      hasEgg: true,
      random: () => 0,
      rule,
    })).toBe(false);
  });
});

describe('appendTypedSecretCharacter', () => {
  const rules: TypedSecretRule[] = [
    { id: 'synthetic-alpha', trigger: 'alpha', outcome: 'flowery' },
    { id: 'synthetic-beta', trigger: 'beta', outcome: 'rename' },
  ];

  it('matches case-insensitively and clears the buffer after a match', () => {
    let buffer = '';
    let result = appendTypedSecretCharacter(buffer, 'x', rules);
    buffer = result.buffer;
    for (const character of 'ALPHA') {
      result = appendTypedSecretCharacter(buffer, character, rules);
      buffer = result.buffer;
    }

    expect(result).toEqual({
      buffer: '',
      matchedRuleId: 'synthetic-alpha',
      outcome: 'flowery',
    });
  });

  it('keeps only the longest useful rolling window', () => {
    let result = appendTypedSecretCharacter('zzzzzz', 'b', rules);
    expect(result.buffer).toHaveLength(5);
    for (const character of 'eta') result = appendTypedSecretCharacter(result.buffer, character, rules);

    expect(result.matchedRuleId).toBe('synthetic-beta');
    expect(result.outcome).toBe('rename');
  });

  it('returns an empty inactive buffer when no typed secrets are configured', () => {
    expect(appendTypedSecretCharacter('stale', 'a', [])).toEqual({
      buffer: '',
      matchedRuleId: null,
      outcome: null,
    });
  });
});
