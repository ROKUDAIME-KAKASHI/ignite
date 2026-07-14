"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trophy, Users, Play, Plus, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { TRIVIA_QUESTIONS } from "@/lib/trivia";
import { awardXP } from "@/app/actions/gamification";

type Room = { id: string; name: string; players: number; max: number; host: boolean };

export default function LiveTriviaPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  
  const [mode, setMode] = useState<"lobby" | "waiting" | "playing" | "results">("lobby");
  const [lobbyChannel, setLobbyChannel] = useState<any>(null);
  const [gameChannel, setGameChannel] = useState<any>(null);
  const [liveRooms, setLiveRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  
  // Game State
  const [players, setPlayers] = useState<{id: string, name: string, score: number}[]>([]);
  const [roomQuestionIndices, setRoomQuestionIndices] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myScore, setMyScore] = useState(0);
  
  const question = roomQuestionIndices.length > 0 && roomQuestionIndices[currentRound] !== undefined
    ? TRIVIA_QUESTIONS[roomQuestionIndices[currentRound]]
    : TRIVIA_QUESTIONS[0];

  useEffect(() => {
    if (user && mode === "lobby") {
      const channel = supabase.channel('trivia_lobby', {
        config: { presence: { key: user.id } },
      });

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const rooms: Room[] = [];
        for (const userId in state) {
          const p = (state[userId] as any)[0];
          if (p && p.isHost) {
            rooms.push({ id: userId, name: p.roomName, players: p.players || 1, max: 10, host: userId === user.id });
          }
        }
        setLiveRooms(rooms);
      }).subscribe();

      setLobbyChannel(channel);
      return () => { supabase.removeChannel(channel); };
    }
  }, [user, mode]);

  // Timer logic for live trivia
  useEffect(() => {
    if (mode === "playing" && questionStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
        const remaining = Math.max(0, 15 - elapsed);
        setTimeLeft(remaining);
        
        if (remaining === 0 && activeRoom?.host) {
          // Host automatically advances or ends if time runs out
          if (currentRound >= 4) {
             gameChannel?.send({ type: 'broadcast', event: 'end_game' });
             setMode("results");
             if (user) {
               awardXP(myScore > 0 ? 50 : 10, "Participated in Live Trivia").then(res => {
                 if (res.success && res.xp) setUser({...user, xp: res.xp, level: res.level});
               });
             }
          } else {
             const nextRound = currentRound + 1;
             gameChannel?.send({ type: 'broadcast', event: 'next_question', payload: { round: nextRound } });
             setCurrentRound(nextRound);
             setQuestionStartTime(Date.now());
             setHasAnswered(false);
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode, questionStartTime, currentRound, activeRoom, gameChannel, myScore, user]);

  const handleCreateRoom = () => {
    if (!user) return;
    const roomData = { id: user.id, name: `${user.firstName}'s Trivia Night`, players: 1, max: 10, host: true };
    setActiveRoom(roomData);
    setPlayers([{ id: user.id, name: user.firstName || "Host", score: 0 }]);
    
    if (lobbyChannel) lobbyChannel.track({ isHost: true, roomName: roomData.name, players: 1 });
    
    const gChannel = supabase.channel(`trivia_room_${user.id}`);
    setupGameChannelHost(gChannel);
    setGameChannel(gChannel);
    setMode("waiting");
  };

  const setupGameChannelHost = (channel: any) => {
    channel.on('broadcast', { event: 'join' }, ({ payload }: any) => {
      setPlayers(prev => {
        const exists = prev.find(p => p.id === payload.id);
        if (exists) return prev;
        const newPlayers = [...prev, { id: payload.id, name: payload.name, score: 0 }];
        channel.send({ type: 'broadcast', event: 'sync_players', payload: { players: newPlayers } });
        return newPlayers;
      });
    }).on('broadcast', { event: 'answer' }, ({ payload }: any) => {
      setPlayers(prev => prev.map(p => p.id === payload.id ? { ...p, score: p.score + payload.points } : p));
      channel.send({ type: 'broadcast', event: 'sync_players', payload: { players: players } });
    }).subscribe();
  };

  const handleJoinRoom = (room: Room) => {
    setActiveRoom(room);
    
    const gChannel = supabase.channel(`trivia_room_${room.id}`);
    gChannel.on('broadcast', { event: 'sync_players' }, ({ payload }: any) => {
      setPlayers(payload.players);
    }).on('broadcast', { event: 'start_game' }, ({ payload }: any) => {
      setMode("playing");
      setQuestionStartTime(Date.now());
      setRoomQuestionIndices(payload.indices || []);
      setCurrentRound(0);
      setHasAnswered(false);
    }).on('broadcast', { event: 'next_question' }, ({ payload }: any) => {
      setCurrentRound(payload.round);
      setQuestionStartTime(Date.now());
      setHasAnswered(false);
    }).on('broadcast', { event: 'end_game' }, () => {
      setMode("results");
      if (user) {
        awardXP(myScore > 0 ? 50 : 10, "Participated in Live Trivia").then(res => {
          if (res.success && res.xp) setUser({...user, xp: res.xp, level: res.level});
        });
      }
    }).subscribe(status => {
      if (status === 'SUBSCRIBED') {
        gChannel.send({ type: 'broadcast', event: 'join', payload: { id: user?.id, name: user?.firstName } });
      }
    });
    setGameChannel(gChannel);
    setMode("waiting");
  };

  const startGame = () => {
    if (!gameChannel) return;
    const indices: number[] = [];
    while (indices.length < 5) {
      const idx = Math.floor(Math.random() * TRIVIA_QUESTIONS.length);
      if (!indices.includes(idx)) {
        indices.push(idx);
      }
    }
    gameChannel.send({ type: 'broadcast', event: 'start_game', payload: { indices } });
    setRoomQuestionIndices(indices);
    setCurrentRound(0);
    setMode("playing");
    setQuestionStartTime(Date.now());
    setHasAnswered(false);
  };

  const answerQuestion = (opt: string) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    
    let points = 0;
    if (opt === question.a) {
      // faster = more points. max 100, min 50.
      points = Math.max(50, Math.floor((timeLeft / 15) * 100));
      setMyScore(prev => prev + points);
    }
    
    if (gameChannel && user) {
      gameChannel.send({ type: 'broadcast', event: 'answer', payload: { id: user.id, points } });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfbf7]">
      <div className="px-4 pt-6 pb-4 border-b border-border flex items-center justify-between bg-white shadow-sm z-10">
        <Button onClick={() => mode === "lobby" ? router.push('/quizzes') : setMode("lobby")} variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold font-serif text-foreground">Live Trivia Nights</h1>
        <div className="w-10 h-10 rounded-full gradient-royal text-white flex items-center justify-center shadow-md">✨</div>
      </div>

      {mode === "lobby" && (
        <div className="flex-1 p-6 flex flex-col max-w-md mx-auto w-full">
          <div className="text-center mb-8 pt-4">
            <div className="w-20 h-20 rounded-3xl gradient-royal flex items-center justify-center mx-auto shadow-xl mb-4 text-4xl">👥</div>
            <h2 className="text-3xl font-extrabold font-serif mb-2">Join a Trivia Night</h2>
            <p className="text-muted-foreground text-sm">Compete in real-time with your parish youth.</p>
          </div>

          <Button onClick={handleCreateRoom} className="w-full h-14 rounded-xl gradient-gold text-white font-bold shadow-md halo-glow mb-8 text-lg">
            <Plus className="w-5 h-5 mr-2" /> Host a Trivia Night
          </Button>

          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Search className="w-4 h-4"/> Active Rooms</h3>
          {liveRooms.length === 0 ? (
            <div className="bg-muted/50 rounded-2xl p-8 text-center border border-dashed">
              <p className="text-muted-foreground text-sm">No live rooms right now.<br/>Why not host one?</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveRooms.map(room => (
                <div key={room.id} className="bg-card rounded-2xl p-4 border border-border/60 flex items-center justify-between shadow-sm card-holy-hover">
                  <div>
                    <p className="font-bold font-serif text-lg">{room.name}</p>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{room.players}/{room.max} Players</p>
                  </div>
                  <Button onClick={() => handleJoinRoom(room)} className="rounded-xl font-bold gradient-royal">Join</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "waiting" && (
        <div className="flex-1 p-6 flex flex-col justify-center items-center text-center max-w-md mx-auto w-full">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-24 h-24 rounded-full gradient-life flex items-center justify-center text-4xl shadow-2xl mb-6">
            ⏳
          </motion.div>
          <h2 className="text-2xl font-bold font-serif mb-2">{activeRoom?.name}</h2>
          <p className="text-muted-foreground mb-8">Waiting for host to start...</p>
          
          <div className="w-full bg-card rounded-2xl border p-4 shadow-sm text-left mb-8">
            <h3 className="font-bold mb-3 flex items-center justify-between">
              <span>Players Joined</span>
              <span className="text-primary">{players.length}</span>
            </h3>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
              <AnimatePresence>
                {players.map((p, i) => (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={i} className="flex items-center gap-3 bg-muted p-2 rounded-xl">
                    <div className="w-8 h-8 rounded-full gradient-gold text-white flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
                    <p className="font-semibold text-sm">{p.name} {p.id === user?.id && "(You)"}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {activeRoom?.host && (
            <Button onClick={startGame} className="w-full h-14 rounded-xl gradient-gold text-white font-bold shadow-md halo-glow text-lg">
              <Play className="w-5 h-5 mr-2" /> Start Trivia!
            </Button>
          )}
        </div>
      )}

      {mode === "playing" && (
        <div className="flex-1 p-6 flex flex-col max-w-md mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-muted px-4 py-1.5 rounded-full text-sm font-bold border">
              Question {currentRound + 1} / 5
            </div>
            <div className={cn("text-xl font-black font-serif", timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-foreground")}>
              {timeLeft}s
            </div>
          </div>

          <motion.div 
            key={currentRound}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-3xl p-6 shadow-xl card-holy border border-primary/20 mb-8 min-h-[150px] flex items-center justify-center"
          >
            <h2 className="text-xl font-bold font-serif text-center leading-snug">{question.q}</h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-3">
            {question.options.map((opt, i) => {
              const colors = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
              return (
                <Button 
                  key={opt}
                  onClick={() => answerQuestion(opt)}
                  disabled={hasAnswered}
                  className={cn(
                    "h-16 rounded-2xl justify-start px-6 font-bold text-left text-white shadow-md text-base transition-transform",
                    colors[i],
                    hasAnswered && opt !== question.a ? "opacity-50" : "",
                    hasAnswered && opt === question.a ? "ring-4 ring-white" : "",
                    !hasAnswered ? "hover:scale-[1.02]" : ""
                  )}
                >
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4">{["A","B","C","D"][i]}</span>
                  {opt}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {mode === "results" && (
        <div className="flex-1 p-6 flex flex-col items-center max-w-md mx-auto w-full pt-10">
          <div className="w-24 h-24 rounded-full gradient-gold flex items-center justify-center text-5xl shadow-2xl halo-glow mb-6 text-white">🏆</div>
          <h2 className="text-3xl font-extrabold font-serif mb-2 text-center">Trivia Complete!</h2>
          <p className="text-amber-600 font-bold mb-8">+50 Grace Points</p>

          <div className="w-full bg-card rounded-3xl border p-4 shadow-sm mb-8">
            <h3 className="text-center font-bold font-serif text-lg mb-4 text-muted-foreground uppercase tracking-wider">Final Standings</h3>
            <div className="space-y-2">
              {[...players].sort((a,b) => b.score - a.score).map((p, i) => (
                <div key={p.id} className={cn("flex items-center justify-between p-3 rounded-xl border", i === 0 ? "bg-amber-50 border-amber-200" : "bg-muted border-transparent")}>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-muted-foreground">#{i+1}</span>
                    <span className="font-bold text-sm">{p.name} {p.id === user?.id && "(You)"}</span>
                  </div>
                  <span className="font-bold text-primary">{p.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => setMode("lobby")} className="w-full h-14 rounded-xl gradient-life text-white font-bold shadow-md">
            Back to Lobby
          </Button>
        </div>
      )}
    </div>
  );
}
