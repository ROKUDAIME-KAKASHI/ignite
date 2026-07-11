"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Chess } from "chess.js";

export async function getAvailableChessGames() {
  const session = await getSession();
  if (!session) return [];

  const waitingGames = await prisma.chessGame.findMany({
    where: {
      status: "active",
      blackPlayerId: null,
      NOT: { whitePlayerId: session.id }
    },
    orderBy: { createdAt: "asc" }
  });

  // Fetch white player names
  const userIds = waitingGames.map(g => g.whitePlayerId).filter(Boolean) as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true }
  });
  const userMap = Object.fromEntries(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

  return waitingGames.map(g => ({
    id: g.id,
    playerName: g.whitePlayerId ? userMap[g.whitePlayerId] || "Unknown" : "Unknown"
  }));
}

export async function getMyActiveChessGames() {
  const session = await getSession();
  if (!session) return [];

  const activeGames = await prisma.chessGame.findMany({
    where: {
      status: "active",
      OR: [
        { whitePlayerId: session.id },
        { blackPlayerId: session.id }
      ]
    },
    orderBy: { lastMoveAt: "desc" }
  });

  const allUserIds = Array.from(new Set(activeGames.flatMap(g => [g.whitePlayerId, g.blackPlayerId]).filter(Boolean))) as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: allUserIds } },
    select: { id: true, firstName: true, lastName: true }
  });
  const userMap = Object.fromEntries(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

  return activeGames.map(g => {
    const isWhite = g.whitePlayerId === session.id;
    const opponentId = isWhite ? g.blackPlayerId : g.whitePlayerId;
    const opponentName = opponentId ? userMap[opponentId] || "Unknown" : "Waiting...";
    const isMyTurn = (g.turn === 'w' && isWhite) || (g.turn === 'b' && !isWhite);
    
    return {
      id: g.id,
      opponentName,
      isMyTurn,
      color: isWhite ? "White" : "Black"
    };
  });
}

export async function createNewChessGame() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const newGame = await prisma.chessGame.create({
    data: {
      whitePlayerId: session.id,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      history: "[]",
      turn: "w",
      status: "active"
    }
  });

  return { success: true, gameId: newGame.id };
}

export async function joinChessGame(gameId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const game = await prisma.chessGame.findUnique({ where: { id: gameId } });
  if (!game || game.blackPlayerId) return { success: false, error: "Game not available" };

  const updated = await prisma.chessGame.update({
    where: { id: gameId },
    data: { blackPlayerId: session.id }
  });

  return { success: true, gameId: updated.id };
}

export async function createOrJoinChessGame() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  // Check if there is an active game with one player waiting
  const waitingGame = await prisma.chessGame.findFirst({
    where: {
      status: "active",
      blackPlayerId: null,
      NOT: { whitePlayerId: session.id }
    },
    orderBy: { createdAt: "asc" }
  });

  if (waitingGame) {
    // Join as black
    const updated = await prisma.chessGame.update({
      where: { id: waitingGame.id },
      data: { blackPlayerId: session.id }
    });
    return { success: true, gameId: updated.id };
  }

  // Create new game
  const newGame = await prisma.chessGame.create({
    data: {
      whitePlayerId: session.id,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      history: "[]",
      turn: "w",
      status: "active"
    }
  });

  return { success: true, gameId: newGame.id };
}

export async function getChessGame(gameId: string) {
  const session = await getSession();
  if (!session) return null;

  const game = await prisma.chessGame.findUnique({
    where: { id: gameId }
  });

  if (!game) return null;

  return {
    ...game,
    isMyTurn: (game.turn === "w" && game.whitePlayerId === session.id) || (game.turn === "b" && game.blackPlayerId === session.id),
    myColor: game.whitePlayerId === session.id ? "w" : game.blackPlayerId === session.id ? "b" : null
  };
}

export async function makeChessMove(gameId: string, move: { from: string, to: string, promotion?: string }) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const game = await prisma.chessGame.findUnique({ where: { id: gameId } });
  if (!game) return { success: false, error: "Game not found" };

  const myColor = game.whitePlayerId === session.id ? "w" : game.blackPlayerId === session.id ? "b" : null;
  if (!myColor || game.turn !== myColor) {
    return { success: false, error: "Not your turn" };
  }

  try {
    const chess = new Chess(game.fen);
    const result = chess.move(move);
    
    if (!result) return { success: false, error: "Invalid move" };

    let status = "active";
    if (chess.isCheckmate()) status = myColor === "w" ? "white_won" : "black_won";
    else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) status = "draw";

    let history = [];
    try { history = JSON.parse(game.history); } catch (e) {}
    history.push({ ...move, fen: chess.fen(), san: result.san });

    await prisma.chessGame.update({
      where: { id: gameId },
      data: {
        fen: chess.fen(),
        turn: chess.turn(),
        history: JSON.stringify(history),
        status,
        lastMoveAt: new Date()
      }
    });

    return { success: true, fen: chess.fen(), status };
  } catch (err) {
    return { success: false, error: "Error processing move" };
  }
}
