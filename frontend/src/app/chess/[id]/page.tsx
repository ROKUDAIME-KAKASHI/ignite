"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RefreshCw, Trophy, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { getChessGame, makeChessMove } from "@/app/actions/chess";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function ChessGamePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const gameId = params.id as string;
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetchGame = useCallback(async () => {
    const data = await getChessGame(gameId);
    if (data) {
      setGame(data);
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    const channel = supabase.channel(`chess_${gameId}`);
    channelRef.current = channel;

    channel.on('broadcast', { event: 'move' }, () => {
      fetchGame();
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [gameId, fetchGame]);

  const onDrop = (args: any) => {
    const { sourceSquare, targetSquare } = args;
    if (!game || !game.isMyTurn) {
      toast.error("Not your turn or game not found");
      return false;
    }

    const promotion = "q";
    
    makeChessMove(gameId, { from: sourceSquare, to: targetSquare, promotion })
      .then(res => {
        if (res.success) {
          if (channelRef.current) {
            channelRef.current.send({ type: 'broadcast', event: 'move' });
          }
          fetchGame();
        } else {
          toast.error("Move failed on server: " + res.error);
          fetchGame();
        }
      });
      
    return true;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <div className="p-8 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/10">Game not found.</div>
      </div>
    );
  }

  const isWaiting = !game.blackPlayerId;

  return (
    <div className="flex-1 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed bg-[#0a0a0a] min-h-[calc(100vh-64px)] w-full py-8">
      <div className="w-full max-w-2xl px-4 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          <Button variant="ghost" onClick={() => router.push('/chess')} className="text-slate-300 hover:text-white hover:bg-white/10 pl-2">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          
          <div className="flex items-center gap-3">
            {game.status === 'active' && (
              <span className={`w-3 h-3 rounded-full ${isWaiting ? 'bg-amber-500 animate-pulse' : game.isMyTurn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
            )}
            <div className="font-bold text-xl font-serif text-white tracking-wide">
              {game.status === 'active' ? (isWaiting ? "Waiting for Opponent..." : game.isMyTurn ? "Your Turn" : "Opponent's Turn") : 
               game.status === 'white_won' ? "White Won!" : 
               game.status === 'black_won' ? "Black Won!" : "Draw"}
            </div>
          </div>
          
          <Button variant="outline" size="icon" onClick={fetchGame} className="border-white/20 bg-white/5 hover:bg-white/10 text-white">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Opponent Profile */}
        <div className="w-full max-w-md flex items-center gap-4 mb-4 px-2">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg text-white">
            {game.myColor === 'w' ? '♚' : '♔'}
          </div>
          <div>
            <p className="font-bold text-slate-200 text-lg">{game.opponentName || "Waiting..."}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{game.myColor === 'w' ? 'Black' : 'White'}</p>
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
              position: game.fen,
              onPieceDrop: onDrop,
              boardOrientation: game.myColor === 'b' ? 'black' : 'white',
              allowDragging: game.status === 'active' && game.isMyTurn,
              darkSquareStyle: { backgroundColor: '#769656' },
              lightSquareStyle: { backgroundColor: '#eeeed2' },
              dropSquareStyle: { boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)' }
            }}
          />
          
          {/* Game Over Overlay */}
          {game.status !== 'active' && (
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[4px] flex items-center justify-center p-4 opacity-0 animate-in fade-in duration-500">
              <div className="bg-[#111] p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-white/10 scale-95 animate-in zoom-in-95 duration-500 delay-150 fill-mode-forwards">
                <Trophy className={`w-16 h-16 mx-auto mb-4 ${
                  (game.status === 'white_won' && game.myColor === 'w') || (game.status === 'black_won' && game.myColor === 'b')
                    ? 'text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                    : 'text-slate-600'
                }`} />
                <h2 className="text-4xl font-extrabold font-serif mb-3 text-white">
                  {game.status === 'draw' ? "It's a Draw" : "Checkmate!"}
                </h2>
                <p className="text-slate-400 mb-8 text-lg">
                  {game.status === 'white_won' ? "White takes the victory." : 
                   game.status === 'black_won' ? "Black takes the victory." : "The game ended in a stalemate."}
                </p>
                <Button className="w-full h-12 text-lg font-bold bg-white text-black hover:bg-slate-200 rounded-xl" onClick={() => router.push('/chess')}>
                  Return to Lobby
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* My Profile */}
        <div className="w-full max-w-md flex items-center gap-4 mt-4 px-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shadow-lg text-black text-xl font-bold">
            {game.myColor === 'w' ? '♔' : '♚'}
          </div>
          <div>
            <p className="font-bold text-white text-lg">{user?.displayName || "You"}</p>
            <p className="text-xs font-medium text-emerald-500 uppercase tracking-widest">{game.myColor === 'w' ? 'White' : 'Black'}</p>
          </div>
        </div>
        
        {/* Helper Text */}
        <div className="mt-10 text-center text-sm font-medium text-slate-500 max-w-sm px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
          {game.status === "active" && !game.isMyTurn && "You can close this app and return later. Your game is saved automatically!"}
          {game.status === "active" && game.isMyTurn && "It's your move! Drag a piece to move."}
        </div>

      </div>
    </div>
  );
}
