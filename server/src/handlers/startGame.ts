import type { WebSocket } from 'ws';

import { finishQuestion } from '../core/index.js';
import { connectionRegistry, sendError } from '../server/index.js';
import { gamesStore } from '../storage/index.js';

import * as C from '../constants/index.js';
import type * as T from '../types/index.js';
import { finishQuestion } from '../core/finishQuestion.js';

const { WAITING, IN_PROGRESS } = C.GAME_STATUS;

export function startGameHandler(ws: WebSocket, data: T.StartGameData, id: number) {
    const playerId = connectionRegistry.getPlayerId(ws);

    if (!playerId) {
        return sendError(ws, C.NOT_REGISTERED);
    }

    const game = gamesStore.getById(data.gameId);

    if (!game) {
        return sendError(ws, C.GAME_NOT_FOUND);
    }

    if (game.hostId !== playerId) {
        return sendError(ws, C.NOT_HOST);
    }

    if (game.status !== WAITING) {
        return sendError(ws, C.GAME_ALREADY_STARTED);
    }

    game.status = IN_PROGRESS;
    game.currentQuestion = 0;
    game.questionStartTime = Date.now();
    game.playerAnswers = new Map();

    game.players.forEach(p => {
        p.hasAnswered = false;
        p.answeredCorrectly = false;
    });

    const question = game.questions[0];

    const payload = {
        questionNumber: 1,
        totalQuestions: game.questions.length,
        text: question.text,
        options: question.options,
        timeLimitSec: question.timeLimitSec
    };

    game.players.forEach(p => {
        p.ws?.send(JSON.stringify({
            type: 'question',
            data: payload,
            id: 0
        }));
    });

    const publicPlayers = game.players.map(({ name, index, score }) => ({
        name,
        index,
        score
    }));

    game.players.forEach(p => {
        p.ws?.send(JSON.stringify({
            type: 'update_players',
            data: publicPlayers,
            id: 0
        }));
    });

    game.questionTimer = setTimeout(() => {
        finishQuestion(game);
    }, question.timeLimitSec * 1000);
}