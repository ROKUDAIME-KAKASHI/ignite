"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getJourneys() {
  const session = await getSession();
  const userId = session?.id;

  // 1. Ensure seed data exists
  let courses = await prisma.journeyCourse.findMany({
    include: {
      nodes: {
        orderBy: { order: "asc" },
      },
    }
  });

  if (courses.length === 0) {
    // Seed The Synoptic Gospels
    const synoptic = await prisma.journeyCourse.create({
      data: {
        title: "The Synoptic Gospels",
        description: "A deep dive into the life of Jesus Christ.",
        color: "from-purple-500 to-indigo-400",
        icon: "✝️",
        nodes: {
          create: [
            { title: "The Incarnation", type: "read", content: "Read Luke 1-2", order: 1 },
            { title: "Sermon on the Mount", type: "quiz", content: "Read Matthew 5-7", order: 2 },
            { title: "The Parables", type: "read", content: "Read Mark 4", order: 3 },
            { title: "The Bread of Life", type: "read", content: "Read John 6", order: 4 },
            { title: "The Passion Narrative", type: "boss", content: "Read Matthew 26-28", order: 5 },
          ]
        }
      },
      include: { nodes: { orderBy: { order: "asc" } } }
    });

    const patriarchs = await prisma.journeyCourse.create({
      data: {
        title: "The Patriarchs",
        description: "Genesis: The origin story of God's people.",
        color: "from-amber-500 to-orange-400",
        icon: "📖",
        nodes: {
          create: [
            { title: "Abraham's Call", type: "read", content: "Gen 12", order: 1 },
          ]
        }
      },
      include: { nodes: { orderBy: { order: "asc" } } }
    });

    courses = [synoptic, patriarchs];
  }

  // 2. Fetch User Progress if logged in
  let userNodes: any[] = [];
  if (userId) {
    userNodes = await prisma.userJourneyNode.findMany({
      where: { userId },
    });

    // If user has no progress, enroll them in Synoptic Gospels automatically for demo
    if (userNodes.length === 0) {
      const synopticCourse = courses.find(c => c.title === "The Synoptic Gospels");
      if (synopticCourse && synopticCourse.nodes.length >= 2) {
        await prisma.userJourneyNode.createMany({
          data: [
            { userId, nodeId: synopticCourse.nodes[0].id, status: "completed", stars: 3 },
            { userId, nodeId: synopticCourse.nodes[1].id, status: "completed", stars: 3 },
            { userId, nodeId: synopticCourse.nodes[2].id, status: "current", stars: 0 },
          ]
        });
        userNodes = await prisma.userJourneyNode.findMany({ where: { userId } });
      }
    }
  }

  // Map progress to nodes
  const coursesWithProgress = courses.map(course => {
    let completedCount = 0;
    let earnedStars = 0;

    const mappedNodes = course.nodes.map(node => {
      const progress = userNodes.find(un => un.nodeId === node.id);
      if (progress?.status === "completed") {
        completedCount++;
        earnedStars += progress.stars;
      }
      return {
        ...node,
        status: progress ? progress.status : "locked",
        stars: progress ? progress.stars : 0
      };
    });

    return {
      ...course,
      nodes: mappedNodes,
      completedNodes: completedCount,
      totalNodes: course.nodes.length,
      earnedStars,
    };
  });

  return coursesWithProgress;
}
