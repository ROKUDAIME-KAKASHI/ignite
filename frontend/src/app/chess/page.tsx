"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createOrJoinChessGame } from "@/app/actions/chess";

export default function ChessLobbyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    setLoading(true);
    const res = await createOrJoinChessGame();
    if (res.success && res.gameId) {
      router.push(`/chess/${res.gameId}`);
    } else {
      setLoading(false);
      alert(res.error || "Failed to join game");
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center bg-background min-h-[calc(100vh-64px)]">
      <div className="text-center mb-10 max-w-md mx-auto">
        <h1 className="text-5xl font-extrabold font-serif mb-4 bg-gradient-to-br from-gray-900 to-gray-500 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-500">
          Chess
        </h1>
        <p className="text-muted-foreground text-lg">
          Play classic chess against other users. Games are saved automatically, so you can make a move, leave, and come back days later!
        </p>
      </div>

      <Button 
        onClick={handlePlay} 
        disabled={loading}
        className="w-full max-w-sm h-14 text-lg rounded-2xl shadow-xl gradient-gold font-bold hover:scale-[1.02] transition-transform"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Play Now"}
      </Button>
    </div>
  );
}
