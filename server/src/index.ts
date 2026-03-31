import { WebSocketServer } from 'ws';
import { broadcastToGame, connectionRegistry } from './server/index.js';
import { routeMessage } from './route/messageRouter.js';
import { gamesStore } from './storage/gamesStore.js';
import * as C from './constants/index.js';
import { finishQuestion } from './core/finishQuestion.js';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const wss = new WebSocketServer({ port });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (msg) => {
        routeMessage(ws, msg.toString());
    });

    ws.on('close', () => {
        const removeConnection = () => {
            connectionRegistry.removeBySocket(ws);
            console.log('Client disconnected');
        }

        const playerId = connectionRegistry.getPlayerId(ws);

        if (!playerId) return;

        const game = gamesStore.getById(playerId);
        if (!game) {
            removeConnection();
            return;
        }

        const index = game.players.findIndex(p => p.index === playerId);
        if (index !== -1) {
            game.players.splice(index, 1);
        }

        game.playerAnswers.delete(playerId);

        removeConnection();

        if (game.status === C.GAME_STATUS.WAITING) {
            broadcastToGame(game, {
                type: 'update_players',
                data: game.players.map(({ name, index, score }) => ({
                    name,
                    index,
                    score
                })),
                id: 0
            });
            return;
        }

        const allAnswered =
            game.players.length > 0 &&
            game.players.every(p => game.playerAnswers.has(p.index));

        if (allAnswered) {
            clearTimeout(game.questionTimer);
            finishQuestion(game);
            return;
        }

        broadcastToGame(game, {
            type: 'update_players',
            data: game.players.map(({ name, index, score }) => ({
                name,
                index,
                score
            })),
            id: 0
        });
    });
});

console.log(`WebSocket server started on ws://localhost:${port}`);