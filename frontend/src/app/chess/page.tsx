"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Play, User as UserIcon } from "lucide-react";
import { getAvailableChessGames, getMyActiveChessGames, createNewChessGame, joinChessGame } from "@/app/actions/chess";

export default function ChessLobbyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  const [myGames, setMyGames] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      const [avail, active] = await Promise.all([
        getAvailableChessGames(),
        getMyActiveChessGames()
      ]);
      setAvailableGames(avail);
      setMyGames(active);
      setFetching(false);
    }
    load();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    const res = await createNewChessGame();
    if (res.success && res.gameId) {
      router.push(`/chess/${res.gameId}`);
    } else {
      setLoading(false);
      alert(res.error || "Failed to create game");
    }
  };

  const handleJoin = async (gameId: string) => {
    setLoading(true);
    const res = await joinChessGame(gameId);
    if (res.success && res.gameId) {
      router.push(`/chess/${res.gameId}`);
    } else {
      setLoading(false);
      alert(res.error || "Failed to join game");
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col items-center bg-background min-h-[calc(100vh-64px)] max-w-3xl mx-auto w-full">
      <div className="text-center mb-10 mt-6 w-full">
        <h1 className="text-5xl font-extrabold font-serif mb-4 bg-gradient-to-br from-gray-900 to-gray-500 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-500">
          Chess
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Play classic chess against other users. Games are saved automatically, so you can make a move, leave, and come back days later!
        </p>
      </div>

      <div className="w-full mb-10 flex justify-center">
        <Button 
          onClick={handleCreate} 
          disabled={loading || fetching}
          className="w-full max-w-sm h-14 text-lg rounded-2xl shadow-xl gradient-gold font-bold hover:scale-[1.02] transition-transform"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />} 
          Create New Game
        </Button>
      </div>

      {fetching ? (
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mt-10" />
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Active Games */}
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-amber-600" /> My Active Games
            </h2>
            {myGames.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-center text-muted-foreground text-sm">
                You have no active games.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myGames.map(g => (
                  <div key={g.id} className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">vs {g.opponentName}</p>
                      <p className={`text-xs mt-1 font-medium ${g.isMyTurn ? 'text-amber-600' : 'text-gray-500'}`}>
                        {g.isMyTurn ? "Your Turn" : "Opponent's Turn"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/chess/${g.id}`)}>
                      Resume
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Games */}
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" /> Available Players
            </h2>
            {availableGames.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-center text-muted-foreground text-sm">
                No players are currently waiting.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {availableGames.map(g => (
                  <div key={g.id} className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{g.playerName}</p>
                      <p className="text-xs text-gray-500 mt-1">Waiting for opponent</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => handleJoin(g.id)} disabled={loading}>
                      Play
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
