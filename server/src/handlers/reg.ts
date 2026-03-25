import type { WebSocket } from 'ws';
import { registerOrLogin } from '../core/playerManager.js';
import { connectionRegistry } from '../server/index.js';
import * as C from '../constants/index.js';
import * as T from '../types/index.js';

export function regHandler(ws: WebSocket, data: T.RegData | null) {
    const { name, password } = data || {};

    if (!name || !password) {
        ws.send(JSON.stringify({
            type: 'reg',
            data: {
                name: '',
                index: '',
                error: true,
                errorText: C.MISSING_NAME_OR_PASS_MESSAGE
            },
            id: 0
        }));
        return;
    }

    const { player, error } = registerOrLogin(name, password);

    if (!player) {
        ws.send(JSON.stringify({
            type: 'reg',
            data: {
                name,
                index: '',
                error: true,
                errorText: error   // здесь будет "Wrong password"
            },
            id: 0
        }));
        return;
    }

    connectionRegistry.register(player.index, ws);

    ws.send(JSON.stringify({
        type: 'reg',
        data: {
            name: player.name,
            index: player.index,
            error: false,
            errorText: null
        },
        id: 0
    }));
}