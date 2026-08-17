import { computeNormalisationMax } from '../quiz/dataset';
import { ANSWER_PAYOUT, CURVE_EXPONENT } from '../quiz/types';
import type {
  AnswerLabels,
  CompletionSpecialRule,
  Provenance,
  QuizDataset,
  ScoredQuestion,
  UnscoredQuestion,
  VirtueCode,
  WeightVector,
} from '../quiz/types';

export const ORIGINAL_DATASET_VERSION = 'original-production-v1';

const STANDARD_LABELS: AnswerLabels = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
];

const RISK_LABELS: AnswerLabels = [
  'I move first',
  'I usually move first',
  'It depends',
  'I usually wait for someone',
  'I wait for someone else',
];

const CLOSURE_LABELS: AnswerLabels = [
  'I can leave it open',
  'I usually can',
  'It depends',
  'I usually push',
  'I need closure',
];

const PROVENANCE: Provenance = {
  sourceKind: 'original-authored',
  sourceId: 'undertalesoulquiz-original-production',
  sourceVersion: '1',
  obtainedAt: '2026-08-17',
  permissionStatus: 'not-required-original',
};

const COMPLETION_SPECIAL_RULES: CompletionSpecialRule[] = [
  { id: 'all-switch', pattern: 'halves', first: 0, second: 4 },
  { id: 'all-disagree', pattern: 'all', answer: 0 },
  { id: 'all-neutral', pattern: 'all', answer: 2 },
  { id: 'all-agree', pattern: 'all', answer: 4 },
];

const AUTHORED_SCORED_QUESTIONS: ScoredQuestion[] = [
  q(1, 'When an important plan is blocked, I use what the setback revealed to choose a workable next route.', 'DET', 1),
  q(2, 'I name a mistake before anyone asks, even when admitting it may change how people see me.', 'BRV', 1, 'INT'),
  q(3, 'When someone causes harm, I support a response that asks for repair without cutting them off automatically.', 'JUS', 1, 'KND'),
  q(4, 'When someone is struggling to explain what they need, I listen without rushing to finish the answer for them.', 'KND', 1, 'PAT'),
  q(5, 'Before judging a disputed decision, I wait long enough to learn whose costs or concerns were left out.', 'PAT', 1, 'JUS'),
  q(6, 'When new evidence changes my public position, I explain what changed even if the revision feels exposed.', 'INT', 1, 'BRV'),
  q(7, 'When progress on a difficult skill stalls, I try a different method and continue working toward the same goal.', 'PER', 1, 'DET'),

  q(8, 'When the first route to an important goal closes, I spend more time wishing it had worked than choosing what to try next.', 'DET', -1),
  q(9, 'When a necessary action involves visible risk, I wait for someone else even when waiting will not make the situation clearer.', 'BRV', -1, 'PAT', RISK_LABELS),
  q(10, 'When an outcome favors my side, keeping the result matters more to me than checking it against the process I usually support.', 'JUS', -1, 'INT'),
  q(11, 'When someone faces a difficult consequence, I focus on what they chose before considering what practical help might still reduce the harm.', 'KND', -1),
  q(12, 'When a situation can remain unresolved for now, I still push for a conclusion so I can stop waiting.', 'PAT', -1, undefined, CLOSURE_LABELS),
  q(13, 'When explaining my position would create friction, I leave different groups with different impressions of what I support.', 'INT', -1),
  q(14, 'I switch to a new project when the current one becomes repetitive, even though its goal still matters and progress remains possible.', 'PER', -1),

  q(15, 'After a proposal is rejected, I make a smaller next attempt even when another rejection would feel embarrassing.', 'DET', 1, 'BRV'),
  q(16, 'When a person is being singled out unfairly, I interrupt the moment instead of offering support only after it ends.', 'BRV', 1, 'KND'),
  q(17, 'I apply a shared rule to someone close to me and explain any exception instead of hiding it.', 'JUS', 1, 'INT'),
  q(18, 'When I cannot provide the help someone requests, I say what I can offer rather than promising more than I can deliver.', 'KND', 1, 'INT'),
  q(19, 'I can let a slow learning process unfold without abandoning the practice just because improvement is hard to see.', 'PAT', 1, 'PER'),
  q(20, 'I disclose a personal interest that could influence a group decision before asking others to trust my judgment.', 'INT', 1, 'JUS'),
  q(21, 'After time away from a demanding goal, I return with a revised routine instead of waiting to feel fully motivated.', 'PER', 1, 'DET'),

  q(22, 'When a plan breaks, I replace it immediately so I do not have to sit with uncertainty or reconsider the goal.', 'DET', -1, 'PAT'),
  q(23, 'I avoid defending someone who is being dismissed when speaking up could make me the next target.', 'BRV', -1),
  q(24, 'Once I decide who is at fault, punishment feels more important than understanding what repair would help the people affected.', 'JUS', -1, 'KND'),
  q(25, 'If I cannot keep a promise to help, I become difficult to reach instead of explaining my limit directly.', 'KND', -1, 'INT'),
  q(26, 'I postpone a necessary conversation after the important facts are clear because starting it still feels uncomfortable.', 'PAT', -1, 'BRV'),
  q(27, 'I check exceptions less carefully when they benefit me than when the same kind of exception benefits someone else.', 'INT', -1, 'JUS'),
  q(28, 'I keep repeating an ineffective method because changing it would feel like admitting that my earlier effort was wasted.', 'PER', -1, 'DET'),

  q(29, 'When a larger plan is cancelled, I choose one reachable part of its purpose and move that forward.', 'DET', 1),
  q(30, 'I ask for help when I am uncertain, even if doing so makes my lack of experience visible.', 'BRV', 1),
  q(31, 'Before choosing a consequence, I hear the relevant context and look for a response proportionate to the harm.', 'JUS', 1, 'PAT'),
  q(32, 'I continue offering practical support after the first urgent moment has passed and attention has moved elsewhere.', 'KND', 1, 'PER'),
  q(33, 'When someone needs time to decide, I remain available without repeatedly pressing them for an answer.', 'PAT', 1, 'KND'),
  q(34, 'When I revise a commitment, I explain the change and make a realistic new plan instead of quietly abandoning it.', 'INT', 1, 'DET'),
  q(35, 'I return to an important routine on ordinary days when there is no burst of motivation or visible reward.', 'PER', 1),

  q(36, 'I take longer to acknowledge that a plan is no longer working when I have already defended it publicly.', 'DET', -1, 'INT'),
  q(37, 'I stay quiet about an unfair group decision when questioning it would bring unwanted attention to me.', 'BRV', -1, 'JUS'),
  q(38, 'I prefer the same penalty for every mistake even when the circumstances and harm are meaningfully different.', 'JUS', -1),
  q(39, 'When I believe someone needs help, I pressure them to accept it before they have time to say what they want.', 'KND', -1, 'PAT'),
  q(40, 'I keep waiting for more certainty when the available information is already enough to make a responsible choice.', 'PAT', -1),
  q(41, 'When helping becomes less convenient than expected, I delay telling the other person that my availability has changed.', 'INT', -1, 'KND'),
  q(42, 'I stop practicing after feedback makes me feel exposed, even though the goal still matters to me.', 'PER', -1, 'BRV'),

  q(43, 'After an obstacle, I pause long enough to map the options and then commit to the most workable new route.', 'DET', 1, 'PAT'),
  q(44, 'I return to a necessary difficult conversation after the first attempt goes badly instead of treating the discomfort as a final answer.', 'BRV', 1, 'PER'),
  q(45, 'When work must be shared, I consider differences in power and capacity before deciding what counts as an equal contribution.', 'JUS', 1),
  q(46, 'I ask what kind of help is welcome even when hearing no may feel awkward or leave me unsure what to do.', 'KND', 1, 'BRV'),
  q(47, 'I wait for a specific condition until a planned decision point, then choose another route if the condition has not changed.', 'PAT', 1, 'DET'),
  q(48, 'I follow the same standard in private that I ask other people to follow when the choice is visible.', 'INT', 1),
  q(49, 'I keep doing my share of unglamorous group work after recognition fades and the task becomes routine.', 'PER', 1, 'JUS'),

  q(50, 'When one approach fails, I treat the entire goal as finished instead of deciding whether another route is worth trying.', 'DET', -1, 'PER'),
  q(51, 'I disguise a serious concern as a joke so I can deny that I meant it if other people react badly.', 'BRV', -1),
  q(52, 'When a limited benefit cannot reach everyone, I favor a rule that gives people like me priority before considering who has greater need.', 'JUS', -1),
  q(53, 'I give advice before checking whether it is wanted, then treat the advice itself as proof that I was helpful.', 'KND', -1),
  q(54, 'I decide what is fair before the people affected have a reasonable chance to explain the impact.', 'PAT', -1, 'JUS'),
  q(55, 'I avoid admitting that my view changed because I am afraid people will respect me less for revising it.', 'INT', -1, 'BRV'),
  q(56, 'I work on a long-term goal only when I feel inspired, even when a small scheduled effort would still be possible.', 'PER', -1),

  q(57, 'When resources change, I adapt the scale of my plan while protecting the part of the goal that matters most.', 'DET', 1),
  q(58, 'When a blocked route leaves an uncertain alternative, I check the risks and take that route if action is still necessary.', 'BRV', 1, 'DET'),
  q(59, 'I look for a repair plan that addresses what the harmed person needs, not only what rule was broken.', 'JUS', 1, 'KND'),
  q(60, 'When someone is quietly left out, I make space for them without turning the invitation into a public display.', 'KND', 1),
  q(61, 'I hold back a confident answer until I can verify it rather than filling the gap with something that only sounds certain.', 'PAT', 1, 'INT'),
  q(62, 'When keeping a promise becomes inconvenient, I continue the repeated effort needed to honor it.', 'INT', 1, 'PER'),
  q(63, 'I continue a routine care task after thanks and attention have faded, while checking that the support is still useful.', 'PER', 1, 'KND'),

  q(64, 'After a setback, I let other people choose the next route because taking responsibility for another decision feels exhausting.', 'DET', -1),
  q(65, 'After one visible rejection, I avoid another worthwhile attempt mainly because I do not want to feel exposed again.', 'BRV', -1, 'PER'),
  q(66, 'When involving affected people would slow a decision, I give process efficiency more weight than their participation.', 'JUS', -1, 'KND'),
];

const SCORED_QUESTIONS = orderForDisplay(AUTHORED_SCORED_QUESTIONS);

const UNSCORED_QUESTIONS: UnscoredQuestion[] = [
  {
    kind: 'unscored',
    id: 'original-final-door',
    order: 67,
    prompt: 'A door appears where the corridor should end. Do you open it?',
    options: [
      { id: 'no', label: 'Leave it closed' },
      { id: 'yes', label: 'Open the door' },
    ],
    followUps: [
      { when: 'no', text: 'The outline fades without a sound.' },
      { when: 'yes', text: 'There is another corridor, facing the wrong way.' },
    ],
    provenance: { ...PROVENANCE },
  },
  {
    kind: 'unscored',
    id: 'original-final-voice',
    order: 68,
    prompt: 'Something beyond the last screen asks whether the choice was yours. Do you answer?',
    options: [
      { id: 'no', label: 'Stay silent' },
      { id: 'yes', label: 'Say yes' },
    ],
    followUps: [
      { when: 'no', text: 'The question remains after the voice is gone.' },
      { when: 'yes', text: 'The screen accepts the answer without confirming it.' },
    ],
    provenance: { ...PROVENANCE },
  },
];

export const ORIGINAL_PRODUCTION_DATASET: QuizDataset = {
  schemaVersion: 1,
  datasetVersion: ORIGINAL_DATASET_VERSION,
  questions: [...SCORED_QUESTIONS, ...UNSCORED_QUESTIONS],
  completionSpecialRules: structuredClone(COMPLETION_SPECIAL_RULES),
  roomRule: {
    id: 'room-between',
    boundary: [57, 58],
    probabilityPerCrossing: 0.02,
    reward: 'egg',
  },
  answerPayout: [...ANSWER_PAYOUT],
  curveExponent: CURVE_EXPONENT,
  normalisationMax: computeNormalisationMax(SCORED_QUESTIONS),
};

function q(
  order: number,
  prompt: string,
  primary: VirtueCode,
  direction: 1 | -1,
  secondary?: VirtueCode,
  labels: AnswerLabels = STANDARD_LABELS,
): ScoredQuestion {
  const weights = emptyWeights();
  weights[primary] = 3 * direction;
  if (secondary) weights[secondary] = 2 * direction;
  return {
    kind: 'scored',
    id: `original-scored-${String(order).padStart(2, '0')}`,
    order,
    prompt,
    labels: [...labels],
    weights,
    provenance: { ...PROVENANCE },
  };
}

function emptyWeights(): WeightVector {
  return { DET: 0, BRV: 0, JUS: 0, KND: 0, PAT: 0, INT: 0, PER: 0 };
}

function orderForDisplay(authored: ScoredQuestion[]): ScoredQuestion[] {
  const directSourceOrder = [1, 4, 7, 3, 6, 2, 5, 18, 21, 17, 20, 16, 19, 15,
    35, 31, 34, 30, 33, 29, 32, 46, 49, 45, 48, 44, 47, 43, 63, 59, 62, 58,
    61, 57, 60];
  const reverseSourceOrder = [10, 13, 9, 12, 8, 11, 14, 25, 28, 24, 27, 23, 26, 22,
    40, 37, 41, 38, 42, 36, 39, 52, 55, 51, 54, 50, 53, 56, 65, 66, 64];
  const bySourceOrder = new Map(authored.map((question) => [question.order, question]));
  const direct = directSourceOrder.map((order) => requiredQuestion(bySourceOrder, order));
  const reverse = reverseSourceOrder.map((order) => requiredQuestion(bySourceOrder, order));
  const directRuns = [2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  const reverseRuns = [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1];
  const ordered: ScoredQuestion[] = [];
  let directIndex = 0;
  let reverseIndex = 0;

  directRuns.forEach((directLength, runIndex) => {
    for (let offset = 0; offset < directLength; offset += 1) {
      ordered.push(requiredQuestionAt(direct, directIndex));
      directIndex += 1;
    }
    const reverseLength = reverseRuns[runIndex] ?? 0;
    for (let offset = 0; offset < reverseLength; offset += 1) {
      ordered.push(requiredQuestionAt(reverse, reverseIndex));
      reverseIndex += 1;
    }
  });

  return ordered.map((question, index) => ({
    ...question,
    id: `original-scored-${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
  }));
}

function requiredQuestion(
  questions: Map<number, ScoredQuestion>,
  sourceOrder: number,
): ScoredQuestion {
  const question = questions.get(sourceOrder);
  if (!question) throw new Error(`Missing authored question ${sourceOrder}.`);
  return question;
}

function requiredQuestionAt(questions: ScoredQuestion[], index: number): ScoredQuestion {
  const question = questions[index];
  if (!question) throw new Error(`Missing display question at index ${index}.`);
  return question;
}
