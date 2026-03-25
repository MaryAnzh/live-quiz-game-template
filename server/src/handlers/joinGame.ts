import type { WebSocket } from 'ws';

import * as C from '../constants/index.js';
import { joinGameByCode } from '../core/gameManager.js';
import { playersStore } from '../storage/index.js';
import { connectionRegistry, broadcastToGame } from '../server/index.js';
import type * as T from '../types/index.js';

export function joinGameHandler(ws: WebSocket, data: T.JoinGameData, id: number) {
    const { code } = data;

    if (!code || typeof code !== 'string') {
        ws.send(JSON.stringify({
            type: C.COMMANDS.JOIN_GAME,
            data: { error: true, errorText: C.INVALID_GAME_CODE },
            id
        }));
        return;
    }

    const playerId = connectionRegistry.getPlayerId(ws);
    if (!playerId) {
        ws.send(JSON.stringify({
            type: C.COMMANDS.JOIN_GAME,
            data: { error: true, errorText: C.NOT_REGISTERED },
            id
        }));
        return;
    }

    const player = playersStore.getById(playerId);
    if (!player) {
        ws.send(JSON.stringify({
            type: C.COMMANDS.JOIN_GAME,
            data: { error: true, errorText: C.PLAYER_NOT_FOUND },
            id
        }));
        return;
    }

    const result = joinGameByCode(code, player);

    if (!result.ok) {
        ws.send(JSON.stringify({
            type: C.COMMANDS.JOIN_GAME,
            data: { error: true, errorText: result.error },
            id
        }));
        return;
    }

    const game = result.game;

    ws.send(JSON.stringify({
        type: 'game_joined',
        data: {
            error: false,
            gameId: game.id,
            players: game.players.map(p => ({ name: p.name, id: p.index })),
            hostId: game.hostId
        },
        id
    }));

    broadcastToGame(game, {
        type: C.QUIZ_MESSAGE.PLAYER_JOINED,
        data: {
            player: { name: player.name, id: player.index }
        },
        id
    });

    broadcastToGame(game, {
        type: C.QUIZ_MESSAGE.UPDATE_PLAYERS,
        data: {
            players: game.players.map(p => ({ name: p.name, id: p.index }))
        },
        id
    });
}