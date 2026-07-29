"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Play, User as UserIcon, ShieldAlert, Swords, Clock, ChevronRight } from "lucide-react";
import { getAvailableChessGames, getMyActiveChessGames, createNewChessGame, joinChessGame } from "@/app/actions/chess";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function ChessLobbyPage() {
  const router = useRouter();
  const { user } = useAuth();
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

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed bg-gray-50 dark:bg-[#0a0a0a] min-h-[calc(100vh-64px)] w-full">
      <div className="w-full max-w-5xl mx-auto p-6 lg:p-10 flex flex-col min-h-full">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl mb-12 p-10 lg:p-16 border border-white/10"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <Swords className="w-48 h-48 text-white rotate-12" />
          </div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
          
          <div className="relative z-10 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Multiplayer & AI
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold font-serif mb-4 text-white drop-shadow-sm">
                Master the Board.
              </h1>
              <p className="text-slate-300 text-lg mb-8 max-w-xl">
                Challenge fellow believers to asynchronous chess matches, or hone your skills offline against the AI Grandmaster.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button 
                  onClick={handleCreate} 
                  disabled={loading || fetching}
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl shadow-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold hover:scale-[1.02] transition-transform border border-emerald-400/50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />} 
                  New Multiplayer Game
                </Button>
                <Button 
                  onClick={() => router.push('/chess/bot')} 
                  disabled={loading || fetching}
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl shadow-lg bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm font-bold hover:scale-[1.02] transition-transform"
                >
                  <ShieldAlert className="w-5 h-5 mr-2 text-amber-400" /> 
                  Practice vs AI Bot
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {fetching ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
            <p className="mt-4 text-slate-500 font-medium">Synchronizing boards...</p>
          </div>
        ) : (
          <motion.div 
            variants={container} 
            initial="hidden" 
            animate="show" 
            className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          >
            {/* Active Games */}
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Play className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  My Active Games
                </h2>
                <span className="ml-auto bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                  {myGames.length}
                </span>
              </div>
              
              {myGames.length === 0 ? (
                <motion.div variants={item} className="p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                  <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No active games right now.</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Start a new game to challenge someone!</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence>
                    {myGames.map(g => (
                      <motion.div 
                        key={g.id} 
                        variants={item}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className={`group cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 border ${
                          g.isMyTurn 
                            ? 'border-emerald-500/50 dark:border-emerald-500/40 ring-1 ring-emerald-500/20' 
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                        onClick={() => router.push(`/chess/${g.id}`)}
                      >
                        <div className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${
                              g.myColor === 'w' 
                                ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                                : 'bg-slate-800 text-slate-200 border border-slate-700'
                            }`}>
                              {g.myColor === 'w' ? '♔' : '♚'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                vs {g.opponentName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`flex w-2 h-2 rounded-full ${g.isMyTurn ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                <p className={`text-xs font-semibold uppercase tracking-wider ${g.isMyTurn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                  {g.isMyTurn ? "Your Turn" : "Waiting for Opponent"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Available Players */}
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  Open Challenges
                </h2>
                <span className="ml-auto bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                  {availableGames.length}
                </span>
              </div>
              
              {availableGames.length === 0 ? (
                <motion.div variants={item} className="p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <UserIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No open challenges.</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Be the first to create one!</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence>
                    {availableGames.map(g => (
                      <motion.div 
                        key={g.id} 
                        variants={item}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            ♔
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{g.playerName}</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Playing as White</p>
                          </div>
                        </div>
                        <Button 
                          className="rounded-xl px-6 font-bold shadow-md hover:scale-105 transition-transform" 
                          onClick={() => handleJoin(g.id)} 
                          disabled={loading}
                        >
                          Accept
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
