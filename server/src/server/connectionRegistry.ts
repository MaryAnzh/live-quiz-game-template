import type { WebSocket } from 'ws';

class ConnectionRegistry {
    private wsToPlayer = new Map<WebSocket, string>();
    private playerToWs = new Map<string, WebSocket>();

    register(playerId: string, ws: WebSocket) {
        this.wsToPlayer.set(ws, playerId);
        this.playerToWs.set(playerId, ws);
    }

    getPlayerId(ws: WebSocket): string | undefined {
        return this.wsToPlayer.get(ws);
    }

    getConnection(playerId: string): WebSocket | undefined {
        return this.playerToWs.get(playerId);
    }

    removeBySocket(ws: WebSocket) {
        const playerId = this.wsToPlayer.get(ws);
        if (playerId) {
            this.wsToPlayer.delete(ws);
            this.playerToWs.delete(playerId);
        }
    }

    removeByPlayerId(playerId: string) {
        const ws = this.playerToWs.get(playerId);
        if (ws) {
            this.playerToWs.delete(playerId);
            this.wsToPlayer.delete(ws);
        }
    }
}

export const connectionRegistry = new ConnectionRegistry();