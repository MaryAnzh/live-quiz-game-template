import { WebSocketServer } from 'ws';
import { connectionRegistry, routeMessage } from './server/index.js';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const wss = new WebSocketServer({ port });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (msg) => {
        routeMessage(ws, msg.toString());
    });

    ws.on('close', () => {
        connectionRegistry.removeBySocket(ws);
        console.log('Client disconnected');
    });
});

console.log(`WebSocket server started on ws://localhost:${port}`);