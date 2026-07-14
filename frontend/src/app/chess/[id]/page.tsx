"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getChessGame, makeChessMove } from "@/app/actions/chess";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ChessGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { user } = useAuth();
  
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetchGame = async () => {
    const data = await getChessGame(gameId);
    if (data) setGame(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGame();

    // Subscribe to realtime updates for this game
    const channel = supabase.channel(`chess_${gameId}`);
    channel.on('broadcast', { event: 'move' }, () => {
      fetchGame();
    }).subscribe();

    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, [gameId]);

  const onDrop = async (sourceSquare: string, targetSquare: string, piece: string) => {
    if (!game || !game.isMyTurn) return false;

    // Optimistic update isn't strictly necessary but good for UX.
    // Instead we just wait for server action since it's turn based over days
    const promotion = piece[1].toLowerCase() ?? "q";
    
    const res = await makeChessMove(gameId, { from: sourceSquare, to: targetSquare, promotion });
    if (res.success) {
      // Broadcast to other player using the already subscribed channel
      if (channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'move' });
      }
      fetchGame();
      return true;
    }
    
    return false;
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!game) {
    return <div className="p-8 text-center text-muted-foreground">Game not found.</div>;
  }

  const isWaiting = !game.blackPlayerId;

  return (
    <div className="flex-1 flex flex-col items-center py-6 px-4 max-w-2xl mx-auto w-full">
      <div className="w-full flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.push('/chess')} className="pl-0">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="font-bold text-lg font-serif">
          {game.status === 'active' ? (isWaiting ? "Waiting for Opponent..." : game.isMyTurn ? "Your Turn" : "Opponent's Turn") : 
           game.status === 'white_won' ? "White Won!" : 
           game.status === 'black_won' ? "Black Won!" : "Draw"}
        </div>
        <Button variant="outline" size="icon" onClick={fetchGame}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-full max-w-md aspect-square rounded-lg shadow-2xl overflow-hidden ring-4 ring-border/50">
        <Chessboard 
          {...{ position: game.fen } as any}
          onPieceDrop={onDrop}
          boardOrientation={game.myColor === 'b' ? 'black' : 'white'}
          arePiecesDraggable={game.status === 'active' && game.isMyTurn}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        />
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground max-w-sm">
        {game.status === "active" && !game.isMyTurn && "You can close this app and return later. Your game is saved automatically!"}
        {game.status === "active" && game.isMyTurn && "It's your move! Drag a piece to move."}
      </div>
    </div>
  );
}
