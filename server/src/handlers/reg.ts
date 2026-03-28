import type { WebSocket } from 'ws';

import { registerOrLogin } from '../core/index.js';
import { connectionRegistry, sendError } from '../server/index.js';
import { playersStore } from '../storage/index.js';

import * as C from '../constants/index.js';
import * as T from '../types/index.js';

const { REG } = C.COMMANDS;

export function regHandler(ws: WebSocket, data: T.RegData | null) {
    const { name, password } = data || {};

    if (playersStore.getByName(name ?? '')) {
        return sendError(ws, C.NAME_TAKEN, REG);
    }

    if (!name || !password) {
        return sendError(ws, C.MISSING_NAME_OR_PASS_MESSAGE, REG);
    }

    const { player, error } = registerOrLogin(name, password);

    if (!player) {
        return sendError(ws, error, REG);
    }

    connectionRegistry.register(player.index, ws);

    ws.send(JSON.stringify({
        type: 'reg',
        data: {
            name: player.name,
            index: player.index,
            error: false,
            errorText: ''
        },
        id: 0
    }));
}