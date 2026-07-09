"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ChevronLeft, Dices, Trophy, Users, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { awardXP } from "@/app/actions/gamification";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { TRIVIA_QUESTIONS } from "@/lib/trivia";
import { useRouter } from "next/navigation";

/* ─── Ludo Board Constants ─── */
const BOARD_SIZE = 15;

const PATH = [
  {r: 6, c: 0}, {r: 6, c: 1}, {r: 6, c: 2}, {r: 6, c: 3}, {r: 6, c: 4}, {r: 6, c: 5},
  {r: 5, c: 6}, {r: 4, c: 6}, {r: 3, c: 6}, {r: 2, c: 6}, {r: 1, c: 6}, {r: 0, c: 6},
  {r: 0, c: 7},
  {r: 0, c: 8}, {r: 1, c: 8}, {r: 2, c: 8}, {r: 3, c: 8}, {r: 4, c: 8}, {r: 5, c: 8},
  {r: 6, c: 9}, {r: 6, c: 10}, {r: 6, c: 11}, {r: 6, c: 12}, {r: 6, c: 13}, {r: 6, c: 14},
  {r: 7, c: 14},
  {r: 8, c: 14}, {r: 8, c: 13}, {r: 8, c: 12}, {r: 8, c: 11}, {r: 8, c: 10}, {r: 8, c: 9},
  {r: 9, c: 8}, {r: 10, c: 8}, {r: 11, c: 8}, {r: 12, c: 8}, {r: 13, c: 8}, {r: 14, c: 8},
  {r: 14, c: 7},
  {r: 14, c: 6}, {r: 13, c: 6}, {r: 12, c: 6}, {r: 11, c: 6}, {r: 10, c: 6}, {r: 9, c: 6},
  {r: 8, c: 5}, {r: 8, c: 4}, {r: 8, c: 3}, {r: 8, c: 2}, {r: 8, c: 1}, {r: 8, c: 0},
  {r: 7, c: 0}
]; // 52 length

type Color = "red" | "green" | "yellow" | "blue";

const START_INDEX: Record<Color, number> = {
  red: 1,
  green: 14,
  yellow: 27,
  blue: 40
};

const HOME_STRETCH: Record<Color, {r: number, c: number}[]> = {
  red: [{r: 7, c: 1}, {r: 7, c: 2}, {r: 7, c: 3}, {r: 7, c: 4}, {r: 7, c: 5}],
  green: [{r: 1, c: 7}, {r: 2, c: 7}, {r: 3, c: 7}, {r: 4, c: 7}, {r: 5, c: 7}],
  yellow: [{r: 7, c: 13}, {r: 7, c: 12}, {r: 7, c: 11}, {r: 7, c: 10}, {r: 7, c: 9}],
  blue: [{r: 13, c: 7}, {r: 12, c: 7}, {r: 11, c: 7}, {r: 10, c: 7}, {r: 9, c: 7}]
};

const COLORS = ["red", "green", "yellow", "blue"] as Color[];

const BG_COLORS = {
  red: "bg-red-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500"
};
const BORDER_COLORS = {
  red: "border-red-600",
  green: "border-green-600",
  yellow: "border-yellow-600",
  blue: "border-blue-600"
};

/* ─── Main Component ─── */
export default function BibleLudoPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  
  // Game Setup
  const [gameMode, setGameMode] = useState<"setup" | "solo" | "team" | "local" | "live" | "lobby">("setup");
  const [lobbyChannel, setLobbyChannel] = useState<any>(null);
  const [gameChannel, setGameChannel] = useState<any>(null);
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<{id: string, name: string}[]>([]);
  const [myColor, setMyColor] = useState<Color>("red");

  const [turn, setTurn] = useState<Color>("red");
  const [dice, setDice] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [trivia, setTrivia] = useState<typeof TRIVIA_QUESTIONS[0] | null>(null);
  const [unusedQuestions, setUnusedQuestions] = useState<typeof TRIVIA_QUESTIONS>([...TRIVIA_QUESTIONS]);
  const [tokens, setTokens] = useState<Record<Color, number[]>>({
    red: [-1, -1, -1, -1], // -1 = base, 0-51 = path, 100-104 = home stretch, 200 = home
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1]
  });
  const [winner, setWinner] = useState<Color | null>(null);
  const [triviaResult, setTriviaResult] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    if (user && (gameMode === "setup" || gameMode === "lobby")) {
      const channel = supabase.channel('ludo_lobby', {
        config: { presence: { key: user.id } },
      });

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const rooms = [];
        for (const userId in state) {
          const p = (state[userId] as any)[0];
          if (p && p.isHost) {
            rooms.push({ id: userId, name: p.roomName, players: p.players || 1, max: 4, host: userId === user.id });
          }
        }
        setLiveRooms(rooms);
      }).subscribe();

      setLobbyChannel(channel);
      return () => { supabase.removeChannel(channel); };
    }
  }, [user, gameMode]);

  // Auto-pass turn if no moves possible or if it's a Bot's turn
  useEffect(() => {
    if (gameMode === "setup" || gameMode === "lobby") return;
    
    if (dice !== null && !trivia && !isRolling && !winner) {
      const hasMoves = tokens[turn].some((t, idx) => canMove(turn, idx, dice));
      
      const isBotTurn = gameMode !== "local" && gameMode !== "live" &&
        ((gameMode === "solo" && turn !== "red") || (gameMode === "team" && turn !== "red"));

      if (!hasMoves) {
        setTimeout(() => nextTurn(), 1000);
      } else if (isBotTurn) {
        // AI Turn
        setTimeout(() => {
          const movable = tokens[turn].map((t, idx) => ({ idx, can: canMove(turn, idx, dice) })).filter(m => m.can);
          if (movable.length > 0) {
            moveToken(turn, movable[0].idx, dice);
          } else {
            nextTurn();
          }
        }, 1200);
      }
    } else if (dice === null && !winner) {
      // If it's a bot's turn to roll, do it automatically
      const isBotTurn = gameMode !== "local" && gameMode !== "live" &&
        ((gameMode === "solo" && turn !== "red") || (gameMode === "team" && turn !== "red"));
        
      if (isBotTurn) {
        setTimeout(() => executeRoll(false), 800);
      }
    }
  }, [dice, turn, isRolling, trivia, winner, gameMode, tokens]);

  const canMove = (color: Color, tokenIdx: number, roll: number) => {
    const pos = tokens[color][tokenIdx];
    if (pos === -1) return roll === 6;
    if (pos === 200) return false;
    
    // Convert to global path index or home stretch index
    if (pos >= 0 && pos < 52) {
      let nextPos = pos + roll;
      // Check if entering home stretch
      const start = START_INDEX[color];
      const entryPos = start === 1 ? 0 : start - 1; // Pos before start
      
      let relativeMoved = (pos - start + 52) % 52;
      let nextRelative = relativeMoved + roll;
      
      if (nextRelative >= 51) {
        // Entering home stretch
        const stretchIdx = nextRelative - 51;
        if (stretchIdx > 5) return false; // Overshot
      }
      return true;
    }
    if (pos >= 100 && pos < 105) {
      const stretchIdx = pos - 100;
      if (stretchIdx + roll > 5) return false;
      return true;
    }
    return false;
  };

  const nextTurn = (extraTurn = false, sync = true) => {
    let nextColor = turn;
    if (!extraTurn) {
      const idx = COLORS.indexOf(turn);
      nextColor = COLORS[(idx + 1) % 4];
      setTurn(nextColor);
    }
    setDice(null);

    if (sync && gameMode === "live" && gameChannel && turn === myColor) {
      gameChannel.send({ type: 'broadcast', event: 'next_turn', payload: { extraTurn, nextColor } });
    }
  };

  const handleRollClick = () => {
    if (dice !== null || isRolling || winner) return;
    if (gameMode === "live" && turn !== myColor) return; // Only roll for yourself in live

    const isHuman = (gameMode === "local") || 
                    (gameMode === "live" && turn === myColor) || 
                    (gameMode === "solo" && turn === "red") ||
                    (gameMode === "team" && turn === "red");

    if (isHuman) {
      // Trigger trivia before rolling
      let questionsToUse = unusedQuestions;
      if (questionsToUse.length === 0) {
        questionsToUse = [...TRIVIA_QUESTIONS];
      }
      
      const qIndex = Math.floor(Math.random() * questionsToUse.length);
      const selectedTrivia = questionsToUse[qIndex];
      
      setTrivia(selectedTrivia);
      
      // Remove the selected question from the unused list
      const updatedQuestions = [...questionsToUse];
      updatedQuestions.splice(qIndex, 1);
      setUnusedQuestions(updatedQuestions);
    } else {
      executeRoll(true);
    }
  };

  const executeRoll = (sync = true) => {
    setIsRolling(true);
    
    // Animate dice
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setDice(result);
      setIsRolling(false);
      
      if (sync && gameMode === "live" && gameChannel) {
        gameChannel.send({ type: 'broadcast', event: 'roll_dice', payload: { result } });
      }
    }, 600);
  };

  const forceMoveToken = (color: Color, tokenIdx: number, resultTokens: Record<Color, number[]>, extraTurn: boolean, isWin: boolean, winnerColor: Color | null) => {
    setTokens(resultTokens);
    if (isWin) {
      setWinner(winnerColor);
      if (winnerColor === "red") awardTeamXP();
    } else {
      nextTurn(extraTurn, false);
    }
  };

  const moveToken = (color: Color, tokenIdx: number, roll: number, sync = true) => {
    if (!canMove(color, tokenIdx, roll)) return;
    
    const newTokens = { ...tokens };
    const pos = newTokens[color][tokenIdx];
    let extraTurn = roll === 6;

    if (pos === -1) {
      // Leave base
      newTokens[color][tokenIdx] = START_INDEX[color];
    } else if (pos >= 0 && pos < 52) {
      const start = START_INDEX[color];
      let relativeMoved = (pos - start + 52) % 52;
      let nextRelative = relativeMoved + roll;
      
      if (nextRelative >= 51) {
        // Enter home stretch
        const stretchIdx = nextRelative - 51;
        if (stretchIdx === 5) {
          newTokens[color][tokenIdx] = 200; // Finished
          extraTurn = true;
        } else {
          newTokens[color][tokenIdx] = 100 + stretchIdx;
        }
      } else {
        // Normal track movement
        let nextPos = (pos + roll) % 52;
        newTokens[color][tokenIdx] = nextPos;
        
        // Capture logic
        COLORS.forEach(c => {
          if (c !== color) {
            // Team Mode: No friendly fire between Red & Yellow, and Green & Blue
            const isTeammate = gameMode === "team" && ((color === "red" && c === "yellow") || (color === "yellow" && c === "red") || (color === "green" && c === "blue") || (color === "blue" && c === "green"));
            
            if (!isTeammate) {
              newTokens[c] = newTokens[c].map(p => {
                if (p === nextPos) {
                  extraTurn = true;
                  return -1; // Send back to base
                }
                return p;
              });
            }
          }
        });
      }
    } else if (pos >= 100 && pos < 105) {
      const stretchIdx = pos - 100;
      if (stretchIdx + roll === 5) {
        newTokens[color][tokenIdx] = 200;
        extraTurn = true;
      } else {
        newTokens[color][tokenIdx] = pos + roll;
      }
    }

    setTokens(newTokens);
    
    // Check win condition
    let isWin = false;
    let winnerColor: Color | null = null;
    
    if (gameMode === "team") {
      const redWon = newTokens.red.every(t => t === 200);
      const yellowWon = newTokens.yellow.every(t => t === 200);
      const greenWon = newTokens.green.every(t => t === 200);
      const blueWon = newTokens.blue.every(t => t === 200);

      if (redWon && yellowWon) {
        winnerColor = "red";
        isWin = true;
      } else if (greenWon && blueWon) {
        winnerColor = "green";
        isWin = true;
      }
    } else {
      if (newTokens[color].every(t => t === 200)) {
        winnerColor = color;
        isWin = true;
      }
    }

    if (sync && gameMode === "live" && gameChannel) {
      gameChannel.send({ type: 'broadcast', event: 'move_token', payload: { color, tokenIdx, roll, newTokens, extraTurn, isWin, winnerColor } });
    }

    forceMoveToken(color, tokenIdx, newTokens, extraTurn, isWin, winnerColor);
  };

  const awardTeamXP = () => {
    if (user) {
      awardXP(gameMode === "team" ? 40 : 25, "Won Bible Ludo").then(res => {
        if (res.success && res.xp) setUser({...user, xp: res.xp, level: res.level});
      });
    }
  };

  const handleTrivia = (opt: string) => {
    if (!trivia || triviaResult) return;
    if (opt === trivia.a) {
      setTriviaResult("correct");
      setTimeout(() => {
        setTriviaResult(null);
        setTrivia(null);
        executeRoll(true);
      }, 1500);
    } else {
      setTriviaResult("wrong");
      setTimeout(() => {
        setTriviaResult(null);
        setTrivia(null);
        nextTurn();
      }, 2500);
    }
  };

  // Render board
  const getCellTokens = (r: number, c: number) => {
    const res: {color: Color, idx: number}[] = [];
    
    // Check bases
    if (r < 6 && c < 6) {
      tokens.red.forEach((t, i) => { if (t === -1 && (r === 2 || r === 3) && (c === 2 || c === 3)) {
        if ((i === 0 && r===2 && c===2) || (i === 1 && r===2 && c===3) || (i === 2 && r===3 && c===2) || (i === 3 && r===3 && c===3)) res.push({color: "red", idx: i});
      }});
    }
    if (r < 6 && c > 8) {
      tokens.green.forEach((t, i) => { if (t === -1 && (r === 2 || r === 3) && (c === 11 || c === 12)) {
        if ((i === 0 && r===2 && c===11) || (i === 1 && r===2 && c===12) || (i === 2 && r===3 && c===11) || (i === 3 && r===3 && c===12)) res.push({color: "green", idx: i});
      }});
    }
    if (r > 8 && c < 6) {
      tokens.blue.forEach((t, i) => { if (t === -1 && (r === 11 || r === 12) && (c === 2 || c === 3)) {
        if ((i === 0 && r===11 && c===2) || (i === 1 && r===11 && c===3) || (i === 2 && r===12 && c===2) || (i === 3 && r===12 && c===3)) res.push({color: "blue", idx: i});
      }});
    }
    if (r > 8 && c > 8) {
      tokens.yellow.forEach((t, i) => { if (t === -1 && (r === 11 || r === 12) && (c === 11 || c === 12)) {
        if ((i === 0 && r===11 && c===11) || (i === 1 && r===11 && c===12) || (i === 2 && r===12 && c===11) || (i === 3 && r===12 && c===12)) res.push({color: "yellow", idx: i});
      }});
    }

    // Check path
    const pathIdx = PATH.findIndex(p => p.r === r && p.c === c);
    if (pathIdx !== -1) {
      COLORS.forEach(color => {
        tokens[color].forEach((t, i) => {
          if (t === pathIdx) res.push({color, idx: i});
        });
      });
    }

    // Check home stretches
    COLORS.forEach(color => {
      HOME_STRETCH[color].forEach((p, sIdx) => {
        if (p.r === r && p.c === c) {
          tokens[color].forEach((t, i) => {
            if (t === 100 + sIdx) res.push({color, idx: i});
          });
        }
      });
    });

    return res;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fdfbf7]">
      <div className="px-4 pt-6 pb-4 border-b border-border flex items-center justify-between bg-white shadow-sm z-10">
        <Button onClick={() => gameMode === "setup" ? router.push('/quizzes') : setGameMode("setup")} variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold font-serif text-foreground">Journey to Emmaus</h1>
        <div className="w-10 h-10 rounded-full gradient-life text-white flex items-center justify-center shadow-md">🎲</div>
      </div>

      {gameMode === "setup" ? (
        <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-3xl gradient-life flex items-center justify-center mx-auto shadow-2xl mb-6 halo-glow text-5xl">🎲</div>
            <h2 className="text-3xl font-extrabold font-serif mb-2">Bible Ludo</h2>
            <p className="text-muted-foreground">Select your game mode</p>
          </div>

          <div className="space-y-4">
            <Button onClick={() => { setGameMode("solo"); setTokens({red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], blue: [-1,-1,-1,-1]}); setWinner(null); }} className="w-full h-16 rounded-2xl bg-card border-2 border-border/60 justify-start px-6 hover:border-primary/50 text-left flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-foreground">Solo vs AI</p>
                <p className="text-xs text-muted-foreground font-normal">Play against 3 computer bots</p>
              </div>
            </Button>
            
            <Button onClick={() => { setGameMode("team"); setTokens({red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], blue: [-1,-1,-1,-1]}); setWinner(null); }} className="w-full h-16 rounded-2xl bg-card border-2 border-border/60 justify-start px-6 hover:border-primary/50 text-left flex gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><Trophy className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-foreground">2v2 Team Mode <Badge className="ml-2 text-[10px] gradient-gold border-0">40 Grace Points</Badge></p>
                <p className="text-xs text-muted-foreground font-normal">You & Yellow vs Green & Blue</p>
              </div>
            </Button>

            <Button onClick={() => { setGameMode("local"); setTokens({red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], blue: [-1,-1,-1,-1]}); setWinner(null); }} className="w-full h-16 rounded-2xl bg-card border-2 border-border/60 justify-start px-6 hover:border-primary/50 hover:shadow-md transition-all text-left flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Dices className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-foreground">Pass & Play (Group)</p>
                <p className="text-xs text-muted-foreground font-normal">Play locally with up to 4 friends</p>
              </div>
            </Button>

            <Button onClick={() => setGameMode("lobby")} className="w-full h-16 rounded-2xl bg-card border-2 border-border/60 justify-start px-6 hover:border-primary/50 hover:shadow-md transition-all text-left flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-foreground">Live Online Multiplayer</p>
                <p className="text-xs text-muted-foreground font-normal">Play with others globally in real time</p>
              </div>
            </Button>
          </div>
        </div>
      ) : gameMode === "lobby" ? (
        <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-extrabold font-serif mb-1">Live Lobbies</h2>
            <p className="text-muted-foreground text-sm">Join a room or create your own</p>
          </div>
          
          {!activeRoom ? (
            <>
              <Button onClick={() => {
                const roomData = { id: user?.id, name: `${user?.firstName}'s Room`, players: 1, max: 4, host: true };
                setActiveRoom(roomData);
                if (lobbyChannel) lobbyChannel.track({ isHost: true, roomName: roomData.name, players: 1 });
                
                const gChannel = supabase.channel(`ludo_room_${user?.id}`);
                gChannel.on('broadcast', { event: 'join' }, () => {
                  setLobbyPlayers(prev => [...prev, {id: 'temp', name: 'Player'}]);
                }).subscribe();
                setGameChannel(gChannel);
              }} className="w-full h-12 rounded-xl gradient-gold text-white font-bold shadow-md halo-glow">
                <Plus className="w-4 h-4 mr-2" /> Create Ludo Room
              </Button>
              <div className="space-y-2">
                {liveRooms.map(room => (
                  <div key={room.id} className="bg-card rounded-xl p-4 border border-border/60 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-bold font-serif">{room.name}</p>
                      <p className="text-xs text-muted-foreground">{room.players}/4 Players</p>
                    </div>
                    <Button onClick={() => {
                      setActiveRoom(room);
                      setMyColor(COLORS[room.players]);
                      const gChannel = supabase.channel(`ludo_room_${room.id}`);
                      gChannel.on('broadcast', { event: 'start_game' }, () => {
                        setGameMode("live");
                        setTokens({red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], blue: [-1,-1,-1,-1]});
                        setWinner(null);
                        setTurn("red");
                      }).on('broadcast', { event: 'roll_dice' }, ({ payload }) => {
                        setDice(payload.result);
                      }).on('broadcast', { event: 'next_turn' }, ({ payload }) => {
                        setTurn(payload.nextColor);
                        setDice(null);
                      }).on('broadcast', { event: 'move_token' }, ({ payload }) => {
                        forceMoveToken(payload.color, payload.tokenIdx, payload.newTokens, payload.extraTurn, payload.isWin, payload.winnerColor);
                      }).subscribe(status => {
                        if (status === 'SUBSCRIBED') gChannel.send({ type: 'broadcast', event: 'join' });
                      });
                      setGameChannel(gChannel);
                    }} variant="outline" className="h-8">Join</Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-card rounded-2xl border p-6 text-center card-holy">
              <h3 className="font-bold text-xl mb-4">{activeRoom.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">Waiting for players... (You are {myColor})</p>
              {activeRoom.host && (
                <Button onClick={() => {
                  gameChannel.send({ type: 'broadcast', event: 'start_game' });
                  setGameMode("live");
                  setTokens({red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], blue: [-1,-1,-1,-1]});
                  setWinner(null);
                  setTurn("red");
                }} className="w-full h-12 rounded-xl gradient-gold text-white font-bold mb-3">
                  Start Game Now
                </Button>
              )}
              <Button onClick={() => { setActiveRoom(null); if(lobbyChannel) lobbyChannel.track({ isHost: false }); }} variant="ghost" className="w-full h-10">Leave</Button>
            </div>
          )}
        </div>
      ) : (
        <>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center pb-32">
          
          {/* Status Bar */}
          <div className="w-full max-w-[400px] mb-4 flex items-center justify-between bg-white rounded-2xl p-3 border shadow-sm">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${BG_COLORS[turn]} shadow-inner border-2 border-black/10`} />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Current Turn</p>
                <p className="font-bold text-sm leading-none capitalize">
                  {gameMode === "local" || gameMode === "live" ? `${turn} Player` : (turn === "red" ? "Your Turn" : `${turn} Bot`)}
                  {gameMode === "live" && turn === myColor && " (You)"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isRolling ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5 }}>
                  <Dices className="w-8 h-8 text-primary" />
                </motion.div>
              ) : dice ? (
                <div className="w-10 h-10 bg-card border-2 border-primary rounded-xl flex items-center justify-center text-xl font-bold text-primary shadow-sm">
                  {dice}
                </div>
              ) : (
                <Button 
                  onClick={() => handleRollClick()} 
                  disabled={gameMode !== "local" && gameMode !== "live" && turn !== "red"}
                  size="sm"
                  className={`rounded-xl font-bold ${((gameMode === "local" || turn === "red") || (gameMode === "live" && turn === myColor)) ? "gradient-gold shadow-md halo-glow" : "bg-muted text-muted-foreground"}`}
                >
                  Roll
                </Button>
              )}
            </div>
          </div>

        {/* Board */}
        <div 
          className="bg-white p-2 rounded-2xl shadow-xl border-4 border-amber-800/20 relative"
          style={{ width: "min(100%, 400px)", aspectRatio: "1/1" }}
        >
          <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)` }}>
            {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
              const r = Math.floor(i / BOARD_SIZE);
              const c = i % BOARD_SIZE;
              
              // Base colors
              let cellClass = "border border-black/5 bg-stone-50";
              if (r < 6 && c < 6) cellClass = "bg-red-50 border-red-200";
              else if (r < 6 && c > 8) cellClass = "bg-green-50 border-green-200";
              else if (r > 8 && c < 6) cellClass = "bg-blue-50 border-blue-200";
              else if (r > 8 && c > 8) cellClass = "bg-yellow-50 border-yellow-200";
              
              // Home stretches
              if (r === 7 && c >= 1 && c <= 5) cellClass = "bg-red-200/50";
              if (c === 7 && r >= 1 && r <= 5) cellClass = "bg-green-200/50";
              if (r === 7 && c >= 9 && c <= 13) cellClass = "bg-yellow-200/50";
              if (c === 7 && r >= 9 && r <= 13) cellClass = "bg-blue-200/50";

              // Starts
              if (r === 6 && c === 1) cellClass = "bg-red-300";
              if (r === 1 && c === 8) cellClass = "bg-green-300";
              if (r === 8 && c === 13) cellClass = "bg-yellow-300";
              if (r === 13 && c === 6) cellClass = "bg-blue-300";

              // Center
              if (r >= 6 && r <= 8 && c >= 6 && c <= 8) cellClass = "gradient-gold shadow-inner rounded-sm relative";

              const cellTokens = getCellTokens(r, c);

              return (
                <div key={i} className={`relative flex flex-wrap items-center justify-center ${cellClass}`}>
                  {cellTokens.map((t, idx) => (
                    <button
                      key={`${t.color}-${t.idx}`}
                      onClick={() => {
                        const canPlayerClick = gameMode === "local" || (gameMode !== "live" && turn === "red") || (gameMode === "live" && turn === myColor);
                        if (canPlayerClick && turn === t.color && dice !== null && !trivia && canMove(turn, t.idx, dice)) {
                          moveToken(turn, t.idx, dice);
                        }
                      }}
                      className={cn(
                        `w-[60%] h-[60%] rounded-full shadow-lg border-2 absolute z-10 transition-transform duration-300 ease-in-out`,
                        BG_COLORS[t.color], BORDER_COLORS[t.color],
                        (((gameMode === "local" || (gameMode !== "live" && turn === "red") || (gameMode === "live" && turn === myColor)) && turn === t.color && dice && canMove(turn, t.idx, dice) && !trivia) ? "animate-pulse ring-4 ring-primary/50 ring-offset-2 scale-110" : "")
                      )}
                      style={{ 
                        transform: cellTokens.length > 1 ? `translate(${(idx%2)*30 - 15}%, ${Math.floor(idx/2)*30 - 15}%) scale(0.8)` : "scale(1)"
                      }}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Trivia Overlay */}
      <AnimatePresence>
        {trivia && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl card-holy"
            >
              <div className="w-12 h-12 rounded-full gradient-spirit flex items-center justify-center mx-auto mb-4 text-white">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-center font-serif mb-2">Bible Trivia Challenge!</h2>
              <p className="text-sm text-center text-muted-foreground mb-6">Answer correctly to roll the dice.</p>
              
              <div className="bg-muted/50 p-4 rounded-xl border mb-6">
                <p className="font-bold text-base text-foreground font-serif leading-snug">{trivia.q}</p>
              </div>

              <div className="space-y-2">
                {triviaResult ? (
                   <div className="text-center py-4 bg-muted/50 rounded-xl border">
                     {triviaResult === "correct" ? (
                       <p className="text-green-500 font-bold text-xl">Correct!</p>
                     ) : (
                       <div>
                         <p className="text-red-500 font-bold text-xl mb-2">Incorrect!</p>
                         <p className="text-sm text-foreground">The correct answer is: <span className="font-bold text-green-500">{trivia.a}</span></p>
                       </div>
                     )}
                   </div>
                ) : (
                  trivia.options.map(opt => (
                    <Button 
                      key={opt}
                      onClick={() => handleTrivia(opt)}
                      variant="outline"
                      className="w-full h-11 justify-start font-semibold text-sm"
                    >
                      {opt}
                    </Button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl card-holy text-center border border-amber-500/30"
            >
              <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4 text-white text-4xl shadow-lg halo-glow">
                🏆
              </div>
              <h2 className="text-3xl font-bold font-serif mb-2 capitalize">
                {gameMode === "team" ? (winner === "red" ? "Team Red/Yellow Wins!" : "Team Green/Blue Wins!") : (winner === "red" ? "You Won!" : `${winner} Won!`)}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">The Journey to Emmaus is complete.</p>
              
              {winner === "red" && (
                <p className="text-amber-600 font-bold mb-6 text-lg">+{gameMode === "team" ? "40" : "25"} Grace Points Awarded!</p>
              )}

              <div className="flex gap-3">
                <Button onClick={() => setGameMode("setup")} className="flex-1 gradient-gold text-white font-bold h-11 rounded-xl shadow-md">
                  Play Again
                </Button>
                <Button onClick={() => router.push('/quizzes')} variant="outline" className="flex-1 h-11 rounded-xl font-bold">
                  Exit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
