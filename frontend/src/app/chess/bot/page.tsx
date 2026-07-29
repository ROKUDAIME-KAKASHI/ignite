"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { awardXP } from "@/app/actions/gamification";
import confetti from "canvas-confetti";

export default function ChessBotPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  
  const [game, setGame] = useState(new Chess());
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost" | "draw">("playing");
  const [awarded, setAwarded] = useState(false);

  const makeRandomMove = () => {
    const possibleMoves = game.moves();
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) return; // Game over

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    setGame(new Chess(game.fen()));
    checkGameOver();
  };

  const checkGameOver = async () => {
    if (game.isCheckmate()) {
      if (game.turn() === 'b') {
        // White (player) wins
        setGameStatus("won");
        if (user && !awarded) {
          setAwarded(true);
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          const res = await awardXP(50, "Defeated Chess Bot");
          if (res.success && res.xp) setUser({ ...user, xp: res.xp, level: res.level });
        }
      } else {
        setGameStatus("lost");
      }
    } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
      setGameStatus("draw");
      if (user && !awarded) {
        setAwarded(true);
        const res = await awardXP(10, "Drew with Chess Bot");
        if (res.success && res.xp) setUser({ ...user, xp: res.xp, level: res.level });
      }
    }
  };

  const onDrop = (args: any) => {
    const { sourceSquare, targetSquare } = args;
    if (gameStatus !== "playing") return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q" // always promote to queen for simplicity
      });

      if (move === null) return false;
      
      setGame(new Chess(game.fen()));
      checkGameOver();

      if (!game.isGameOver()) {
        setTimeout(makeRandomMove, 500);
      }
      return true;
    } catch (e: any) {
      alert("Chess Error: " + (e?.message || "Unknown error"));
      return false;
    }
  };

  const restartGame = () => {
    setGame(new Chess());
    setGameStatus("playing");
    setAwarded(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center py-6 px-4 max-w-2xl mx-auto w-full min-h-[calc(100vh-64px)]">
      <div className="w-full flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.push('/chess')} className="pl-0">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="font-bold text-lg font-serif">
          {gameStatus === 'playing' ? "Vs AI Bot" : 
           gameStatus === 'won' ? "You Won!" : 
           gameStatus === 'lost' ? "You Lost!" : "Draw"}
        </div>
        <Button variant="outline" size="icon" onClick={restartGame}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-full max-w-md aspect-square rounded-lg shadow-2xl overflow-hidden ring-4 ring-border/50">
        <Chessboard 
          options={{
            position: game.fen(),
            onPieceDrop: onDrop,
            boardOrientation: 'white',
            allowDragging: gameStatus === 'playing',
            darkSquareStyle: { backgroundColor: '#769656' },
            lightSquareStyle: { backgroundColor: '#eeeed2' }
          }}
        />
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground max-w-sm space-y-4">
        {gameStatus === "playing" && "Play locally against our built-in AI Bot. Great for offline practice!"}
        
        {gameStatus === "won" && (
          <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div className="text-left">
              <p className="font-bold">Victory!</p>
              <p className="text-xs">+50 XP Awarded for defeating the bot.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
