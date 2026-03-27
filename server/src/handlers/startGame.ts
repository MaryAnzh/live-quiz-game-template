import type { WebSocket } from 'ws';
import { gamesStore } from '../storage/gamesStore.js';
import { connectionRegistry } from '../server/connectionRegistry.js';
import * as C from '../constants/index.js';
import type * as T from '../types/index.js';

const { WAITING, IN_PROGRESS } = C.GAME_STATUS;

export function startGameHandler(ws: WebSocket, data: T.StartGameData, id: number) {
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

    if (game.hostId !== playerId) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: C.NOT_HOST },
            id: 0
        }));
        return;
    }

    if (game.status !== WAITING) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { message: C.GAME_ALREADY_STARTED },
            id: 0
        }));
        return;
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
        // TODO: next question => next
        // finishQuestion(game);
    }, question.timeLimitSec * 1000);
}