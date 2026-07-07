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

export async function enrollCourse(courseId: string) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not authenticated" };

  // Get course nodes
  const course = await prisma.journeyCourse.findUnique({
    where: { id: courseId },
    include: { nodes: { orderBy: { order: "asc" } } }
  });

  if (!course || course.nodes.length === 0) return { success: false, error: "Course not found or empty" };

  // Create progress for first node
  await prisma.userJourneyNode.create({
    data: {
      userId: session.id,
      nodeId: course.nodes[0].id,
      status: "current",
      stars: 0
    }
  });

  return { success: true };
}

export async function completeNode(nodeId: string) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not authenticated" };

  // Mark current node completed
  const progress = await prisma.userJourneyNode.update({
    where: { userId_nodeId: { userId: session.id, nodeId } },
    data: { status: "completed", stars: 3 }
  });

  // Find next node in course
  const node = await prisma.journeyNode.findUnique({ where: { id: nodeId } });
  if (node) {
    const nextNode = await prisma.journeyNode.findFirst({
      where: { courseId: node.courseId, order: { gt: node.order } },
      orderBy: { order: "asc" }
    });

    if (nextNode) {
      // Unlock next node
      await prisma.userJourneyNode.create({
        data: {
          userId: session.id,
          nodeId: nextNode.id,
          status: "current",
          stars: 0
        }
      });
    }

    // Award XP
    await prisma.user.update({
      where: { id: session.id },
      data: { xp: { increment: 50 } }
    });

    await prisma.xPLog.create({
      data: {
        userId: session.id,
        amount: 50,
        reason: `Completed Journey Node: ${node.title}`
      }
    });
  }

  return { success: true };
}
