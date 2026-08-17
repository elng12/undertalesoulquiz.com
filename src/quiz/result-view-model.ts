import { resolveQuizResult } from './scoring';
import {
  findPairingCopy,
  findSpecialCopy,
  findVirtueCopy,
} from '../data/original-result-content';
import type {
  CompletionSpecialId,
  QuizAnswers,
  QuizDataset,
  VirtueCode,
  VirtueScore,
} from './types';

const SITE_URL = 'https://undertalesoulquiz.com/';

const VIRTUE_PRESENTATION: Record<VirtueCode, { label: string; color: string }> = {
  DET: { label: 'Determination', color: '#ed3b3b' },
  BRV: { label: 'Bravery', color: '#f08c36' },
  JUS: { label: 'Justice', color: '#f2cf46' },
  KND: { label: 'Kindness', color: '#46d695' },
  PAT: { label: 'Patience', color: '#58d6e8' },
  INT: { label: 'Integrity', color: '#4e7af0' },
  PER: { label: 'Perseverance', color: '#a46de8' },
};

const SPECIAL_PRESENTATION: Record<CompletionSpecialId, {
  heading: string;
  summary: string;
  color: string;
}> = {
  'all-switch': {
    heading: 'Split Response Pattern',
    summary: 'The first and second halves used opposite extreme responses, producing a special development result.',
    color: '#58d6e8',
  },
  'all-disagree': {
    heading: 'All Strongly Disagree',
    summary: 'Every scored prompt used the strongest disagreement response, producing a special development result.',
    color: '#a9b5b1',
  },
  'all-neutral': {
    heading: 'All Neutral',
    summary: 'Every scored prompt used the neutral response, producing a special development result.',
    color: '#a9b5b1',
  },
  'all-agree': {
    heading: 'All Strongly Agree',
    summary: 'Every scored prompt used the strongest agreement response, producing a special development result.',
    color: '#a9b5b1',
  },
};

export interface ResultVirtueView {
  code: VirtueCode;
  label: string;
  color: string;
  percentage: number;
}

interface ResultViewModelBase {
  datasetVersion: string;
  color: string;
  eyebrow: string;
  heading: string;
  summary: string;
  spreadHeading: string;
  spread: ResultVirtueView[];
  shareText: string;
  siteUrl: string;
  isDevelopmentPreview: boolean;
}

export interface StandardResultViewModel extends ResultViewModelBase {
  kind: 'standard';
  primary: ResultVirtueView;
  secondary: ResultVirtueView;
  shadow: {
    heading: string;
    body: string;
    status: 'content-pending' | 'production-original';
  };
  pairing: {
    heading: string;
    body: string;
    status: 'content-pending' | 'production-original';
  };
}

export interface SpecialResultViewModel extends ResultViewModelBase {
  kind: 'special';
  specialId: CompletionSpecialId;
  specialLabel: string;
}

export type ResultViewModel = StandardResultViewModel | SpecialResultViewModel;

export function buildResultViewModel(
  dataset: QuizDataset,
  answers: QuizAnswers,
): ResultViewModel {
  const result = resolveQuizResult(dataset, answers);
  const isDevelopmentPreview = dataset.questions.some(
    (question) => question.provenance.permissionStatus === 'not-for-production',
  );

  if (result.kind === 'special') {
    const developmentPresentation = SPECIAL_PRESENTATION[result.specialId];
    const originalPresentation = isDevelopmentPreview ? null : findSpecialCopy(result.specialId);
    const presentation = originalPresentation ?? developmentPresentation;
    const spread = result.specialId === 'all-switch'
      ? [specialVirtue('PAT', 50), specialVirtue('DET', 50)]
      : [];
    return {
      kind: 'special',
      specialId: result.specialId,
      specialLabel: result.specialId.toUpperCase(),
      datasetVersion: dataset.datasetVersion,
      color: developmentPresentation.color,
      eyebrow: isDevelopmentPreview ? 'SPECIAL DEVELOPMENT RESULT' : 'SPECIAL SOUL RESULT',
      heading: presentation.heading,
      summary: originalPresentation
        ? `${originalPresentation.summary} ${originalPresentation.interpretationNote}`
        : developmentPresentation.summary,
      spreadHeading: 'Special Result Spread',
      spread,
      shareText: isDevelopmentPreview
        ? `${presentation.heading} - development Undertale Soul Quiz result. ${SITE_URL}`
        : `${presentation.heading} - my Undertale Soul Quiz special result. ${SITE_URL}`,
      siteUrl: SITE_URL,
      isDevelopmentPreview,
    };
  }

  const spread = result.spread.map(toVirtueView);
  const primary = findVirtue(spread, result.primary);
  const secondary = findVirtue(spread, result.secondary);
  const pendingCopy = 'Interpretation copy is intentionally unavailable until the full original content set is reviewed and approved.';
  const virtueCopy = isDevelopmentPreview ? null : findVirtueCopy(result.primary);
  const pairingCopy = isDevelopmentPreview ? null : findPairingCopy(result.primary, result.secondary);

  return {
    kind: 'standard',
    datasetVersion: dataset.datasetVersion,
    color: primary.color,
    eyebrow: isDevelopmentPreview ? 'YOUR DEVELOPMENT SOUL RESULT' : 'YOUR SOUL RESULT',
    heading: `${primary.label} leads your result`,
    summary: virtueCopy?.summary
      ?? 'This result was calculated from synthetic development questions and is not approved as production content.',
    primary,
    secondary,
    spreadHeading: 'Your Full Soul Spread',
    spread,
    shadow: {
      heading: virtueCopy?.shadow.heading ?? `The Shadow of ${primary.label}`,
      body: virtueCopy?.shadow.body ?? pendingCopy,
      status: virtueCopy ? 'production-original' : 'content-pending',
    },
    pairing: {
      heading: pairingCopy?.heading ?? `${primary.label} + ${secondary.label}`,
      body: pairingCopy?.body ?? pendingCopy,
      status: pairingCopy ? 'production-original' : 'content-pending',
    },
    shareText: isDevelopmentPreview
      ? `Development result: ${primary.label} ${primary.percentage}% primary, ${secondary.label} ${secondary.percentage}% secondary. ${SITE_URL}`
      : `My Undertale Soul Quiz result: ${primary.label} ${primary.percentage}% primary, ${secondary.label} ${secondary.percentage}% secondary. ${SITE_URL}`,
    siteUrl: SITE_URL,
    isDevelopmentPreview,
  };
}

function toVirtueView(score: VirtueScore): ResultVirtueView {
  const presentation = VIRTUE_PRESENTATION[score.code];
  return {
    code: score.code,
    label: presentation.label,
    color: presentation.color,
    percentage: score.percentageDisplay,
  };
}

function specialVirtue(code: VirtueCode, percentage: number): ResultVirtueView {
  const presentation = VIRTUE_PRESENTATION[code];
  return { code, label: presentation.label, color: presentation.color, percentage };
}

function findVirtue(spread: ResultVirtueView[], code: VirtueCode): ResultVirtueView {
  const virtue = spread.find((entry) => entry.code === code);
  if (!virtue) throw new Error(`Result spread is missing ${code}.`);
  return virtue;
}
