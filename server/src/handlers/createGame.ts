import type { WebSocket } from 'ws';

import { connectionRegistry } from '../server/index.js';
import { gamesStore } from '../storage/gamesStore.js';
import { validateQuestions } from '../core/validateQuestions.js';
import { generateId, generateRoomCode } from '../utils/index.js';
import * as C from '../constants/index.js';
import type * as T from '../types/index.js';

const { WAITING } = C.GAME_STATUS;

export function createGameHandler(ws: WebSocket, data: T.CreateGameData, id: number) {
    const hostId = connectionRegistry.getPlayerId(ws);

    if (!hostId) {
        ws.send(JSON.stringify({
            type: 'game_created',
            data: {
                gameId: '',
                code: '',
                error: true,
                errorText: C.NOT_REGISTERED
            },
            id
        }));
        return;
    }

    const validationError = validateQuestions(data.questions);
    if (validationError) {
        ws.send(JSON.stringify({
            type: 'game_created',
            data: {
                gameId: '',
                code: '',
                error: true,
                errorText: validationError
            },
            id
        }));
        return;
    }

    const gameId = generateId();
    const code = generateRoomCode();

    const game: T.Game = {
        id: gameId,
        code,
        hostId,
        questions: data.questions,
        players: [],
        currentQuestion: -1,
        status: WAITING,
        playerAnswers: new Map(),   // <-- ВАЖНО: Map, а не {}
        questionStartTime: undefined,
        questionTimer: undefined
    };

    gamesStore.add(game);

    ws.send(JSON.stringify({
        type: 'game_created',
        data: {
            gameId,
            code,
            error: false,
            errorText: null
        },
        id
    }));
}