"use server";
import prisma from "@/lib/prisma";
import { TRIVIA_QUESTIONS } from "@/lib/trivia";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/logger";

export async function getQuizzes() {
  const session = await getSession();
  const user = session?.id ? await prisma.user.findUnique({ where: { id: session.id } }) : null;
  const userChurchId = user?.churchId || null;

  let quizzes = await prisma.quiz.findMany({
    where: {
      OR: [
        { churchId: null },
        ...(userChurchId ? [{ churchId: userChurchId }] : [])
      ]
    },
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

  const session = await getSession();
  const userId = session?.id;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Check attempts for all quizzes today
  let completedQuizIds = new Set<string>();
  if (userId) {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        completedAt: { gte: todayStart }
      }
    });
    attempts.forEach(a => completedQuizIds.add(a.quizId));
  }

  return quizzes.map(q => {
    let mappedQuestions = q.questions.map(question => {
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
    });

    // Generate dynamic jumbled questions for ALL quizzes based on the current day
    const dayIndex = Math.floor(Date.now() / 86400000);
    // Use a different salt/offset for each quiz based on its title length and ID
    const salt = q.title.length * 13 + (q.type === "DAILY" ? 0 : 50);
    const start = ((dayIndex + salt) * 7) % TRIVIA_QUESTIONS.length;
    
    mappedQuestions = [];
    for (let i = 0; i < 5; i++) {
      // jump around to jumble the questions
      const index = (start + (i * 17)) % TRIVIA_QUESTIONS.length;
      const tq = TRIVIA_QUESTIONS[index];
      const isTrueFalse = tq.options.length === 2 && tq.options.includes("True") && tq.options.includes("False");
      mappedQuestions.push({
        id: `dynamic-q-${q.id}-${i}`,
        type: isTrueFalse ? "truefalse" : "mcq",
        question: tq.q,
        options: [...tq.options],
        answer: isTrueFalse ? tq.a === "True" : tq.a,
        explanation: `The correct answer is: ${tq.a}`,
        verse: undefined
      });
    }

    // Shuffle options for MCQ (pseudo-random based on dayIndex so it's stable per day)
    mappedQuestions.forEach(mq => {
      if (mq.type === "mcq" && mq.options) {
        const hash = dayIndex + mq.question.length;
        if (hash % 2 === 0) {
          mq.options = [...mq.options].reverse();
        }
        if (hash % 3 === 0 && mq.options.length === 4) {
          mq.options = [mq.options[1], mq.options[0], mq.options[3], mq.options[2]];
        }
      }
    });

    return {
      id: q.id,
      label: q.title,
      desc: q.description,
      type: q.type,
      xp: q.xpReward,
      emoji: q.type === "DAILY" ? "⭐" : "📜",
      color: q.type === "DAILY" ? "gradient-gold" : "gradient-royal",
      badge: q.type === "DAILY" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      isCompleted: completedQuizIds.has(q.id),
      questions: mappedQuestions
    };
  });
}

export async function recordQuizAttempt(quizId: string | number, score: number) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not logged in" };

  try {
    const quiz = await prisma.quiz.findFirst({ where: { id: String(quizId) } });
    if (!quiz) return { success: false, error: "Quiz not found" };

    // ALL quizzes are now daily-limited
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: session.id,
        quizId: quiz.id,
        completedAt: { gte: todayStart }
      }
    });
    
    if (attempt) {
      return { success: false, error: "Quiz already completed today. Come back tomorrow!" };
    }

    await prisma.quizAttempt.create({
      data: {
        userId: session.id,
        quizId: quiz.id,
        score: score
      }
    });

    // Log the action to the separate Neon audit database
    await logAudit(session.id, "COMPLETED_QUIZ", { quizId: quiz.id, score, type: quiz.type });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

export async function getAllTriviaForUser() {
  const session = await getSession();
  const user = session?.id ? await prisma.user.findUnique({ where: { id: session.id } }) : null;
  const churchId = user?.churchId || null;

  const customQuizzes = await prisma.quiz.findMany({
    where: { churchId, type: "CUSTOM" },
    include: { questions: { include: { answers: true } } }
  });

  const customQuestions = customQuizzes.flatMap(q => q.questions).map(q => ({
    q: q.text,
    a: q.answers.find(a => a.isCorrect)?.text || "",
    options: q.answers.map(a => a.text),
    explanation: q.explanation || ""
  }));

  const allQuestions = [...TRIVIA_QUESTIONS, ...customQuestions];
  return allQuestions;
}
