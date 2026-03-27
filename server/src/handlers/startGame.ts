import type { WebSocket } from 'ws';
import { gamesStore } from '../storage/gamesStore.js';
import { connectionRegistry } from '../server/index.js';
import * as C from '../constants/index.js';
import type * as T from '../types/index.js';

const { WAITING, IN_PROGRESS } = C.GAME_STATUS;

export function startGameHandler(ws: WebSocket, data: T.StartGameData, id: number) {
    const playerId = connectionRegistry.getPlayerId(ws);

    if (!playerId) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { error: true, errorText: C.NOT_REGISTERED },
            id
        }));
        return;
    }

    const game = gamesStore.getById(data.gameId);

    if (!game) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { error: true, errorText: C.GAME_NOT_FOUND },
            id
        }));
        return;
    }

    if (game.hostId !== playerId) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { error: true, errorText: C.NOT_HOST },
            id
        }));
        return;
    }

    if (game.status !== WAITING) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { error: true, errorText: C.GAME_ALREADY_STARTED },
            id
        }));
        return;
    }

    // Стартуем игру
    game.status = IN_PROGRESS;
    game.currentQuestion = 0;
    game.questionStartTime = Date.now();
    game.playerAnswers = new Map();

    // Сбрасываем состояние игроков
    game.players.forEach(p => {
        p.hasAnswered = false;
        p.answeredCorrectly = false;
    });

    const question = game.questions[0];

    // Рассылаем question_started
    game.players.forEach(p => {
        p.ws?.send(JSON.stringify({
            type: 'question_started',
            data: {
                questionIndex: 0,
                question,
                timeLimitSec: question.timeLimitSec
            }
        }));
    });

    // Рассылаем update_players
    game.players.forEach(p => {
        p.ws?.send(JSON.stringify({
            type: 'update_players',
            data: { players: game.players }
        }));
    });

    // Запускаем таймер вопроса
    game.questionTimer = setTimeout(() => {
        // TODO: переход к следующему вопросу (этап 7)
    }, question.timeLimitSec * 1000);
}