import type { WebSocket } from 'ws';
import { gamesStore } from '../storage/gamesStore.js';
import { connectionRegistry } from '../server/connectionRegistry.js';
import * as C from '../constants/index.js';
import type * as T from '../types/index.js';

const { WAITING } = C.GAME_STATUS;

export function joinGameHandler(ws: WebSocket, data: T.JoinGameData, id: number) {
    const playerId = connectionRegistry.getPlayerId(ws);

    if (!playerId) {
        ws.send(JSON.stringify({
            type: 'game_joined',
            data: {
                gameId: '',
                players: [],
                hostId: '',
                error: true,
                errorText: C.NOT_REGISTERED
            },
            id
        }));
        return;
    }

    const game = gamesStore.getByCode(data.code);

    if (!game) {
        ws.send(JSON.stringify({
            type: 'game_joined',
            data: {
                gameId: '',
                players: [],
                hostId: '',
                error: true,
                errorText: C.GAME_NOT_FOUND
            },
            id
        }));
        return;
    }

    if (game.status !== WAITING) {
        ws.send(JSON.stringify({
            type: 'game_joined',
            data: {
                gameId: game.id,
                players: game.players,
                hostId: game.hostId,
                error: true,
                errorText: C.GAME_ALREADY_STARTED
            },
            id
        }));
        return;
    }

    let player = game.players.find(p => p.index === playerId);

    if (!player) {
        player = {
            name: `Player ${game.players.length + 1}`, // FE позже обновит имя
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

    ws.send(JSON.stringify({
        type: 'game_joined',
        data: {
            gameId: game.id,
            players: game.players,
            hostId: game.hostId,
            error: false,
            errorText: null
        },
        id
    }));

    game.players.forEach(p => {
        p.ws?.send(JSON.stringify({
            type: 'player_joined',
            data: { player }
        }));
    });

    game.players.forEach(p => {
        p.ws?.send(JSON.stringify({
            type: 'update_players',
            data: { players: game.players }
        }));
    });
}