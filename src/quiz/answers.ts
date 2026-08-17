import type { AnswerValue, QuizAnswers, QuizQuestion } from './types';

export class QuizAnswerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizAnswerError';
  }
}

export function readAnswer(question: QuizQuestion, answers: QuizAnswers): AnswerValue {
  const value = answers[question.id];
  const optionCount = question.kind === 'scored' ? 5 : question.options.length;

  if (!Number.isInteger(value) || value === undefined || value < 0 || value >= optionCount) {
    throw new QuizAnswerError(`Question ${question.id} does not have a valid answer.`);
  }

  return value as AnswerValue;
}

export function assertCompleteAnswers(
  questions: ReadonlyArray<QuizQuestion>,
  answers: QuizAnswers,
): void {
  for (const question of questions) readAnswer(question, answers);
}
