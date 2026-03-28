import type { WebSocket } from 'ws';

import { connectionRegistry } from '../server/connectionRegistry.js';
import { gamesStore } from '../storage/gamesStore.js';

import type * as T from '../types/index.js';
import * as C from '../constants/index.js';
import * as U from '../utils/index.js';
const { WAITING } = C.GAME_STATUS;

export function createGameHandler(ws: WebSocket, data: T.CreateGameData, id: number) {
    const hostId = connectionRegistry.getPlayerId(ws);

    if (!hostId) {
        return;
    }

    const gameId = U.generateId();
    const code = U.generateRoomCode();

    const hostPlayer: T.Player = {
        name: 'Host',
        passwordHash: '',
        index: hostId,
        score: 0,
        ws,
        hasAnswered: false
    };

    const game: T.Game = {
        id: gameId,
        code,
        hostId,
        questions: data.questions,
        players: [],
        currentQuestion: -1,
        status: WAITING,
        questionStartTime: undefined,
        questionTimer: undefined,
        playerAnswers: new Map(),
    };

    gamesStore.add(game);

    ws.send(JSON.stringify({
        type: 'game_created',
        data: {
            gameId,
            code
        },
        id
    }));
}