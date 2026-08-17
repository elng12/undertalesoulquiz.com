import { ORIGINAL_CONTENT_CALIBRATION } from './original-content-calibration';
import type { CompletionSpecialId, VirtueCode } from '../quiz/types';

export interface ProductionVirtueCopy {
  code: VirtueCode;
  label: string;
  summary: string;
  shadow: { heading: string; body: string };
  confusedWith: { code: VirtueCode; heading: string; body: string };
}

export interface ProductionPairingCopy {
  primary: VirtueCode;
  secondary: VirtueCode;
  heading: string;
  body: string;
}

export interface ProductionSpecialCopy {
  specialId: CompletionSpecialId;
  heading: string;
  summary: string;
  interpretationNote: string;
}

export const PRODUCTION_VIRTUE_RESULTS: ProductionVirtueCopy[] =
  ORIGINAL_CONTENT_CALIBRATION.virtueResults.map((entry) => structuredClone(entry));

const PAIRING_BODIES: Record<string, string> = {
  'DET-BRV': 'Determination gives this pairing a destination after a setback: you search for the next workable route instead of letting the obstacle choose the ending. Bravery makes that route usable when it still carries risk, attention, or the possibility of another failure. The tension appears when every obstacle starts to look like a dare. A strong version changes course without inventing danger merely to prove that it can keep moving.',
  'DET-JUS': 'You begin by restoring agency when circumstances close a path, and Justice asks what the replacement plan will do to everyone involved. This can produce practical repairs instead of motion for its own sake. The hard moment comes when the fastest workable route distributes its costs unfairly. Progress remains credible only when the new plan can answer who pays, who benefits, and what must be corrected along the way.',
  'DET-KND': 'Determination keeps the purpose alive by finding another move, while Kindness keeps that movement connected to the people who will feel its effects. You may be good at turning concern into a concrete offer rather than leaving it as sympathy. Friction arrives when care slows the recovery plan, or when urgency turns people into pieces of the solution. Agency works better when consent and capacity remain part of the route.',
  'DET-PAT': 'When a plan breaks, Determination looks for the next available choice and Patience checks whether the situation is ready for that choice yet. Together they can turn a frantic restart into an informed one. The challenge is knowing whether another attempt restores agency or merely avoids an uncomfortable pause. Useful waiting gathers something specific, then ends; it makes the next route more deliberate, not less determined.',
  'DET-INT': 'Determination helps you revise a route without surrendering the goal, and Integrity makes the revision visible enough for other people to understand. This pairing is strongest when a restart includes an honest account of what failed. Pressure to recover quickly can tempt you to describe a new direction as though it had always been the plan. Naming the change gives renewed action a foundation that others can trust.',
  'DET-PER': 'Both virtues protect a meaningful goal, but Determination usually leads at the moment a route breaks while Perseverance carries the quieter work between disruptions. You may recover quickly and then sustain the revised practice. Their tension is methodological: one asks for another direction and the other asks for another repetition. The useful question is whether the current approach still teaches you enough to deserve continued effort.',
  'BRV-DET': 'Bravery leads when a necessary action remains frightening or exposed, and Determination follows by giving that action somewhere to go after the first move. A concrete next step can make risk easier to face without pretending it disappeared. The danger is treating movement itself as courage. Sometimes protecting the purpose means changing direction after new resistance, rather than charging harder into the route that first demanded nerve.',
  'BRV-JUS': 'Bravery makes an unfair outcome speakable before a group is comfortable hearing about it. Justice supplies the standard, the affected people, and the repair that should remain central once attention turns toward you. This pairing can confront power without making confrontation the prize. Courage stays focused when the goal is a fairer outcome, not winning the room or proving that you were the boldest person in it.',
  'BRV-KND': "Bravery can interrupt a harmful moment while Kindness asks what protection or support the other person actually wants. You may be willing to stand beside someone in public, then listen instead of assuming the next step. The difficulty is that help offered too forcefully can remove another person's choice. Ask what is welcome without using consent as an excuse for silence when immediate harm still needs a response.",
  'BRV-PAT': 'Bravery wants to act before fear chooses on your behalf; Patience wants enough time to distinguish a necessary risk from an avoidable one. In balance, you check what can be checked and still move without perfect certainty. The strain appears when caution stretches into avoidance or action outruns useful evidence. A clear decision point lets waiting finish its job and lets courage begin for a reason.',
  'BRV-INT': 'Bravery brings a difficult truth into the open, while Integrity decides whether the truth reflects values you will still follow when the audience is gone. This pairing can admit mistakes, set boundaries, and withstand disagreement without turning honesty into theater. The real test comes afterward: private behavior, repair, and future choices must support the position you were willing to defend aloud, including when new evidence requires revision.',
  'BRV-PER': 'Bravery handles the exposed beginning or difficult threshold; Perseverance carries the work once the dramatic moment has passed. You may start a hard conversation and then return for the less visible follow-through it requires. The tension is mistaking one bold act for a completed commitment, or mistaking repetitive strain for proof of courage. A durable version connects each risky step to an ordinary practice that can continue.',
  'JUS-DET': 'Justice begins by identifying unequal costs and the responsibility needed to address them. Determination becomes the secondary force that selects a workable remedy when every available option is imperfect. This can keep accountability from stalling in analysis. The risk is allowing urgency to define success as any completed action. A credible repair must move forward without turning the harmed person, due process, or a quieter stakeholder into an acceptable cost.',
  'JUS-BRV': "Justice sees the gap between a shared rule and the outcome people are actually living with; Bravery helps name that gap when doing so attracts pressure. You can make a standard visible before a powerful group volunteers to examine itself. The confrontation still needs a purpose beyond the speaker's image. Courage serves this pairing when it protects affected people and opens a route to repair rather than merely escalating the room.",
  'JUS-KND': 'Justice leads by naming the harm, the imbalance, and the responsibility that should follow. Kindness changes how accountability is carried, keeping context and the possibility of repair visible without erasing the boundary. You may prefer responses that protect the affected person and give the responsible person a concrete way to act differently. The tension is preventing compassion from weakening protection, and preventing punishment from becoming the only proof that the harm mattered.',
  'JUS-PAT': 'Justice wants a proportionate response, while Patience creates enough room to hear context and understand impact before that response is fixed. This pairing can avoid both reflexive punishment and indefinite delay. A rushed verdict may miss who held power; endless listening may leave someone unprotected. Set a fair point for deciding, explain what evidence matters, and keep a clear way to revise the remedy if meaningful new information appears.',
  'JUS-INT': 'Justice applies a standard across people and outcomes; Integrity requires you to place your own choices under that standard as well. Together they can make accountability reciprocal rather than something demanded only from others. The difficult work is naming your interest, disclosing an exception, or correcting your own contribution before judging the rest. Shared rules become trustworthy when the person invoking them does not quietly reserve a private escape.',
  'JUS-PER': 'Justice can identify an appropriate repair, but Perseverance determines whether that repair survives after the visible decision. Restitution, documentation, changed routines, and later check-ins often matter more than a forceful verdict. This pairing keeps accountability active through ordinary follow-through. Its risk is continuing a procedure after it stops reducing harm, so repeated work should be measured against the people and outcome it was meant to protect.',
  'KND-DET': 'Kindness notices a need and begins by asking what support would be useful; Determination helps turn the answer into a practical next step when sympathy alone changes nothing. You may be especially effective when care meets a blocked system or an urgent problem. The tension is acting so quickly that the recipient loses control. The chosen route should restore options for the person receiving help, not only satisfy the helper that something moved.',
  'KND-BRV': 'Kindness leads with attention to dignity, consent, and practical need. Bravery becomes important when care requires saying what others avoid, setting an unpopular boundary, or standing beside someone where support is visible. This can make compassion active without making it controlling. The hard choice is whether silence protects the person or only protects your comfort; courage should serve their needs rather than turn their situation into your performance.',
  'KND-JUS': 'Kindness first sees the person who needs support, while Justice widens the view to the rule, power difference, or repeated pattern behind that need. You may offer immediate care and still ask why the same harm keeps returning. The tension is preserving human context without reducing the issue to one private rescue. A fair solution should change the conditions involved while refusing to turn any participant into a case file.',
  'KND-PAT': "Kindness offers presence and useful care; Patience helps that care respect another person's timing instead of demanding quick improvement or gratitude. You may be able to stay available while someone decides what they want. The challenge is waiting without vanishing and helping without pressing for a timeline that mainly relieves you. A quiet check-in, a clear offer, or a timely intervention should follow the other person's signals rather than a fixed script.",
  'KND-INT': 'Kindness motivates a generous response, and Integrity tests whether the promise behind that response matches your real capacity. This pairing can be warm without becoming unreliable because it prefers an honest limit to an impressive offer that later disappears. The tension comes when truth feels disappointing or care feels obligatory. Naming what you can sustain early protects trust and prevents hidden resentment from becoming the final message.',
  'KND-PER': "Kindness identifies an ongoing need, while Perseverance keeps support present after the first urgent moment and the first round of thanks. You may be dependable in routines that receive little notice. The strain is deciding where steady care ends and permanent responsibility begins. Sustainable help checks whether it remains wanted and useful, changes methods when circumstances change, and leaves room for the other person to carry their own choices.",
  'PAT-DET': 'Patience leads by observing what time or additional information may change. Determination supplies the decision point that prevents all available options from being preserved forever. In this order, waiting still carries a plan and protects a better future move. The tension appears when the hoped-for signal never arrives. A mature response names the deadline or condition in advance, then chooses a direction when waiting has finished producing value.',
  'PAT-BRV': 'Patience gives uncertainty enough room to become clearer, while Bravery accepts that no amount of checking can remove every fear from a necessary choice. You may delay action for specific evidence and then move once the evidence stops improving. The danger lies on both sides: haste can ignore preventable risk, and caution can become a respectable cover for avoidance. Define what you need to learn, then face the remaining exposure honestly.',
  'PAT-JUS': 'Patience slows the rush to judge so context, power, and impact can be understood. Justice ensures that this listening period has a purpose and does not become a reason to leave unequal harm unaddressed. The pairing is useful in conflicts where protection and accuracy both matter. Its tension is timing: decide too soon and miss the field; wait too long and the unresolved outcome becomes another burden for the affected person.',
  'PAT-KND': 'Patience allows another person time to speak, decide, or recover without forcing a pace. Kindness keeps that space connected to care, since distance alone is not automatically respectful. You may offer room while remaining reachable and attentive to changing needs. The difficult question is whether quiet is welcome or isolating. A clear, low-pressure offer can protect autonomy without making the other person carry the entire work of asking for support.',
  'PAT-INT': 'Patience helps you hold an answer while you verify a claim or understand new evidence. Integrity makes sure the pause remains honest about what is already known and why more time is needed. Together they can produce careful revision rather than a confident guess. The tension appears when uncertainty becomes polished concealment. You do not need a final conclusion to acknowledge a contradiction, disclose a limitation, or correct a statement that is already unsupported.',
  'PAT-PER': 'Patience gives a slow process enough time to work, and Perseverance makes sure you return after pauses for recovery, feedback, or changing conditions. This pairing suits learning that cannot be hurried but still needs regular attention. The risk is losing the boundary between restorative waiting and quiet abandonment. Keep a next check-in or practice point visible, so the pause remains part of the commitment instead of becoming its unannounced end.',
  'INT-DET': 'Integrity leads by acknowledging when the story, promise, or plan no longer matches the facts. Determination turns that acknowledgment into a revised course instead of leaving honesty as the final action. You may be willing to explain what failed and choose again without pretending the first decision never happened. The tension is moving so quickly into recovery that repair gets skipped; a credible restart includes both an accurate account and a workable next route.',
  'INT-BRV': 'Integrity knows what must be said or changed for your actions to match your values. Bravery helps carry that alignment into public view when honesty may cost approval, status, or comfort. This pairing can admit a mistake and accept the repair that follows. Its risk is treating painful disclosure as the whole achievement. Courage opens the conversation, but consistent behavior afterward determines whether the truth was a principle or only a moment.',
  'INT-JUS': 'Integrity begins with the relationship between your own claims and choices; Justice asks whether the standard itself distributes power and harm fairly. A person can follow a rule consistently even when the rule deserves challenge. This pairing tests both levels. The tension is choosing personal innocence over a better shared outcome. Alignment matters, but it should remain open to evidence that the system you faithfully followed still needs correction.',
  'INT-KND': 'Integrity keeps the answer truthful, while Kindness shapes how and when that truth reaches another person. You may resist offering reassurance you cannot support, yet still care about the effect of blunt delivery. The tension is avoiding two easy substitutes: needless sharpness presented as honesty, and a comforting answer that quietly misleads. A trustworthy response can name reality clearly, respect dignity, and offer whatever useful support is genuinely available.',
  'INT-PAT': 'Integrity wants your stated position to match the evidence you currently understand. Patience allows time to examine new information before replacing one confident answer with another. Together they support transparent revision rather than impulsive certainty. The difficult point is deciding what must be acknowledged now even while the final view remains open. Careful thought should not conceal a known contradiction or postpone a correction that already has practical consequences.',
  'INT-PER': 'Integrity turns a value into a standard for repeated choices, and Perseverance keeps those choices going after they become inconvenient or invisible. This pairing gives credibility to commitments that cannot be proved in one gesture. Its tension is rigidity: repetition can defend an identity long after better evidence changes the purpose. Continue because the practice still expresses what matters, not because stopping would make the earlier effort uncomfortable to explain.',
  'PER-DET': 'Perseverance leads by returning to meaningful work through repetition and slow feedback. Determination becomes essential when another repetition no longer teaches anything and the route itself needs redesign. You may sustain a practice without becoming trapped by its current form. The tension is loyalty: protect the purpose rather than the method or the hours already invested. A deliberate change of course can preserve commitment instead of proving that the effort failed.',
  'PER-BRV': 'Perseverance carries a goal through ordinary practice, while Bravery helps cross moments when continuing becomes exposed, uncertain, or likely to attract judgment. A long project may require both quiet return and occasional visible risk. The strain is confusing emotional intensity with progress, or treating routine discomfort as danger. Courage should open a necessary threshold; perseverance should then connect that moment to the repeatable work that gives it lasting meaning.',
  'PER-JUS': 'Perseverance keeps repair active through repeated tasks such as restitution, documentation, monitoring, or changed routines. Justice makes sure that effort still addresses the original harm and the people carrying its cost. This pairing can turn a fair decision into a dependable outcome. The risk is measuring success by endurance alone. Continued work deserves credit only while it remains proportionate, accountable, and responsive to evidence about whether the repair is actually helping.',
  'PER-KND': "Perseverance makes care reliable after urgency and recognition fade. Kindness keeps the repeated task attentive to the person's changing needs instead of letting support become an automatic routine. You may be good at showing up consistently without demanding gratitude. The tension is continuing because you promised while missing that the welcome, method, or need has changed. Dependability includes checking in, adapting the form of help, and respecting a clear ending.",
  'PER-PAT': 'Perseverance protects continuity across slow progress, and Patience protects the rhythm that allows recovery, feedback, and learning to do their work. You may return steadily without demanding a visible reward from every attempt. The tension is deciding whether a pause supports the practice or quietly replaces it. Name when you will reassess or resume, and let rest change the next attempt rather than treating either constant effort or indefinite waiting as virtue by itself.',
  'PER-INT': 'Perseverance builds a pattern of effort that other people can rely on; Integrity asks whether the pattern still matches the purpose and values you claim. This pairing can sustain an inconvenient commitment without hiding behind habit. Its hardest moment arrives when continuing protects identity more than meaning. An honest ending, redesign, or apology may serve the original value better than another repetition performed only to defend the investment already made.',
};

export const PRODUCTION_PAIRINGS: ProductionPairingCopy[] = buildPairings();

export const PRODUCTION_SPECIAL_RESULTS: ProductionSpecialCopy[] = [
  {
    specialId: 'all-switch',
    heading: 'The Divided Corridor',
    summary: 'The first half of the path stayed at one end of the response scale, while the second half stayed at the other. That exact split creates a pattern result instead of a normal ranking: Patience and Determination hold the center together as two visual halves. The corridor records the contrast, but it does not decide what caused the change.',
    interpretationNote: 'This result describes the two-part answer pattern only. It does not assume that you changed your mind, rushed the second half, or intended to trigger a special outcome.',
  },
  {
    specialId: 'all-disagree',
    heading: 'The Closed Circuit',
    summary: 'The same strongly disagreeing response appeared for every scored signal, so the device has contrast against the questions but no contrast between your responses. A normal virtue ranking would pretend that identical choices revealed distinctions they could not provide. Instead, the circuit closes and returns the observable pattern itself.',
    interpretationNote: 'You may have rejected the wording, held strong opposing views, tested the limits, or simply preferred the same response. The quiz cannot determine which explanation applies.',
  },
  {
    specialId: 'all-neutral',
    heading: 'The Unchosen Path',
    summary: 'The last signal fades, but no single color steps forward. Every scored choice remained at the center, leaving the seven paths balanced and the gate undecided. The device can display the pattern, yet it cannot invent a direction you did not select. For this run, the result is not a hidden eighth virtue. It is a quiet screen waiting for a stronger preference, a different day, or a question that gives you enough context to choose.',
    interpretationNote: 'This only describes the answers in this run. It may reflect uncertainty, careful withholding, or a genuine middle position, and it is not a judgment about your character.',
  },
  {
    specialId: 'all-agree',
    heading: 'The Open Circuit',
    summary: 'Every scored signal was accepted at full strength. The colors answer together, but none receives the contrast needed to become a meaningful leader. Rather than turn universal agreement into a confident personality claim, the device leaves the circuit open and reports the pattern as its own result.',
    interpretationNote: 'This result does not assume carelessness or exaggeration. The prompts may all have felt true, the response scale may not have fit your distinctions, or you may have chosen to explore its edge.',
  },
];

export function findVirtueCopy(code: VirtueCode): ProductionVirtueCopy {
  const copy = PRODUCTION_VIRTUE_RESULTS.find((entry) => entry.code === code);
  if (!copy) throw new Error(`Missing production result copy for ${code}.`);
  return copy;
}

export function findPairingCopy(
  primary: VirtueCode,
  secondary: VirtueCode,
): ProductionPairingCopy {
  const copy = PRODUCTION_PAIRINGS.find(
    (entry) => entry.primary === primary && entry.secondary === secondary,
  );
  if (!copy) throw new Error(`Missing production pairing copy for ${primary}-${secondary}.`);
  return copy;
}

export function findSpecialCopy(id: CompletionSpecialId): ProductionSpecialCopy {
  const copy = PRODUCTION_SPECIAL_RESULTS.find((entry) => entry.specialId === id);
  if (!copy) throw new Error(`Missing production special copy for ${id}.`);
  return copy;
}

function buildPairings(): ProductionPairingCopy[] {
  const codes = PRODUCTION_VIRTUE_RESULTS.map((entry) => entry.code);
  return codes.flatMap((primary) => codes
    .filter((secondary) => secondary !== primary)
    .map((secondary) => {
      const primaryLabel = findLabel(primary);
      const secondaryLabel = findLabel(secondary);
      const body = PAIRING_BODIES[`${primary}-${secondary}`];
      if (!body) throw new Error(`Missing pairing body for ${primary}-${secondary}.`);
      return {
        primary,
        secondary,
        heading: `${primaryLabel} + ${secondaryLabel}`,
        body,
      };
    }));
}

function findLabel(code: VirtueCode): string {
  const entry = PRODUCTION_VIRTUE_RESULTS.find((result) => result.code === code);
  if (!entry) throw new Error(`Missing virtue label for ${code}.`);
  return entry.label;
}
