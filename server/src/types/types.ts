import type { WebSocket } from 'ws';
import * as C from '../constants/index.js';
const { WAITING, IN_PROGRESS, FINISHED } = C.GAME_STATUS;

export type Player = {
  name: string;
  passwordHash: string;
  index: string;
  score: number;
  ws?: WebSocket;
  hasAnswered?: boolean;
  answerTime?: number;
  answeredCorrectly?: boolean;
}

export type Question = {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
}

export type Game = {
  id: string;
  code: string;
  hostId: string;
  questions: Question[];
  players: Player[];
  currentQuestion: number;
  status: typeof WAITING | typeof IN_PROGRESS | typeof FINISHED;
  questionStartTime?: number;
  questionTimer?: NodeJS.Timeout;
  playerAnswers: Map<string, { answerIndex: number; timestamp: number }>;
}

export type User = {
  name: string;
  password: string;
  index: string;
  ws?: WebSocket;
}

export type WSMessage = {
  type: string;
  data: any;
  id: number;
}

export type RegData = {
  name: string;
  password: string;
}

export type CreateGameData = {
  questions: Question[];
}

export type JoinGameData = {
  code: string;
}

export type StartGameData = {
  gameId: string;
}

export type AnswerData = {
  gameId: string;
  questionIndex: number;
  answerIndex: number;
}

export type JoinGameResult =
  | { ok: true; game: Game }
  | { ok: false; error: string };

export type JoinPlayerType = {
  setGameId: string;
  setScreen: 'lobby';
}

export type PlayerJoinedMessage = {
  playerName: string;
  playerCount: number;
}