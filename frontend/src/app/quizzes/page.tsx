"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trophy, ChevronRight, RotateCcw, CheckCircle2, XCircle, Loader2, Users, Play, Plus } from "lucide-react";
import { awardXP } from "@/app/actions/gamification";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

/* ─── Quiz data ──────────────────────────────────────────────────────────── */
interface Question {
  id: string | number;
  type: "mcq" | "truefalse";
  question: string;
  options?: string[];
  answer: string | boolean;
  explanation: string;
  verse?: string;
}

interface QuizSet {
  id: string | number;
  label: string;
  emoji: string;
  questions: Question[];
  xp: number;
  color: string;
  badge: string;
  desc: string;
  isCompleted?: boolean;
}

import { getQuizzes, recordQuizAttempt } from "@/app/actions/quizzes";
import { useEffect } from "react";
import Link from "next/link";

type Phase = "select" | "quiz" | "result" | "lobby";

interface LiveRoom {
  id: string;
  name: string;
  type: string;
  players: number;
  max: number;
  host: boolean;
  emoji: string;
  xp: number;
  hostId: string;
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function QuizzesPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<"solo" | "multiplayer">("solo");
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [activeSet, setActiveSet] = useState<QuizSet | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(string | boolean | null)[]>([]);
  const [selected, setSelected] = useState<string | boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [submittingXP, setSubmittingXP] = useState(false);
  const [isGroupGame, setIsGroupGame] = useState(false);
  const [groupScores, setGroupScores] = useState<{id: string, name: string, score: number}[]>([]);
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
  const [lobbyChannel, setLobbyChannel] = useState<any>(null);
  const [gameChannel, setGameChannel] = useState<any>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<{id: string, name: string}[]>([]);

  const { user, setUser } = useAuth();
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  
  useEffect(() => {
    getQuizzes().then((data: any) => {
      setQuizSets(data);
      if (data.length > 0) setActiveSet(data[0]);
    });

    if (user) {
      const channel = supabase.channel('arcade_lobby', {
        config: {
          presence: { key: user.id },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const rooms: LiveRoom[] = [];
          
          for (const userId in state) {
            const presences = state[userId] as any[];
            const p = presences[0];
            if (p && p.isHost) {
              rooms.push({
                id: userId,
                name: p.roomName,
                type: p.type || "Quiz",
                players: p.players || 1,
                max: p.max || 10,
                host: userId === user.id,
                emoji: p.emoji || "🎓",
                xp: p.xp || 20,
                hostId: userId
              });
            }
          }
          setLiveRooms(rooms);
        })
        .subscribe();

      setLobbyChannel(channel);

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (!quizSets.length || !activeSet) return null;

  const questions = activeSet.questions;
  const q = questions[currentQ];
  const totalQ = questions.length;

  /* Start quiz */
  const startQuiz = (set: QuizSet, isGroup: boolean = false) => {
    setActiveSet(set);
    setIsGroupGame(isGroup);
    setCurrentQ(0);
    setAnswers(new Array(set.questions.length).fill(null));
    setSelected(null);
    setRevealed(false);
    setScore(0);
    
    if (isGroup) {
      if (gameChannel && activeRoom?.host) {
        // Broadcast start game to all players in the room
        gameChannel.send({
          type: 'broadcast',
          event: 'start_game',
          payload: { setId: set.id }
        });
      }

      setGroupScores(lobbyPlayers.map(p => ({
        id: p.id,
        name: p.name,
        score: 0
      })));
    }
    setPhase("quiz");
  };

  /* Join a game room */
  const joinGameRoom = (room: LiveRoom) => {
    setActiveRoom(room);
    setPhase("lobby");
    setLobbyPlayers([]);

    if (user) {
      const channel = supabase.channel(`room_${room.id}`, {
        config: { presence: { key: user.id } }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const players = [];
          for (const id in state) {
            const p = (state[id] as any)[0];
            if (p) players.push({ id, name: p.name });
          }
          setLobbyPlayers(players);
          
          // If we are host, update the lobby channel with the new player count
          if (room.host && lobbyChannel) {
            lobbyChannel.track({
              isHost: true,
              roomName: room.name,
              type: room.type,
              players: players.length,
              max: room.max,
              emoji: room.emoji,
              xp: room.xp
            });
          }
        })
        .on('broadcast', { event: 'start_game' }, ({ payload }) => {
          if (!room.host) { // Host already called startQuiz
            const set = quizSets.find(s => s.id === payload.setId);
            if (set) {
              setActiveSet(set);
              setIsGroupGame(true);
              setCurrentQ(0);
              setAnswers(new Array(set.questions.length).fill(null));
              setSelected(null);
              setRevealed(false);
              setScore(0);
              setPhase("quiz");
            }
          }
        })
        .on('broadcast', { event: 'score_update' }, ({ payload }) => {
          setGroupScores(prev => {
            const copy = [...prev];
            const idx = copy.findIndex(p => p.id === payload.userId);
            if (idx >= 0) copy[idx].score = payload.score;
            return copy;
          });
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ name: user.firstName });
          }
        });

      setGameChannel(channel);
    }
  };

  /* Submit answer */
  const submitAnswer = () => {
    if (selected === null) return;
    const correct = selected === q.answer;
    
    let newScore = score;
    if (correct) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (isGroupGame && gameChannel && user) {
      // Broadcast our score locally and to others
      setGroupScores(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(p => p.id === user.id);
        if (idx >= 0) copy[idx].score = newScore;
        return copy;
      });

      gameChannel.send({
        type: 'broadcast',
        event: 'score_update',
        payload: { userId: user.id, score: newScore }
      });
    }

    setAnswers((prev) => { const a = [...prev]; a[currentQ] = selected; return a; });
    setRevealed(true);
  };

  /* Next question */
  const nextQuestion = async () => {
    if (currentQ + 1 >= totalQ) {
      const earnedXP = Math.round((score / totalQ) * activeSet.xp);
      if (user) {
        setSubmittingXP(true);
        if (earnedXP > 0) {
          const res = await awardXP(earnedXP, `Completed Quiz: ${activeSet.label}`);
          if (res.success && res.xp) {
            setUser({ ...user, xp: res.xp, level: res.level });
          }
        }
        await recordQuizAttempt(activeSet.id, score);
        setSubmittingXP(false);
      }
      setPhase("result");
    } else {
      setCurrentQ((n) => n + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const progress = ((currentQ + (revealed ? 1 : 0)) / totalQ) * 100;

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-spirit">
        <div className="absolute inset-0 bg-[url('/header-image.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none flex flex-col items-center">
          <img src="/header-image.png" className="h-16 sm:h-24 w-auto rounded-2xl shadow-2xl border-[3px] border-white/20 opacity-95 object-contain rotate-3 drop-shadow-xl mb-2 sm:mb-3" alt="Church emblem" />
          <div className="flex flex-col items-center text-center opacity-90 rotate-1">
            <span className="text-[6px] sm:text-[8px] font-extrabold text-white uppercase tracking-widest font-serif leading-tight text-shadow-sm">St. Gregorios Jacobite<br/>Syrian Orthodox Church</span>
            <span className="text-[5px] sm:text-[6px] text-white/80 uppercase tracking-widest mt-0.5 font-semibold text-shadow-sm">Hosa Road - Bangalore</span>
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">🕹️</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Games Arcade</h1>
              <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Play, Learn & Earn XP</p>
            </div>
          </div>
          <p className="text-orange-100/80 text-sm mt-2 italic font-serif">
            "Rejoice in the Lord always." — Philippians 4:4
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8">
        <AnimatePresence mode="wait">

          {/* ── SELECT ── */}
          {phase === "select" && (
            <motion.div key="select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
              
              <div className="flex gap-1 bg-muted rounded-xl p-1 mb-2">
                <button
                  onClick={() => setMode("solo")}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-lg transition duration-200",
                    mode === "solo" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Solo Quizzes
                </button>
                <button
                  onClick={() => setMode("multiplayer")}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-1.5",
                    mode === "multiplayer" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Users className="w-4 h-4" /> Live Rooms
                </button>
              </div>

              {mode === "solo" ? (
                <>
                  <p className="text-xs text-muted-foreground italic font-serif mb-4">Choose from a variety of single-player games to earn Grace Points.</p>
                  
                  {/* Additional Mock Solo Games */}
                  <div className="bg-card rounded-2xl border border-border/60 card-holy card-holy-hover overflow-hidden mb-4">
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-life flex items-center justify-center text-3xl shadow-lg shrink-0">🎲</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-foreground font-serif text-base">Bible Ludo</h3>
                          <Badge className="text-[10px] border-0 px-2 gradient-life text-white">Up to 40 XP</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Roll the dice and race your tokens to the heavenly kingdom. Answer bible trivia to get out of base!</p>
                        <Link href="/ludo" className="inline-flex items-center justify-center w-full h-9 rounded-xl font-bold text-sm text-white gradient-life shadow-md hover:opacity-90">
                          Play Ludo <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border/60 card-holy card-holy-hover overflow-hidden mb-4">
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-dawn flex items-center justify-center text-3xl shadow-lg shrink-0">♟️</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-foreground font-serif text-base">Classic Chess</h3>
                          <Badge className="text-[10px] border-0 px-2 gradient-dawn text-white">Multiplayer</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Play classic chess against other users. Games are saved automatically for turn-based play!</p>
                        <Link href="/chess" className="inline-flex items-center justify-center w-full h-9 rounded-xl font-bold text-sm text-white gradient-dawn shadow-md hover:opacity-90">
                          Play Chess <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border/60 card-holy card-holy-hover overflow-hidden mb-4">
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-royal flex items-center justify-center text-3xl shadow-lg shrink-0">🧩</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-foreground font-serif text-base">Scripture Wordle</h3>
                          <Badge className="text-[10px] border-0 px-2 gradient-royal text-white">+10 XP</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Guess the 5-letter biblical word in 6 tries. A new word is available every day.</p>
                        <Link href="/wordle" className="inline-flex items-center justify-center w-full h-9 rounded-xl font-bold text-sm text-white gradient-royal shadow-md hover:opacity-90">
                          Play Wordle <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border/60 card-holy card-holy-hover overflow-hidden mb-4">
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-spirit flex items-center justify-center text-3xl shadow-lg shrink-0">🌊</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-foreground font-serif text-base">Noah's Ark</h3>
                          <Badge className="text-[10px] border-0 px-2 gradient-spirit text-white">+15 XP</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Guess the biblical word before the floodwaters rise completely to save the ark.</p>
                        <Link href="/noahs-ark" className="inline-flex items-center justify-center w-full h-9 rounded-xl font-bold text-sm text-white gradient-spirit shadow-md hover:opacity-90">
                          Play Noah's Ark <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border/60 card-holy card-holy-hover overflow-hidden mb-4">
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center text-3xl shadow-lg shrink-0">🧠</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-foreground font-serif text-base">Memory Match</h3>
                          <Badge className="text-[10px] border-0 px-2 gradient-gold text-white">Up to 35 XP</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Flip the cards and match the biblical figures with their famous stories.</p>
                        <Link href="/memory-match" className="inline-flex items-center justify-center w-full h-9 rounded-xl font-bold text-sm text-white gradient-gold shadow-md hover:opacity-90">
                          Play Memory Match <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border/60 card-holy card-holy-hover overflow-hidden mb-4">
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-dawn flex items-center justify-center text-3xl shadow-lg shrink-0">🦁</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-foreground font-serif text-base">The Lion's Den</h3>
                          <Badge className="text-[10px] border-0 px-2 gradient-dawn text-white">+30 XP</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Answer the riddles correctly to escape the room before the lions wake up.</p>
                        <Link href="/lions-den" className="inline-flex items-center justify-center w-full h-9 rounded-xl font-bold text-sm text-white gradient-dawn shadow-md hover:opacity-90">
                          Escape the Den <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Quizzes list */}
                  <h3 className="font-bold font-serif text-foreground mt-6 mb-2">Knowledge Quizzes</h3>
                  {quizSets.map((set) => (
                    <div key={set.id} className="bg-card rounded-2xl border border-border/60 card-holy card-holy-hover overflow-hidden">
                      <div className="p-5 flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl ${set.color} flex items-center justify-center text-3xl shadow-lg shrink-0`}>
                          {set.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-foreground font-serif text-base">{set.label}</h3>
                            <Badge className={cn("text-[10px] border-0 px-2", set.badge)}>+{set.xp} XP</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{set.desc}</p>
                          <Button
                            onClick={() => startQuiz(set)}
                            disabled={set.isCompleted}
                            className={`w-full h-9 rounded-xl font-bold text-sm text-white ${set.color} shadow-md hover:opacity-90 disabled:opacity-50`}
                          >
                            {set.isCompleted ? (
                              <>Completed <CheckCircle2 className="w-4 h-4 ml-1" /></>
                            ) : (
                              <>Begin Quiz <ChevronRight className="w-4 h-4 ml-1" /></>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="space-y-4">
                  {/* Dedicated Live Trivia Nights */}
                  <div className="bg-card rounded-2xl border border-border/60 card-holy card-holy-hover overflow-hidden mb-6 shadow-md">
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-royal flex items-center justify-center text-3xl shadow-lg shrink-0">✨</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-foreground font-serif text-lg">Kahoot-style Live Trivia</h3>
                          <Badge className="text-[10px] border-0 px-2 gradient-royal text-white">New!</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Host or join a fast-paced trivia night with your parish. Answer fast for more points!</p>
                        <Link href="/trivia" className="inline-flex items-center justify-center w-full h-10 rounded-xl font-bold text-sm text-white gradient-royal shadow-md hover:opacity-90">
                          Play Live Trivia <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold font-serif text-foreground mt-4 mb-2">Other Multiplayer Rooms</h3>
                  {!user ? (
                    <div className="text-center p-8 bg-card rounded-2xl border border-border/60 card-holy">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="font-bold text-foreground font-serif text-lg mb-2">Sign in Required</p>
                      <p className="text-sm text-muted-foreground">You must have an account and be signed in to play live multiplayer games with the community.</p>
                    </div>
                  ) : (
                    <>
                      <Button 
                        onClick={async () => {
                          const roomData = { id: user.id, name: `${user.firstName}'s Room`, type: "Quiz", players: 1, max: 10, host: true, emoji: "🎓", xp: 20, hostId: user.id };
                          joinGameRoom(roomData);
                        }} 
                        className="w-full h-12 rounded-xl gradient-gold text-white font-bold shadow-md halo-glow flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" /> Create a Game Room
                      </Button>

                      <div className="space-y-3 mt-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Rooms</p>
                        {liveRooms.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">No live rooms right now. Create one!</p>
                        )}
                        {liveRooms.map(room => (
                          <div key={room.id} className="bg-card rounded-2xl border border-border/60 p-4 card-holy flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{room.emoji}</div>
                              <div>
                                <p className="font-bold font-serif text-foreground leading-tight">{room.name}</p>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Users className="w-3 h-3" /> {room.players} / {room.max} players <span className="mx-1">•</span> {room.type} <span className="mx-1">•</span> <span className="text-amber-600 font-bold">+{room.xp} XP</span>
                                </p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => {
                                if (room.type === "Quiz") {
                                  joinGameRoom({ ...room, host: false });
                                } else {
                                  alert(`Joining ${room.type} rooms is coming soon!`);
                                }
                              }} 
                              disabled={room.players >= room.max}
                              variant={room.players >= room.max ? "outline" : "default"}
                              className={cn("rounded-xl h-9 ml-2", room.players < room.max && "gradient-spirit text-white font-bold")}
                            >
                              {room.players >= room.max ? "Full" : "Join"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── LOBBY ── */}
          {phase === "lobby" && activeRoom && (
            <motion.div key="lobby" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
              <div className="text-center p-8 bg-card rounded-2xl border border-border/60 card-holy relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 gradient-spirit"></div>
                <h2 className="text-2xl font-extrabold font-serif text-foreground mb-1 mt-2">{activeRoom.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mb-6">
                  <Users className="w-4 h-4" /> {lobbyPlayers.length} / {activeRoom.max} players waiting
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {Array.from({ length: activeRoom.max }).map((_, i) => {
                    const p = lobbyPlayers[i];
                    return (
                      <div key={i} className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-xl transition relative group",
                        p ? "bg-primary/10 border-2 border-primary" : "bg-muted border-2 border-dashed border-border"
                      )}>
                        {p ? ["👨", "👩", "👦", "👧", "👨‍🦱", "👩‍🦱", "🧔", "👱‍♀️"][i % 8] : ""}
                        {p && (
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            {p.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {activeRoom.host ? (
                  <Button 
                    onClick={() => startQuiz(quizSets[Math.floor(Math.random() * quizSets.length)], true)}
                    className="w-full h-12 rounded-xl gradient-gold text-white font-bold shadow-md halo-glow"
                  >
                    Start Game <Play className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Waiting for host to start...
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={async () => {
                    if (gameChannel) {
                      await supabase.removeChannel(gameChannel);
                      setGameChannel(null);
                    }
                    if (activeRoom.host && lobbyChannel) {
                      await lobbyChannel.track({ isHost: false });
                    }
                    setActiveRoom(null);
                    setPhase("select");
                  }} 
                  variant="ghost" 
                  className="w-full mt-4 h-10 rounded-xl"
                >
                  Leave Room
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── QUIZ ── */}
          {phase === "quiz" && (
            <motion.div key={`quiz-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-4">
              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Question {currentQ + 1} of {totalQ}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 rounded-full bg-muted [&>div]:gradient-spirit [&>div]:rounded-full" />
              </div>

              {/* Group Leaderboard (if Multiplayer) */}
              {isGroupGame && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200 dark:border-amber-900/50 flex gap-4 overflow-x-auto">
                  <div className="flex items-center gap-2 shrink-0">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-500 tracking-wider">Live</span>
                  </div>
                  {groupScores.sort((a,b) => b.score - a.score).map((player, idx) => (
                    <div key={player.id} className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-black/20 px-2 py-1 rounded-lg border border-border/50">
                      <span className="text-[10px] font-bold text-muted-foreground">#{idx + 1}</span>
                      <span className="text-xs font-semibold text-foreground">{player.name}</span>
                      <span className="text-xs font-bold text-amber-600">{player.score}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Question card */}
              <div className="bg-card rounded-2xl border border-border/60 card-holy p-5">
                <Badge className={cn("mb-3 text-[10px] border-0 px-2", q.type === "mcq" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300")}>
                  {q.type === "mcq" ? "Multiple Choice" : "True or False"}
                </Badge>
                <p className="text-base font-bold text-foreground font-serif leading-snug">{q.question}</p>
                {q.verse && <p className="text-xs text-primary font-semibold mt-1.5">See: {q.verse}</p>}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {(q.type === "mcq" ? q.options! : ["True", "False"]).map((opt) => {
                  const val = q.type === "truefalse" ? opt === "True" : opt;
                  const isSelected = selected === val;
                  const isCorrect  = q.answer === val;
                  const showCorrect = revealed && isCorrect;
                  const showWrong   = revealed && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={String(opt)}
                      whileTap={!revealed ? { scale: 0.98 } : {}}
                      onClick={() => { if (!revealed) setSelected(val); }}
                      disabled={revealed}
                      className={cn(
                        "w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-semibold transition duration-200 flex items-center justify-between",
                        !revealed && isSelected ? "border-primary bg-primary/8 text-primary" :
                        !revealed ? "border-border/60 bg-card text-foreground hover:border-primary/50 hover:bg-primary/4" :
                        showCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" :
                        showWrong   ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                        "border-border/30 bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <span>{String(opt)}</span>
                      {revealed && showCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                      {revealed && showWrong   && <XCircle    className="w-4 h-4 text-red-400 shrink-0"   />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn(
                    "rounded-2xl p-4 border",
                    selected === q.answer
                      ? "bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800"
                  )}>
                    <p className="text-sm font-bold mb-1">{selected === q.answer ? "✅ Correct!" : "❌ Incorrect"}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed font-serif italic">{q.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              {!revealed ? (
                <Button onClick={submitAnswer} disabled={selected === null} className="w-full h-11 rounded-xl gradient-spirit text-white font-bold shadow-md">
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={nextQuestion} disabled={submittingXP} className="w-full h-11 rounded-xl gradient-gold text-white font-bold shadow-md halo-glow">
                  {submittingXP ? <Loader2 className="w-4 h-4 animate-spin" /> : currentQ + 1 >= totalQ ? "See Results" : "Next Question →"}
                </Button>
              )}
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {phase === "result" && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
              
              {!isGroupGame ? (
                <>
                  <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-20 h-20 rounded-3xl gradient-gold flex items-center justify-center mx-auto shadow-2xl halo-glow text-4xl">
                    {score === totalQ ? "🏆" : score >= totalQ / 2 ? "⭐" : "🌿"}
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Quiz Complete</p>
                    <h2 className="text-3xl font-extrabold text-foreground font-serif">{score} / {totalQ} Correct</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {score === totalQ ? "Perfect score! Deo Gratias! 🎉" :
                       score >= totalQ / 2 ? "Great effort! Keep studying God's Word." :
                       "Keep going! Every reading builds wisdom."}
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-card rounded-2xl border border-border/60 card-holy p-6 text-center">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Final Room Rankings</p>
                  <div className="flex items-end justify-center gap-2 md:gap-4 mb-6">
                    {/* Rank 2 */}
                    {groupScores.sort((a,b) => b.score - a.score)[1] && (
                      <div className="flex flex-col items-center">
                        <div className="text-2xl mb-1">🥈</div>
                        <div className="w-16 md:w-20 bg-gray-200 dark:bg-gray-800 rounded-t-xl h-16 flex items-end justify-center pb-2">
                          <span className="font-bold text-sm">{groupScores[1].score} pts</span>
                        </div>
                        <p className="text-xs font-bold mt-2 truncate w-16 md:w-20">{groupScores[1].name}</p>
                      </div>
                    )}
                    {/* Rank 1 */}
                    {groupScores.sort((a,b) => b.score - a.score)[0] && (
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-1">👑</div>
                        <div className="w-20 md:w-24 gradient-gold rounded-t-xl h-24 flex items-end justify-center pb-2 halo-glow">
                          <span className="font-bold text-white text-base">{groupScores[0].score} pts</span>
                        </div>
                        <p className="text-sm font-bold mt-2 truncate w-20 md:w-24">{groupScores[0].name}</p>
                      </div>
                    )}
                    {/* Rank 3 */}
                    {groupScores.sort((a,b) => b.score - a.score)[2] && (
                      <div className="flex flex-col items-center">
                        <div className="text-2xl mb-1">🥉</div>
                        <div className="w-16 md:w-20 bg-orange-200 dark:bg-orange-900/50 rounded-t-xl h-12 flex items-end justify-center pb-2">
                          <span className="font-bold text-sm">{groupScores[2].score} pts</span>
                        </div>
                        <p className="text-xs font-bold mt-2 truncate w-16 md:w-20">{groupScores[2].name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="bg-card rounded-2xl border border-border/60 card-holy p-5 text-left space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Your Answers</p>
                {questions.map((q, i) => {
                  const correct = answers[i] === q.answer;
                  return (
                    <div key={q.id} className="flex items-start gap-2">
                      {correct
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                      <p className="text-xs text-foreground/80 font-serif">{q.question}</p>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-2xl gradient-gold p-4 text-white text-center card-holy halo-glow">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Grace Points Earned</p>
                <p className="text-3xl font-extrabold font-serif">+{Math.round((score / totalQ) * activeSet.xp)} Grace Points</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => startQuiz(activeSet)} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-border/60">
                  <RotateCcw className="w-4 h-4 mr-2" /> Retry
                </Button>
                <Button onClick={() => setPhase("select")} className="flex-1 h-11 rounded-xl gradient-royal text-white font-bold shadow-md">
                  More Quizzes <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
