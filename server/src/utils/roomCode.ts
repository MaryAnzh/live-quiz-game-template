import { ROOM_CODE_LENGTH, CHARTS } from '../constants/index.js';

export const generateRoomCode = (): string => {
    let code = '';

    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
        code += CHARTS[Math.floor(Math.random() * CHARTS.length)];
    }

    return code;
}