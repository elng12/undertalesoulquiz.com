import { describe, expect, it } from 'vitest';
import {
  CALIBRATION_ANSWER_LABELS,
  ORIGINAL_CONTENT_CALIBRATION,
} from '../../src/data/original-content-calibration';
import { VIRTUE_CODES } from '../../src/quiz/types';
import type { VirtueCode } from '../../src/quiz/types';

describe('original content calibration', () => {
  it('is isolated from production and records original authorship', () => {
    expect(ORIGINAL_CONTENT_CALIBRATION).toMatchObject({
      sampleVersion: 'original-calibration-v3',
      status: 'calibration-only',
      productionEligible: false,
      contentRoute: 'experience-compatible-independent-original',
    });
    for (const question of ORIGINAL_CONTENT_CALIBRATION.questions) {
      expect(question.provenance).toMatchObject({
        sourceKind: 'original-authored',
        sourceVersion: '3',
        permissionStatus: 'not-required-original',
      });
    }
  });

  it('contains one direct and one reverse draft for every virtue', () => {
    const questions = ORIGINAL_CONTENT_CALIBRATION.questions;
    expect(questions).toHaveLength(14);
    expect(new Set(questions.map((question) => question.id)).size).toBe(14);
    expect(questions.map((question) => question.order)).toEqual(
      Array.from({ length: 14 }, (_, index) => index + 1),
    );

    for (const code of VIRTUE_CODES) {
      const targeted = questions.filter((question) => question.target === code);
      expect(targeted.map((question) => question.direction).sort()).toEqual(['direct', 'reverse']);
    }
  });

  it('uses the calibrated weight pattern and balanced normalisation totals', () => {
    const totals = Object.fromEntries(VIRTUE_CODES.map((code) => [code, 0])) as Record<VirtueCode, number>;
    const dimensionCounts = { 1: 0, 2: 0, 3: 0 } as Record<number, number>;
    let mixedSignCount = 0;
    let customLabelCount = 0;

    for (const question of ORIGINAL_CONTENT_CALIBRATION.questions) {
      expect(question.prompt.length).toBeGreaterThanOrEqual(50);
      expect(question.prompt.length).toBeLessThanOrEqual(160);
      const nonZero = VIRTUE_CODES.filter((code) => question.weights[code] !== 0);
      dimensionCounts[nonZero.length] += 1;
      if (nonZero.some((code) => question.weights[code] > 0)
        && nonZero.some((code) => question.weights[code] < 0)) mixedSignCount += 1;
      if (question.labels.join('|') !== CALIBRATION_ANSWER_LABELS.join('|')) customLabelCount += 1;

      expect(question.labels).toHaveLength(5);
      expect(question.labels.every((label) => label.trim().length > 0)).toBe(true);
      expect([question.prompt, ...question.labels].join(' ')).not.toMatch(/\b(?:always|never)\b/i);
      expect(question.weights[question.target]).toBe(question.direction === 'direct' ? 3 : -3);
      for (const code of nonZero.filter((code) => code !== question.target)) {
        expect(Math.abs(question.weights[code])).toBe(2);
      }
      for (const code of VIRTUE_CODES) totals[code] += Math.abs(question.weights[code]);
    }

    expect(dimensionCounts).toEqual({ 1: 7, 2: 7, 3: 0 });
    expect(mixedSignCount).toBe(0);
    expect(customLabelCount).toBe(2);
    expect(totals).toEqual({ DET: 8, BRV: 8, JUS: 8, KND: 8, PAT: 8, INT: 8, PER: 8 });
  });

  it('provides complete result, shadow, pairing, and special-result samples', () => {
    const content = ORIGINAL_CONTENT_CALIBRATION;
    expect(content.virtueResults.map((entry) => entry.code).sort()).toEqual([...VIRTUE_CODES].sort());
    for (const result of content.virtueResults) {
      expect(wordCount(result.summary)).toBeGreaterThanOrEqual(80);
      expect(wordCount(result.summary)).toBeLessThanOrEqual(110);
      expect(wordCount(result.shadow.body)).toBeGreaterThanOrEqual(60);
      expect(wordCount(result.shadow.body)).toBeLessThanOrEqual(90);
      expect(result.confusedWith.code).not.toBe(result.code);
      expect(wordCount(result.confusedWith.body)).toBeGreaterThanOrEqual(50);
      expect(wordCount(result.confusedWith.body)).toBeLessThanOrEqual(80);
    }
    expect(content.pairingSamples).toHaveLength(3);
    expect(new Set(content.pairingSamples.map((entry) => `${entry.primary}-${entry.secondary}`)).size).toBe(3);
    expect(content.pairingSamples.every((entry) => entry.primary !== entry.secondary)).toBe(true);
    expect(content.pairingSamples.every((entry) => wordCount(entry.body) >= 65 && wordCount(entry.body) <= 95)).toBe(true);
    expect(content.specialResultSamples).toEqual([
      expect.objectContaining({ specialId: 'all-neutral', heading: 'The Unchosen Path' }),
    ]);
    expect(wordCount(content.specialResultSamples[0].summary)).toBeGreaterThanOrEqual(45);
    expect(wordCount(content.specialResultSamples[0].summary)).toBeLessThanOrEqual(80);
    expect(wordCount(content.specialResultSamples[0].interpretationNote)).toBeGreaterThanOrEqual(20);
    expect(wordCount(content.specialResultSamples[0].interpretationNote)).toBeLessThanOrEqual(50);
  });

  it('does not present the drafts as the reference test or as diagnosis', () => {
    const strings = [
      ...ORIGINAL_CONTENT_CALIBRATION.questions.map((entry) => entry.prompt),
      ...ORIGINAL_CONTENT_CALIBRATION.virtueResults.flatMap((entry) => [
        entry.summary,
        entry.shadow.heading,
        entry.shadow.body,
        entry.confusedWith.heading,
        entry.confusedWith.body,
      ]),
      ...ORIGINAL_CONTENT_CALIBRATION.pairingSamples.flatMap((entry) => [entry.heading, entry.body]),
      ...ORIGINAL_CONTENT_CALIBRATION.specialResultSamples.flatMap((entry) => [
        entry.heading,
        entry.summary,
        entry.interpretationNote,
      ]),
    ];
    const normalized = strings.map((entry) => entry.trim().toLowerCase());

    expect(new Set(normalized).size).toBe(normalized.length);
    expect(strings.join(' ')).not.toMatch(/jaden|official test|scientific|diagnos(?:e|is|tic)/i);
  });
});

function wordCount(value: string): number {
  return value.trim().split(/\s+/).length;
}
