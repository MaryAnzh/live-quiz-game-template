import type * as T from '../types/index.js';
import * as C from '../constants/index.js';
import { broadcastToGame } from '../server/broadcaster.js';

const basePoints = 1000;

export function finishQuestion(game: T.Game) {
    const question = game.questions[game.currentQuestion];
    const correctIndex = question.correctIndex;

    const results = [];

    for (const player of game.players) {
        const answer = game.playerAnswers.get(player.index);

        const answered = !!answer;
        const correct = answered && answer.answerIndex === correctIndex;

        let pointsEarned = 0;

        if (correct) {
            const timeLimitMs = question.timeLimitSec * 1000;
            const timeRemaining = Math.max(0, timeLimitMs - answer.timestamp);

            pointsEarned = Math.round(
                basePoints * (timeRemaining / timeLimitMs)
            );
        }

        player.score += pointsEarned;

        results.push({
            name: player.name,
            answered,
            correct,
            pointsEarned,
            totalScore: player.score
        });
    }

    broadcastToGame(game, {
        type: 'question_result',
        data: {
            questionIndex: game.currentQuestion,
            correctIndex,
            playerResults: results
        },
        id: 0
    });

    const nextIndex = game.currentQuestion + 1;

    if (nextIndex >= game.questions.length) {
        finishGame(game);
        return;
    }

    game.currentQuestion = nextIndex;
    game.playerAnswers = new Map();
    game.questionStartTime = Date.now();

    const nextQuestion = game.questions[nextIndex];

    const payload = {
        questionNumber: nextIndex + 1,
        totalQuestions: game.questions.length,
        text: nextQuestion.text,
        options: nextQuestion.options,
        timeLimitSec: nextQuestion.timeLimitSec
    };

    game.players.forEach(p => {
        p.ws?.send(JSON.stringify({
            type: 'question',
            data: payload,
            id: 0
        }));
    });

    game.questionTimer = setTimeout(() => {
        finishQuestion(game);
    }, nextQuestion.timeLimitSec * 1000);
}

function finishGame(game: T.Game) {
    game.status = C.GAME_STATUS.FINISHED;

    const scoreboard = [...game.players]
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({
            name: p.name,
            score: p.score,
            rank: i + 1
        }));

    broadcastToGame(game, {
        type: 'game_finished',
        data: { scoreboard },
        id: 0
    });
}