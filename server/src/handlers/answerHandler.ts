import type { WebSocket } from 'ws';

import { finishQuestion } from '../core/index.js';
import { connectionRegistry, sendError } from '../server/index.js';
import { gamesStore } from '../storage/index.js';

import * as C from '../constants/index.js';
import type * as T from '../types/index.js';

const { IN_PROGRESS } = C.GAME_STATUS;

export function answerHandler(ws: WebSocket, data: T.AnswerData, id: number) {
    const playerId = connectionRegistry.getPlayerId(ws);

    if (!playerId) {
        return sendError(ws, C.NOT_REGISTERED);
    }

    const game = gamesStore.getById(data.gameId);

    if (!game) {
        return sendError(ws, C.GAME_NOT_FOUND);
    }

    if (game.status !== IN_PROGRESS) {
        return sendError(ws, C.GAME_NOT_IN_PROGRESS);
    }

    if (data.questionIndex !== game.currentQuestion) {
        return sendError(ws, C.INVALID_QUESTION_INDEX);
    }

    const player = game.players.find(p => p.index === playerId);

    if (!player) {
        return sendError(ws, C.PLAYER_NOT_IN_GAME);
    }

    if (player.hasAnswered) {
        return sendError(ws, C.ALREADY_ANSWERED);
    }

    const question = game.questions[game.currentQuestion];
    const isCorrect = data.answerIndex === question.correctIndex;

    const timestamp = Date.now() - (game.questionStartTime ?? Date.now());

    game.playerAnswers.set(playerId, {
        answerIndex: data.answerIndex,
        timestamp
    });

    player.hasAnswered = true;
    player.answeredCorrectly = isCorrect;

    ws.send(JSON.stringify({
        type: 'answer_accepted',
        data: { questionIndex: data.questionIndex },
        id: 0
    }));

    const allAnswered = game.players.every(p => p.hasAnswered);

    if (allAnswered) {
        clearTimeout(game.questionTimer);
        finishQuestion(game);
    }
}