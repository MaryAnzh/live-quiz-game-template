import type { WebSocket } from 'ws';

import { gamesStore } from '../storage/gamesStore.js';
import { connectionRegistry } from '../server/connectionRegistry.js';
import * as C from '../constants/index.js';
import type * as T from '../types/index.js';
import { finishQuestion } from '../core/finishQuestion.js';

const { IN_PROGRESS } = C.GAME_STATUS;

export function answerHandler(ws: WebSocket, data: T.AnswerData, id: number) {
    const playerId = connectionRegistry.getPlayerId(ws);

    if (!playerId) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: C.NOT_REGISTERED },
            id: 0
        }));
        return;
    }

    const game = gamesStore.getById(data.gameId);

    if (!game) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: C.GAME_NOT_FOUND },
            id: 0
        }));
        return;
    }

    if (game.status !== IN_PROGRESS) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: C.GAME_NOT_IN_PROGRESS },
            id: 0
        }));
        return;
    }

    if (data.questionIndex !== game.currentQuestion) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: C.INVALID_QUESTION_INDEX },
            id: 0
        }));
        return;
    }

    const player = game.players.find(p => p.index === playerId);

    if (!player) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: C.PLAYER_NOT_IN_GAME },
            id: 0
        }));
        return;
    }

    if (player.hasAnswered) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: C.ALREADY_ANSWERED },
            id: 0
        }));
        return;
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