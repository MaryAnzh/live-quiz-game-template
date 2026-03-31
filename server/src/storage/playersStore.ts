import type { Player } from '../types/index.js';

class PlayersStore {
    private players = new Map<string, Player>();

    add(player: Player) {
        this.players.set(player.index, player);
    }

    getById(id: string): Player | undefined {
        return this.players.get(id);
    }

    getByName(name: string): Player | undefined {
        for (const p of this.players.values()) {
            if (p.name === name) return p;
        }
        return undefined;
    }

    remove(id: string) {
        this.players.delete(id);
    }
}

export const playersStore = new PlayersStore();