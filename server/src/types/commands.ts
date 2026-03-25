// import * as C from '../constants/index';
// import { Game } from './Game';
// import { Question } from './Question';

// export type RegData = {
//     name: string;
//     password: string;
// }

// export type CreateGameData = {
//     questions: Question[];
// };

// export type JoinGameData = {
//     code: string;
// };

// export type CommandsKeysType =
//     typeof C.COMMANDS.REG |
//     typeof C.COMMANDS.CREATE_GAME |
//     typeof C.COMMANDS.JOIN_GAME;

// export type MessageDataType = {
//     id: number;
// } &
//     ({
//         type: typeof C.COMMANDS.REG;
//         data: RegData;
//     }
//         | {
//             type: typeof C.COMMANDS.CREATE_GAME;
//             data: CreateGameData;
//         }
//         | {
//             type: typeof C.COMMANDS.JOIN_GAME;
//             data: JoinGameData;
//         }
//     );
// export type OutputMessageType = {
//     id: number;
//     data: unknown;
//     type: (typeof C.COMMANDS)[keyof typeof C.COMMANDS] | (typeof C.QUIZ_MESSAGE)[keyof typeof C.QUIZ_MESSAGE];
// }