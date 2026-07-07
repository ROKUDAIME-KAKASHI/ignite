"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardXP } from "@/app/actions/gamification";

export async function getMentorshipQuestions() {
  try {
    const questions = await prisma.mentorshipQuestion.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { firstName: true } }
      }
    });

    return questions.map(q => ({
      id: q.id,
      text: q.text,
      answer: q.answer,
      answeredBy: q.answeredBy,
      isAnonymous: q.isAnonymous,
      createdAt: q.createdAt,
      askedBy: q.isAnonymous ? "Anonymous Youth" : (q.user?.firstName || "Youth Member"),
      isMine: false, // We'll set this client side if needed, or by checking session
    }));
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}

export async function askQuestion(text: string, isAnonymous: boolean) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { error: "You must be logged in to ask a question." };
    }

    const question = await prisma.mentorshipQuestion.create({
      data: {
        userId: session.id,
        text,
        isAnonymous,
      },
      include: {
        user: { select: { firstName: true } }
      }
    });

    // Award minor XP for engaging with mentorship
    await awardXP(10, "Asked a Mentorship Question");

    return {
      success: true,
      question: {
        id: question.id,
        text: question.text,
        answer: question.answer,
        answeredBy: question.answeredBy,
        isAnonymous: question.isAnonymous,
        createdAt: question.createdAt,
        askedBy: question.isAnonymous ? "Anonymous Youth" : (question.user?.firstName || "Youth Member"),
      }
    };
  } catch (error) {
    console.error("Error asking question:", error);
    return { error: "Failed to submit question." };
  }
}
