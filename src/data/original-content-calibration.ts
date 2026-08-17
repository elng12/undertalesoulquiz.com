import type {
  AnswerLabels,
  CompletionSpecialId,
  Provenance,
  VirtueCode,
  WeightVector,
} from '../quiz/types';

export const CALIBRATION_ANSWER_LABELS: AnswerLabels = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
];

const RISK_ANSWER_LABELS: AnswerLabels = [
  'I move first',
  'I usually move first',
  'It depends',
  'I usually wait for someone',
  'I wait for someone else',
];

const CLOSURE_ANSWER_LABELS: AnswerLabels = [
  'I can leave it open',
  'I usually can',
  'It depends',
  'I usually push',
  'I need closure',
];

const ORIGINAL_PROVENANCE: Provenance = {
  sourceKind: 'original-authored',
  sourceId: 'undertalesoulquiz-original-calibration',
  sourceVersion: '3',
  obtainedAt: '2026-08-17',
  permissionStatus: 'not-required-original',
};

export interface CalibrationQuestion {
  kind: 'scored';
  id: string;
  order: number;
  target: VirtueCode;
  direction: 'direct' | 'reverse';
  prompt: string;
  labels: AnswerLabels;
  weights: WeightVector;
  provenance: Provenance;
}

export interface CalibrationVirtueCopy {
  code: VirtueCode;
  label: string;
  summary: string;
  shadow: { heading: string; body: string };
  confusedWith: {
    code: VirtueCode;
    heading: string;
    body: string;
  };
}

export interface CalibrationPairingCopy {
  primary: VirtueCode;
  secondary: VirtueCode;
  heading: string;
  body: string;
}

export interface CalibrationSpecialCopy {
  specialId: CompletionSpecialId;
  heading: string;
  summary: string;
  interpretationNote: string;
}

export interface OriginalContentCalibration {
  sampleVersion: string;
  status: 'calibration-only';
  productionEligible: false;
  contentRoute: 'experience-compatible-independent-original';
  questions: CalibrationQuestion[];
  virtueResults: CalibrationVirtueCopy[];
  pairingSamples: CalibrationPairingCopy[];
  specialResultSamples: CalibrationSpecialCopy[];
}

export const ORIGINAL_CONTENT_CALIBRATION: OriginalContentCalibration = {
  sampleVersion: 'original-calibration-v3',
  status: 'calibration-only',
  productionEligible: false,
  contentRoute: 'experience-compatible-independent-original',
  questions: [
    question(1, 'DET', 'direct',
      'When an important plan is blocked, I use what the setback revealed to choose a workable next route.',
      { DET: 3 }),
    question(2, 'DET', 'reverse',
      'When the first route to an important goal closes, I spend more time wishing it had worked than choosing what to try next.',
      { DET: -3 }),
    question(3, 'BRV', 'direct',
      'I raise a concern about a group decision when it conflicts with a shared standard, even if I expect disagreement.',
      { BRV: 3, JUS: 2 }),
    question(4, 'BRV', 'reverse',
      'When a necessary action involves visible risk, I wait for someone else even when waiting will not make the situation clearer.',
      { BRV: -3, PAT: -2 }, RISK_ANSWER_LABELS),
    question(5, 'JUS', 'direct',
      'When someone close to me causes harm, I support a response that asks for repair without cutting them off automatically.',
      { JUS: 3, KND: 2 }),
    question(6, 'JUS', 'reverse',
      'When an outcome favors my side, keeping the result matters more to me than checking it against the process I usually support.',
      { JUS: -3, INT: -2 }),
    question(7, 'KND', 'direct',
      'When someone welcomes my help, I keep checking in if their difficult situation does not quickly improve.',
      { KND: 3, PER: 2 }),
    question(8, 'KND', 'reverse',
      'When someone faces a difficult consequence, I focus on what they chose before considering what practical help might still reduce the harm.',
      { KND: -3 }),
    question(9, 'PAT', 'direct',
      'When a decision can wait, I prefer to see what changes before I commit to one answer.',
      { PAT: 3 }),
    question(10, 'PAT', 'reverse',
      'When a situation can remain unresolved for now, I still push for a conclusion so I can stop waiting.',
      { PAT: -3 }, CLOSURE_ANSWER_LABELS),
    question(11, 'INT', 'direct',
      'When new evidence changes my position, I explain what changed even if other people notice the inconsistency.',
      { INT: 3, BRV: 2 }),
    question(12, 'INT', 'reverse',
      'When explaining my position would create friction, I leave different groups with different impressions of what I support.',
      { INT: -3 }),
    question(13, 'PER', 'direct',
      'When progress on a difficult skill stalls, I try a different method and continue working toward the same goal.',
      { PER: 3, DET: 2 }),
    question(14, 'PER', 'reverse',
      'I switch to a new project when the current one becomes repetitive, even though its goal still matters and progress remains possible.',
      { PER: -3 }),
  ],
  virtueResults: [
    {
      code: 'DET',
      label: 'Determination',
      summary: 'You tend to meet a blocked path by looking for another route before the setback can make the decision for you. Determination shows up here as active resolve: you keep the goal in view, test what can still move, and recover some choice when circumstances narrow it. This does not mean charging ahead forever. At your best, you can tell the difference between a difficult route and a destination that no longer deserves the cost. You make progress by choosing again, not by pretending the obstacle was never there.',
      shadow: {
        heading: 'When Determination Cannot Pause',
        body: 'Resolve can become restless control when every blocked path demands an immediate replacement. You may launch another route before understanding what changed, treating any pause as proof that the obstacle has won. A steadier determination can tolerate a stretch with no clear move. It gathers what the interruption revealed, allows frustration to settle, and chooses the next direction because it fits the purpose, not simply because motion feels safer than uncertainty.',
      },
      confusedWith: {
        code: 'PER',
        heading: 'Determination Is Not Perseverance',
        body: 'Both traits keep movement alive, but they answer different problems. Determination becomes visible when a route is blocked and you must choose how to proceed. Perseverance carries effort through repetition after the route is already known. Restarting quickly after a cancelled plan points toward Determination; practicing the same difficult skill across an ordinary month points more toward Perseverance.',
      },
    },
    {
      code: 'BRV',
      label: 'Bravery',
      summary: 'You are inclined to move toward a necessary choice while fear, uncertainty, or unwanted attention is still present. Bravery in this result does not require alarm to vanish. It is the ability to notice risk, decide what deserves protection, and act without demanding perfect confidence first. That may look dramatic, but it often appears in smaller moments: naming a problem, asking for help, setting a boundary, or accepting that others may disagree. Your courage is strongest when the action serves something important rather than merely proving that you can endure danger.',
      shadow: {
        heading: 'When Bravery Needs an Audience',
        body: 'Courage can become reckless when action starts serving as evidence that you are not afraid. You may dismiss preparation, caution, or retreat because they look less impressive than going first. Bravery stays useful when every risk does not have to become a test of character. It asks whether the action protects what matters, whether support would improve the outcome, and whether stepping back now creates a better chance to act effectively later.',
      },
      confusedWith: {
        code: 'DET',
        heading: 'Bravery Is Not Determination',
        body: 'Bravery concerns what you do while fear or exposure is active; Determination concerns what you do after obstruction changes the route. Speaking first in a tense room may be brave even if the task ends there. Rebuilding a plan after the room rejects it may be determined. One faces the emotional cost of action, while the other restores direction after a setback.',
      },
    },
    {
      code: 'JUS',
      label: 'Justice',
      summary: 'You notice the moment a rule is applied differently depending on who benefits. In a shared project, that may mean asking why one mistake is forgiven while another receives the full penalty, or who will carry a decision\'s hidden cost. Justice leads you to make standards visible, name responsibility, and look for a repair that fits the harm. It does not require treating every case identically. Your strongest response balances consistency with context, so accountability can protect people, restore trust, and reduce the chance of repetition.',
      shadow: {
        heading: 'When Justice Rushes to a Verdict',
        body: 'A clear rule can feel reassuring when a conflict is messy, but reaching the correct verdict may start to matter more than understanding what repair requires. Context can look like an excuse, and one response can seem suitable for very different harms. Justice works better when accountability is firm without making punishment the only proof of seriousness. Power, intent, impact, and the chance of repetition all belong in the decision.',
      },
      confusedWith: {
        code: 'INT',
        heading: 'Justice Is Not Integrity',
        body: 'Justice evaluates shared rules, unequal outcomes, and responsibility between people. Integrity evaluates whether your own claims and actions can honestly stand together. You can keep a personal promise and still ignore an unfair system, or challenge an unfair policy while hiding your own inconsistency. The traits often cooperate, but one looks outward at a common field and the other looks inward at alignment.',
      },
    },
    {
      code: 'KND',
      label: 'Kindness',
      summary: 'You tend to notice what another person may need and turn concern into support they can actually use. Kindness in this result is more than having warm intentions. It includes checking in again, listening before assuming, and helping without making the other person perform gratitude. It also leaves you present in your own life. At its best, your care respects consent, capacity, and the difference between standing beside someone and taking over their choices. You make compassion durable by pairing it with honesty about what you can offer.',
      shadow: {
        heading: 'When Kindness Erases the Helper',
        body: 'Care can become self-erasure when every need sounds like an obligation and every boundary feels selfish. You may rescue people from consequences they need to understand or quietly resent support you never had the capacity to give. Durable kindness is specific and honest. It asks what help is welcome, names its limits before exhaustion does, and allows other people to carry responsibility without treating that boundary as abandonment.',
      },
      confusedWith: {
        code: 'PAT',
        heading: 'Kindness Is Not Patience',
        body: 'Kindness determines how you respond to another person\'s needs; Patience determines whether time and uncertainty should be allowed to work. Waiting without pressure can be kind, but delay can also leave someone unsupported. Offering immediate help can be kind even when patience is not relevant. The distinction is whether the central choice concerns care and impact or timing and restraint.',
      },
    },
    {
      code: 'PAT',
      label: 'Patience',
      summary: 'You are comfortable giving a decision, a person, or an uncertain situation enough time to become clearer before forcing an answer. Patience appears here as active restraint rather than simple slowness. You observe what changes, preserve options, and resist using immediate action only to escape discomfort. This can steady a group when everyone else wants certainty on demand. Your patience works best when it has a purpose and a stopping point: you know what information you are waiting for, what can happen meanwhile, and when waiting has finished doing useful work.',
      shadow: {
        heading: 'When Patience Hides the Decision',
        body: 'Careful timing can become avoidance when there is always one more fact to collect or one more feeling to settle. You may preserve every option until the absence of a choice becomes its own choice. Purposeful patience sets conditions for action instead of waiting for perfect certainty. It can say what remains unknown, choose a reasonable deadline, and accept that some decisions only become clearer after you begin moving.',
      },
      confusedWith: {
        code: 'PER',
        heading: 'Patience Is Not Perseverance',
        body: 'Patience makes room for time before or between actions. Perseverance sustains effort through repeated action. Letting a tense conversation cool overnight may show Patience; returning to a difficult practice every morning may show Perseverance. Both resist immediate frustration, but one protects timing and information while the other protects continuity. Waiting is not automatically persistence, and persistence is not automatically well timed.',
      },
    },
    {
      code: 'INT',
      label: 'Integrity',
      summary: 'When your view changes, you would rather explain the change than quietly protect an older answer. Integrity connects what you say matters with what you choose, especially when approval is unavailable or a promise becomes inconvenient. It does not demand flawless consistency. New evidence can alter a belief without erasing what happened before. You build trust by making that process visible: other people can understand the standard that guided the first decision, what you learned, and why your actions now follow a better understanding.',
      shadow: {
        heading: 'When Integrity Cannot Update',
        body: 'Consistency can become rigidity when changing your mind feels like breaking faith with an earlier commitment. You may keep defending a position after its foundation has shifted because the revision seems difficult to explain. Integrity can remain intact through change when the update is transparent. Name the new evidence, acknowledge the effects of the earlier choice, and let present behavior reflect what you understand now.',
      },
      confusedWith: {
        code: 'JUS',
        heading: 'Integrity Is Not Justice',
        body: 'Integrity asks whether your own words, values, and actions align; Justice asks whether rules and outcomes treat people fairly. Refusing to lie about a decision can show Integrity even when the decision itself distributes harm unfairly. Challenging unfair treatment can show Justice even while your private motives are mixed. The best results often need both, but they reveal different tensions in a choice.',
      },
    },
    {
      code: 'PER',
      label: 'Perseverance',
      summary: 'You can sustain meaningful effort after novelty fades and the work becomes repetitive, awkward, or slow to reward you. Perseverance appears here as a relationship with practice: you return, notice what the last attempt taught you, and make another useful pass. It is not blind repetition. You are strongest when commitment to the purpose is paired with permission to change methods, seek feedback, or rest before continuing. Over time, this steadiness can turn small improvements into abilities that a burst of motivation alone could never build.',
      shadow: {
        heading: 'When Perseverance Serves the Investment',
        body: 'Endurance can become a sunk-cost trap when stopping seems to waste every hour already spent. You may repeat a method that no longer teaches you because changing course feels like admitting failure. Perseverance stays useful by remaining loyal to the purpose, not to accumulated effort. It checks whether practice still produces information, whether the cost remains acceptable, and whether rest, redesign, or a deliberate ending would better honor the original goal.',
      },
      confusedWith: {
        code: 'DET',
        heading: 'Perseverance Is Not Determination',
        body: 'Perseverance maintains effort across repetition, while Determination restores movement when an obstacle breaks the expected route. Finishing the hundredth careful repetition points toward Perseverance. Finding a workable alternative after the equipment fails points toward Determination. Both can appear in one project, but one is measured by sustained return and the other by renewed choice at a point of interruption.',
      },
    },
  ],
  pairingSamples: [
    {
      primary: 'DET',
      secondary: 'PAT',
      heading: 'Determination + Patience',
      body: 'Determination gives this pairing its direction: when a route closes, you look for the next move instead of waiting for the setback to define the ending. Patience adjusts the tempo. It helps you gather the information that a fast restart might miss and stops urgency from becoming noise. In everyday choices, you may prepare several options, then hold them lightly until the moment is right. The tension appears when another attempt feels productive but a little more waiting would change which attempt is worth making.',
    },
    {
      primary: 'JUS',
      secondary: 'KND',
      heading: 'Justice + Kindness',
      body: 'Justice leads by noticing what is unfair, who absorbed the cost, and what responsibility should follow. Kindness changes how that responsibility is carried. It keeps the people involved visible and asks whether the response makes repair possible rather than merely proving that harm was condemned. You may be drawn to solutions that protect the person affected while giving the person responsible a clear way to act differently. The tension arrives when compassion risks weakening a boundary, or punishment risks becoming more important than preventing the next harm.',
    },
    {
      primary: 'BRV',
      secondary: 'INT',
      heading: 'Bravery + Integrity',
      body: 'Bravery supplies the first movement: you can speak, refuse, or step forward while fear and attention are still present. Integrity decides what makes that risk worth taking and asks whether your later behavior will support the words. In ordinary life, this may look like naming a mistake before anyone discovers it, then accepting the work needed to repair it. The tension appears when conviction hardens into performance. Courage helps you withstand disagreement, but Integrity must still let honest evidence change the position you defended.',
    },
  ],
  specialResultSamples: [
    {
      specialId: 'all-neutral',
      heading: 'The Unchosen Path',
      summary: 'The last signal fades, but no single color steps forward. Every scored choice remained at the center, leaving the seven paths balanced and the gate undecided. The device can display the pattern, yet it cannot invent a direction you did not select. For this run, the result is not a hidden eighth virtue. It is a quiet screen waiting for a stronger preference, a different day, or a question that gives you enough context to choose.',
      interpretationNote: 'This only describes the answers in this run. It may reflect uncertainty, careful withholding, or a genuine middle position, and it is not a judgment about your character.',
    },
  ],
};

function question(
  order: number,
  target: VirtueCode,
  direction: CalibrationQuestion['direction'],
  prompt: string,
  partialWeights: Partial<WeightVector>,
  labels: AnswerLabels = CALIBRATION_ANSWER_LABELS,
): CalibrationQuestion {
  return {
    kind: 'scored',
    id: `cal-${target.toLowerCase()}-${direction === 'direct' ? 'd' : 'r'}`,
    order,
    target,
    direction,
    prompt,
    labels: [...labels],
    weights: completeWeights(partialWeights),
    provenance: { ...ORIGINAL_PROVENANCE },
  };
}

function completeWeights(partial: Partial<WeightVector>): WeightVector {
  return {
    DET: partial.DET ?? 0,
    BRV: partial.BRV ?? 0,
    JUS: partial.JUS ?? 0,
    KND: partial.KND ?? 0,
    PAT: partial.PAT ?? 0,
    INT: partial.INT ?? 0,
    PER: partial.PER ?? 0,
  };
}
