"use server";
import prisma from "@/lib/prisma";

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
    // Seed initial quizzes
    const dailyQuiz = await prisma.quiz.create({
      data: {
        title: "Daily Quiz",
        description: "5 questions · Scripture & Faith",
        type: "DAILY",
        xpReward: 100,
        questions: {
          create: [
            {
              text: "Which Gospel is the shortest in the New Testament?",
              type: "mcq",
              explanation: "The Gospel of Mark is the shortest of the four Gospels, with 16 chapters.",
              verse: "Mark 1:1",
              answers: {
                create: [
                  { text: "Matthew", isCorrect: false },
                  { text: "Mark", isCorrect: true },
                  { text: "Luke", isCorrect: false },
                  { text: "John", isCorrect: false },
                ]
              }
            },
            {
              text: "The Last Supper took place on a Thursday before the Jewish Passover.",
              type: "truefalse",
              explanation: "Jesus celebrated the Last Supper with His apostles on Holy Thursday, the night before His crucifixion.",
              verse: "Luke 22:14-20",
              answers: {
                create: [
                  { text: "True", isCorrect: true },
                  { text: "False", isCorrect: false },
                ]
              }
            },
            {
              text: "How many Books are in the Orthodox Old Testament?",
              type: "mcq",
              explanation: "The Orthodox Old Testament includes up to 51 books depending on the tradition, including books not found in the Protestant Bible.",
              answers: {
                create: [
                  { text: "39", isCorrect: false },
                  { text: "45", isCorrect: false },
                  { text: "46", isCorrect: true },
                  { text: "50", isCorrect: false },
                ]
              }
            },
            {
              text: "St. Peter was crucified upside-down because he felt unworthy to die like Jesus.",
              type: "truefalse",
              explanation: "Tradition holds that St. Peter requested to be crucified upside-down, as he did not consider himself worthy to die in the same manner as Jesus Christ.",
              answers: {
                create: [
                  { text: "True", isCorrect: true },
                  { text: "False", isCorrect: false },
                ]
              }
            },
            {
              text: "What does 'Agape' mean in Greek?",
              type: "mcq",
              explanation: "Agape refers to the highest form of love — unconditional, sacrificial, divine love. It is the love God has for humanity.",
              verse: "John 3:16",
              answers: {
                create: [
                  { text: "Friendship", isCorrect: false },
                  { text: "Romantic love", isCorrect: false },
                  { text: "Unconditional / Divine love", isCorrect: true },
                  { text: "Brotherly love", isCorrect: false },
                ]
              }
            }
          ]
        }
      }
    });

    const catechismQuiz = await prisma.quiz.create({
      data: {
        title: "Faith",
        description: "2 questions · Orthodox Teaching",
        type: "TOPIC",
        xpReward: 80,
        questions: {
          create: [
            {
              text: "How many Sacraments (Holy Mysteries) are there in the Orthodox Church?",
              type: "mcq",
              explanation: "The seven sacraments are: Baptism, Eucharist, Confirmation, Reconciliation, Anointing of the Sick, Holy Orders, and Matrimony.",
              answers: {
                create: [
                  { text: "5", isCorrect: false },
                  { text: "6", isCorrect: false },
                  { text: "7", isCorrect: true },
                  { text: "10", isCorrect: false },
                ]
              }
            },
            {
              text: "The Immaculate Conception refers to the sinless conception of Jesus Christ.",
              type: "truefalse",
              explanation: "The Immaculate Conception refers to Mary being conceived without original sin — not to Jesus. Jesus's miraculous birth is called the Virgin Birth.",
              answers: {
                create: [
                  { text: "True", isCorrect: false },
                  { text: "False", isCorrect: true },
                ]
              }
            }
          ]
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
