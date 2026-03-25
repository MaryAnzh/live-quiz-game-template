import type { WebSocket } from 'ws';

import * as C from '../constants/index.js';
import * as F from '../handlers/index.js';
import type * as T from '../types/index.js';
const { REG, CREATE_GAME, JOIN_GAME } = C.COMMANDS;

type MessageCallbackType<T> = (ws: WebSocket, data: T, id: number) => void;
type HandlerMap = {
    [REG]: MessageCallbackType<T.RegData>,
    [CREATE_GAME]: MessageCallbackType<T.CreateGameData>,
    [JOIN_GAME]: MessageCallbackType<T.JoinGameData>,
    [JOIN_GAME]: MessageCallbackType<T.JoinGameData>,
};

const handlers: HandlerMap = {
    [REG]: F.regHandler,
    [CREATE_GAME]: F.createGameHandler,
    [JOIN_GAME]: F.joinGameHandler,
};

export function routeMessage(ws: WebSocket, raw: string) {
    let msg: T.WSMessage;

    try {
        msg = JSON.parse(raw);
    } catch {
        ws.send(JSON.stringify({
            type: 'error',
            data: { error: true, errorText: C.INVALID_JSON },
            id: 0
        }));
        return;
    }
    const { type, data, id } = msg;
    const key = <keyof typeof handlers>type;

    const handler = handlers[key];

    if (!handler) {
        ws.send(JSON.stringify({
            type: 'error',
            data: { error: true, errorText: `${C.UNKNOWN_COMMAND}: ${msg.type}` },
            id
        }));
        return;
    }

    handlers[key](ws, data, id);
}