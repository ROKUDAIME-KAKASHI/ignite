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

  const onDrop = (args: any) => {
    const { sourceSquare, targetSquare } = args;
    if (!game || !game.isMyTurn) {
      alert("Not your turn or game not found");
      return false;
    }

    const promotion = "q";
    
    // Optimistic return so the piece doesn't snap back
    // Perform server action in background
    makeChessMove(gameId, { from: sourceSquare, to: targetSquare, promotion })
      .then(res => {
        if (res.success) {
          if (channelRef.current) {
            channelRef.current.send({ type: 'broadcast', event: 'move' });
          }
          fetchGame();
        } else {
          alert("Move failed on server: " + res.error);
          fetchGame(); // revert optimistic update
        }
      });
      
    return true;
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

      <div className="w-full max-w-md aspect-square rounded-lg shadow-2xl overflow-hidden ring-4 ring-border/50 relative">
        <Chessboard 
          options={{
            position: game.fen,
            onPieceDrop: onDrop,
            boardOrientation: game.myColor === 'b' ? 'black' : 'white',
            allowDragging: game.status === 'active' && game.isMyTurn,
            darkSquareStyle: { backgroundColor: '#769656' },
            lightSquareStyle: { backgroundColor: '#eeeed2' }
          }}
        />
        
        {game.status !== 'active' && (
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 opacity-0 animate-in fade-in duration-500">
            <div className="bg-background p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full border border-border scale-95 animate-in zoom-in-95 duration-500 delay-150 fill-mode-forwards">
              <h2 className="text-3xl font-extrabold font-serif mb-2">
                {game.status === 'draw' ? "It's a Draw" : "Checkmate!"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {game.status === 'white_won' ? "White takes the victory." : 
                 game.status === 'black_won' ? "Black takes the victory." : "The game ended in a stalemate."}
              </p>
              <Button className="w-full" onClick={() => router.push('/chess')}>
                Return to Lobby
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground max-w-sm">
        {game.status === "active" && !game.isMyTurn && "You can close this app and return later. Your game is saved automatically!"}
        {game.status === "active" && game.isMyTurn && "It's your move! Drag a piece to move."}
      </div>
    </div>
  );
}
