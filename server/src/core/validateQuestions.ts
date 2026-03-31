import * as C from '../constants/index.js'
import type { Question } from '../types/index.js';

export function validateQuestions(questions: Question[] | null | undefined): string | null {
    if (!Array.isArray(questions) || questions.length === 0) {
        return C.QUESTIONS_ARRAY_IS_EMPTY;
    }

    for (const q of questions) {
        if (!q.text || typeof q.text !== 'string') {
            return C.QUESTION_TEXT_IS_MISSING;
        }

        if (!Array.isArray(q.options) || q.options.length !== 4) {
            return C.QUESTION_OPTIONS_MESSAGE;
        }

        if (
            typeof q.correctIndex !== 'number' ||
            q.correctIndex < 0 ||
            q.correctIndex > 3
        ) {
            return C.QUESTION_CURRENT_INDEX_MESSAGE;
        }

        if (
            typeof q.timeLimitSec !== 'number' ||
            q.timeLimitSec <= 0
        ) {
            return C.QUESTION_TIME_LIMIT_MESSAGE;
        }
    }

    return null;
}