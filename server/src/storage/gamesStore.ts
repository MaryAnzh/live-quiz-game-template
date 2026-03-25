import type { Game } from '../types/index.js';

class GamesStore {
    private games = new Map<string, Game>();

    add(game: Game) {
        this.games.set(game.id, game);
    }

    getById(id: string) {
        return this.games.get(id) || null;
    }

    getByCode(code: string) {
        for (const game of this.games.values()) {
            if (game.code === code) return game;
        }
        return null;
    }
}

export const gamesStore = new GamesStore();