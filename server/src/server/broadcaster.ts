import type { WebSocket } from 'ws';
import { connectionRegistry } from './connectionRegistry.js';
import type * as T from '../types/index.js';

export function sendToWs(ws: WebSocket, message: T.WSMessage) {
    ws.send(JSON.stringify(message));
}

export function sendToPlayer(playerId: string, message: T.WSMessage) {
    const ws = connectionRegistry.getConnection(playerId);
    if (ws) ws.send(JSON.stringify(message));
}

export function broadcastToGame(game: T.Game, message: T.WSMessage) {
    for (const player of game.players) {
        const ws = connectionRegistry.getConnection(player.index.toString());
        if (ws) ws.send(JSON.stringify(message));
    }

    if (message.type !== 'question') {
        const hostWs = connectionRegistry.getConnection(game.hostId.toString());
        if (hostWs) hostWs.send(JSON.stringify(message));
    }
}

export function sendToHost(game: T.Game, message: T.WSMessage) {
    const ws = connectionRegistry.getConnection(game.hostId.toString());
    if (ws) ws.send(JSON.stringify(message));
}