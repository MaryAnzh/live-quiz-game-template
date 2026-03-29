import type { WebSocket } from 'ws';
import { gamesStore } from '../storage/gamesStore.js';
import { connectionRegistry } from '../server/connectionRegistry.js';
import * as C from '../constants/index.js';
import type * as T from '../types/index.js';
import { playersStore } from '../storage/playersStore.js';
import { broadcastToGame, sendError } from '../server/broadcaster.js';

const { WAITING } = C.GAME_STATUS;

export function joinGameHandler(ws: WebSocket, data: T.JoinGameData, id: number) {
    const playerId = connectionRegistry.getPlayerId(ws);

    if (!playerId) {
        return sendError(ws, C.NOT_REGISTERED);
    }

    const game = gamesStore.getByCode(data.code);

    if (!game) {
        return sendError(ws, C.GAME_NOT_FOUND);
    }

    if (game.status !== WAITING) {
        return sendError(ws, C.GAME_ALREADY_STARTED);
    }

    let player = game.players.find(p => p.index === playerId);
    const user = playersStore.getById(playerId);

    if (!player) {
        player = {
            name: `Player ${game.players.length + 1}: ${user?.name ?? ''}`,
            passwordHash: '',
            index: playerId,
            score: 0,
            ws,
            hasAnswered: false
        };

        game.players.push(player);
    } else {
        player.ws = ws;
    }

    broadcastToGame(game, {
        type: 'player_joined',
        data: {
            playerName: player.name,
            playerCount: game.players.length
        },
        id: 0
    });

    const publicPlayers = game.players.map(({ name, index, score }) => ({
        name,
        index,
        score
    }));

    broadcastToGame(game, {
        type: 'update_players',
        data: publicPlayers,
        id: 0
    });
}