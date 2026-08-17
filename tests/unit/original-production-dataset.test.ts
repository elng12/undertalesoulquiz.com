import { describe, expect, it } from 'vitest';
import { ORIGINAL_PRODUCTION_DATASET } from '../../src/data/original-production-dataset';
import {
  PRODUCTION_PAIRINGS,
  PRODUCTION_SPECIAL_RESULTS,
  PRODUCTION_VIRTUE_RESULTS,
} from '../../src/data/original-result-content';
import { getScoredQuestions, getUnscoredQuestions } from '../../src/quiz/dataset';
import { VIRTUE_CODES } from '../../src/quiz/types';
import type { VirtueCode } from '../../src/quiz/types';
import { validateQuizDataset } from '../../src/quiz/validator';

describe('original production content', () => {
  it('passes the production dataset contract with 66 scored and two unscored questions', () => {
    const validation = validateQuizDataset(ORIGINAL_PRODUCTION_DATASET, { mode: 'production' });

    expect(validation).toEqual({ valid: true, issues: [] });
    expect(getScoredQuestions(ORIGINAL_PRODUCTION_DATASET)).toHaveLength(66);
    expect(getUnscoredQuestions(ORIGINAL_PRODUCTION_DATASET)).toHaveLength(2);
    expect(ORIGINAL_PRODUCTION_DATASET.datasetVersion).toBe('original-production-v1');
    expect(ORIGINAL_PRODUCTION_DATASET.questions.every((question) => (
      question.provenance.sourceKind === 'original-authored'
      && question.provenance.permissionStatus === 'not-required-original'
    ))).toBe(true);
  });

  it('keeps primary target counts balanced and every virtue bidirectional', () => {
    const stats = Object.fromEntries(VIRTUE_CODES.map((code) => [code, {
      total: 0,
      direct: 0,
      reverse: 0,
    }])) as Record<VirtueCode, { total: number; direct: number; reverse: number }>;

    for (const question of getScoredQuestions(ORIGINAL_PRODUCTION_DATASET)) {
      const primary = VIRTUE_CODES.find((code) => Math.abs(question.weights[code]) === 3);
      expect(primary, question.id).toBeDefined();
      if (!primary) continue;
      stats[primary].total += 1;
      stats[primary][question.weights[primary] > 0 ? 'direct' : 'reverse'] += 1;
      expect([1, 2]).toContain(
        Object.values(question.weights).filter((weight) => weight !== 0).length,
      );
    }

    const totals = VIRTUE_CODES.map((code) => stats[code].total);
    expect(Math.max(...totals) - Math.min(...totals)).toBeLessThanOrEqual(1);
    for (const code of VIRTUE_CODES) {
      expect(stats[code].direct, `${code} direct`).toBeGreaterThanOrEqual(4);
      expect(stats[code].reverse, `${code} reverse`).toBeGreaterThanOrEqual(4);
    }
  });

  it('keeps normalisation totals within ten percent of their mean', () => {
    const values = VIRTUE_CODES.map((code) => ORIGINAL_PRODUCTION_DATASET.normalisationMax[code]);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(mean * 0.1);
  });

  it('mixes display order so answer direction never runs longer than two questions', () => {
    const directions = getScoredQuestions(ORIGINAL_PRODUCTION_DATASET).map((question) => {
      const primary = VIRTUE_CODES.find((code) => Math.abs(question.weights[code]) === 3);
      if (!primary) throw new Error(`Missing primary weight for ${question.id}.`);
      return question.weights[primary] > 0 ? 'direct' : 'reverse';
    });
    let longestRun = 1;
    let currentRun = 1;
    let switches = 0;
    for (let index = 1; index < directions.length; index += 1) {
      currentRun = directions[index] === directions[index - 1] ? currentRun + 1 : 1;
      if (directions[index] !== directions[index - 1]) switches += 1;
      longestRun = Math.max(longestRun, currentRun);
    }
    expect(longestRun).toBeLessThanOrEqual(2);
    expect(directions.some((direction, index) => direction === directions[index + 1])).toBe(true);
    expect(switches / (directions.length - 1)).toBeGreaterThanOrEqual(0.4);
    expect(switches / (directions.length - 1)).toBeLessThanOrEqual(0.75);
  });

  it('provides seven deep results, all 42 directed pairings, and four specials', () => {
    expect(PRODUCTION_VIRTUE_RESULTS.map((entry) => entry.code)).toEqual(VIRTUE_CODES);
    expect(PRODUCTION_PAIRINGS).toHaveLength(42);
    expect(PRODUCTION_SPECIAL_RESULTS).toHaveLength(4);

    const pairingKeys = new Set(PRODUCTION_PAIRINGS.map(
      (entry) => `${entry.primary}-${entry.secondary}`,
    ));
    expect(pairingKeys.size).toBe(42);
    for (const primary of VIRTUE_CODES) {
      for (const secondary of VIRTUE_CODES) {
        if (primary === secondary) continue;
        const forward = PRODUCTION_PAIRINGS.find(
          (entry) => entry.primary === primary && entry.secondary === secondary,
        );
        const reverse = PRODUCTION_PAIRINGS.find(
          (entry) => entry.primary === secondary && entry.secondary === primary,
        );
        expect(forward, `${primary}-${secondary}`).toBeDefined();
        expect(forward?.body).not.toBe(reverse?.body);
        expect(wordCount(forward?.body ?? ''), `${primary}-${secondary}`).toBeGreaterThanOrEqual(65);
        expect(wordCount(forward?.body ?? ''), `${primary}-${secondary}`).toBeLessThanOrEqual(95);
      }
    }
  });
});

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}
