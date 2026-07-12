"use server";
import prisma from "@/lib/prisma";
import { TRIVIA_QUESTIONS } from "@/lib/trivia";

export async function getQuizzes() {
  let quizzes = await prisma.quiz.findMany({
    include: {
      questions: {
        include: {
          answers: true
        }
      }
    }
  });

  if (quizzes.length === 0) {
    // Helper to map central TRIVIA_QUESTIONS to Prisma structure
    const mapQuestion = (q: typeof TRIVIA_QUESTIONS[0]) => {
      const isTrueFalse = q.options.length === 2 && q.options.includes("True") && q.options.includes("False");
      return {
        text: q.q,
        type: isTrueFalse ? "truefalse" : "mcq",
        explanation: `The correct answer is: ${q.a}`,
        answers: {
          create: q.options.map(opt => ({
            text: opt,
            isCorrect: opt === q.a
          }))
        }
      };
    };

    // Seed "Daily Scripture Quiz" (First 5 questions)
    await prisma.quiz.create({
      data: {
        title: "Daily Scripture Quiz",
        description: "5 questions · Scripture & Faith",
        type: "DAILY",
        xpReward: 100,
        questions: {
          create: TRIVIA_QUESTIONS.slice(0, 5).map(mapQuestion)
        }
      }
    });

    // Seed "Orthodox Faith & Liturgy" (Questions 5-10)
    await prisma.quiz.create({
      data: {
        title: "Orthodox Faith & Liturgy",
        description: "5 questions · Orthodox Teaching",
        type: "TOPIC",
        xpReward: 80,
        questions: {
          create: TRIVIA_QUESTIONS.slice(5, 10).map(mapQuestion)
        }
      }
    });

    // Seed "Biblical History & Trivia" (Questions 10-15)
    await prisma.quiz.create({
      data: {
        title: "Biblical History & Trivia",
        description: "5 questions · General Bible Knowledge",
        type: "TOPIC",
        xpReward: 90,
        questions: {
          create: TRIVIA_QUESTIONS.slice(10, 15).map(mapQuestion)
        }
      }
    });

    quizzes = await prisma.quiz.findMany({
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    });
  }

  return quizzes.map(q => ({
    id: q.id,
    label: q.title,
    desc: q.description,
    type: q.type,
    xp: q.xpReward,
    emoji: q.type === "DAILY" ? "⭐" : "📜",
    color: q.type === "DAILY" ? "gradient-gold" : "gradient-royal",
    badge: q.type === "DAILY" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    questions: q.questions.map(question => {
      const correctAns = question.answers.find(a => a.isCorrect);
      let parsedCorrect: string | boolean = correctAns?.text || "";
      if (question.type === "truefalse") {
        parsedCorrect = parsedCorrect === "True";
      }
      return {
        id: question.id,
        type: question.type,
        question: question.text,
        options: question.answers.map(a => a.text),
        answer: parsedCorrect,
        explanation: question.explanation || "",
        verse: question.verse || undefined
      };
    })
  }));
}

import { getSession } from "@/lib/auth";

export async function recordQuizAttempt(quizId: string | number, score: number) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not logged in" };

  try {
    const quiz = await prisma.quiz.findFirst({ where: { id: String(quizId) } });
    if (!quiz) return { success: false, error: "Quiz not found" };

    await prisma.quizAttempt.create({
      data: {
        userId: session.id,
        quizId: quiz.id,
        score: score
      }
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}
