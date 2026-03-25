export const COMMANDS = {
    REG: 'reg',
    CREATE_GAME: 'create_game',
    JOIN_GAME: 'join_game',
    START_GAME: 'start_game',
    ANSWER: 'answer',
    EXPORT_QUESTIONS: 'export_questions',
    IMPORT_QUESTIONS: 'import_questions'
} as const;

export const QUIZ_MESSAGE = { PLAYER_JOINED: 'player_joined', UPDATE_PLAYERS: 'update_players' } as const;
export const { PLAYER_JOINED, UPDATE_PLAYERS } = QUIZ_MESSAGE;

export const GAME_STATUS = {
    WAITING: 'waiting',
    IN_PROGRESS: 'in_progress',
    FINISHED: 'finished'
} as const;
export const { WAITING, IN_PROGRESS, FINISHED } = GAME_STATUS;

export const BASE_POINTS = 1000;

export const ROOM_CODE_LENGTH = 6;

export const SCHEMA_VERSION = 1;