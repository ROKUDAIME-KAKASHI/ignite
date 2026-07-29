"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, ShieldAlert } from "lucide-react";
import { Chess } from "chess.js";
import { awardXP } from "@/app/actions/gamification";
import { motion } from "framer-motion";

export default function ChessBotPage() {
  const router = useRouter();
  const [game, setGame] = useState(new Chess());
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost" | "draw">("playing");

  const makeRandomMove = () => {
    if (game.isGameOver()) return;

    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return; // shouldn't happen if not game over

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const move = possibleMoves[randomIndex];

    try {
      game.move(move);
      setGame(new Chess(game.fen()));
      checkGameOver();
    } catch (e) {
      console.error(e);
    }
  };

  const checkGameOver = async () => {
    if (game.isCheckmate()) {
      const isPlayerTurn = game.turn() === "w";
      if (isPlayerTurn) {
        setGameStatus("lost");
      } else {
        setGameStatus("won");
        await awardXP(50, "Won Chess Game vs Bot");
      }
    } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
      setGameStatus("draw");
    }
  };

  const onDrop = (args: any) => {
    const { sourceSquare, targetSquare } = args;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q" // always promote to queen for simplicity
      });

      if (move === null) return false;

      setGame(new Chess(game.fen()));
      checkGameOver();

      if (gameStatus === "playing" && !game.isGameOver()) {
        setTimeout(makeRandomMove, 300);
      }
      return true;
    } catch (e: any) {
      return false;
    }
  };

  const restartGame = () => {
    setGame(new Chess());
    setGameStatus("playing");
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed bg-[#0a0a0a] min-h-[calc(100vh-64px)] w-full py-8">
      <div className="w-full max-w-2xl px-4 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          <Button variant="ghost" onClick={() => router.push('/chess')} className="text-slate-300 hover:text-white hover:bg-white/10 pl-2">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          
          <div className="flex items-center gap-3">
            {gameStatus === 'playing' && (
              <span className={`w-3 h-3 rounded-full ${game.turn() === 'w' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
            )}
            <div className="font-bold text-xl font-serif text-white tracking-wide">
              {gameStatus === 'playing' ? (game.turn() === 'w' ? "Your Turn" : "Bot is thinking...") : 
               gameStatus === 'won' ? "Victory!" : 
               gameStatus === 'lost' ? "Defeat" : "Draw"}
            </div>
          </div>
          
          <div className="w-10"></div> {/* Spacer to center title */}
        </div>

        {/* Opponent Profile */}
        <div className="w-full max-w-md flex items-center gap-4 mb-4 px-2">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg text-amber-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-slate-200 text-lg">AI Grandmaster</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Black (Bot)</p>
          </div>
        </div>

        {/* Chessboard Wrapper */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md aspect-square rounded-[1.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-8 ring-[#1a1a1a] relative bg-[#1a1a1a]"
        >
          <Chessboard 
            options={{
              position: game.fen(),
              onPieceDrop: onDrop,
              boardOrientation: 'white',
              allowDragging: gameStatus === 'playing',
              darkSquareStyle: { backgroundColor: '#769656' },
              lightSquareStyle: { backgroundColor: '#eeeed2' },
              dropSquareStyle: { boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)' }
            }}
          />
          
          {/* Game Over Overlay */}
          {gameStatus !== 'playing' && (
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[4px] flex items-center justify-center p-4 opacity-0 animate-in fade-in duration-500">
              <div className="bg-[#111] p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-white/10 scale-95 animate-in zoom-in-95 duration-500 delay-150 fill-mode-forwards">
                <Trophy className={`w-16 h-16 mx-auto mb-4 ${
                  gameStatus === 'won'
                    ? 'text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                    : 'text-slate-600'
                }`} />
                <h2 className="text-4xl font-extrabold font-serif mb-3 text-white">
                  {gameStatus === 'draw' ? "It's a Draw" : gameStatus === 'won' ? "You Won!" : "Checkmate!"}
                </h2>
                <p className="text-slate-400 mb-8 text-lg">
                  {gameStatus === 'won' ? "You defeated the AI Bot." : 
                   gameStatus === 'lost' ? "The AI Bot takes the victory." : "The game ended in a stalemate."}
                </p>
                
                {gameStatus === 'won' && (
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-center gap-3 mb-8">
                    <Trophy className="w-6 h-6" />
                    <span className="text-base font-bold">+50 XP Awarded!</span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button className="flex-1 h-12 text-base font-bold bg-white/10 text-white hover:bg-white/20 rounded-xl" onClick={() => router.push('/chess')}>
                    Lobby
                  </Button>
                  <Button className="flex-1 h-12 text-base font-bold bg-white text-black hover:bg-slate-200 rounded-xl" onClick={restartGame}>
                    Play Again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* My Profile */}
        <div className="w-full max-w-md flex items-center gap-4 mt-4 px-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shadow-lg text-black text-xl font-bold">
            ♔
          </div>
          <div>
            <p className="font-bold text-white text-lg">You</p>
            <p className="text-xs font-medium text-emerald-500 uppercase tracking-widest">White</p>
          </div>
        </div>
        
        {/* Helper Text */}
        <div className="mt-10 text-center text-sm font-medium text-slate-500 max-w-sm px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
          {gameStatus === "playing" && "Play locally against our built-in AI Bot. Great for offline practice!"}
        </div>

      </div>
    </div>
  );
}
