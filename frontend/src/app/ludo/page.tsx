"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, Dices, Trophy, Users, ShieldAlert, Share2, Check } from "lucide-react";
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
  red: "bg-gradient-to-br from-red-400 via-red-500 to-red-600 hover:from-red-300 hover:to-red-500 shadow-[inset_0_3px_6px_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.5)]",
  green: "bg-gradient-to-br from-green-400 via-green-500 to-green-600 hover:from-green-300 hover:to-green-500 shadow-[inset_0_3px_6px_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.5)]",
  yellow: "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-[inset_0_3px_6px_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.5)]",
  blue: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 hover:from-blue-300 hover:to-blue-500 shadow-[inset_0_3px_6px_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.5)]"
};
const BORDER_COLORS = {
  red: "border-t-red-300 border-l-red-300 border-r-red-700 border-b-red-700 border-[0.5px]",
  green: "border-t-green-300 border-l-green-300 border-r-green-700 border-b-green-700 border-[0.5px]",
  yellow: "border-t-amber-300 border-l-amber-300 border-r-amber-700 border-b-amber-700 border-[0.5px]",
  blue: "border-t-blue-300 border-l-blue-300 border-r-blue-700 border-b-blue-700 border-[0.5px]"
};

/* ─── Main Component ─── */
export default function BibleLudoPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  
  // Game Setup
  const [gameMode, setGameMode] = useState<"setup" | "solo" | "team" | "local" | "live" | "lobby">("setup");
  const [gameChannel, setGameChannel] = useState<any>(null);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [joinCode, setJoinCode] = useState("");
  const [lobbyPlayers, setLobbyPlayers] = useState<any[]>([]);
  const [myColor, setMyColor] = useState<Color | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  
  const prevPlayersRef = useRef<any[]>([]);

  const extractPresencePlayers = (state: any) => {
    return Object.values(state)
      .map((arr: any) => {
        if (!arr || arr.length === 0) return null;
        // Search backwards to get the most recent presence entry with a colorSlot
        const withColor = [...arr].reverse().find((p: any) => p && p.colorSlot);
        if (withColor) return withColor;
        // Fallback to the latest tracked presence
        return arr[arr.length - 1] || arr[0];
      })
      .filter(Boolean);
  };

  const showToast = (message: string) => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const findFreeColorSlot = (playersList: any[], userId: string, isHost: boolean) => {
    if (isHost) return "red" as Color;

    const takenColors = playersList
      .filter((p: any) => p.id !== userId && p.colorSlot)
      .map((p: any) => p.colorSlot);
    
    // Host is always red, ensure it's marked as taken for joiners
    if (!takenColors.includes("red")) {
      takenColors.push("red");
    }
    
    const freeColor = COLORS.find(c => !takenColors.includes(c));
    return (freeColor || null) as Color | null;
  };

  const updateLobbyPlayersList = (newList: any[]) => {
    const prevList = prevPlayersRef.current;
    
    // Detect Joins
    newList.forEach((p: any) => {
      const existed = prevList.some((oldP: any) => oldP.id === p.id);
      if (!existed && p.id !== user?.id) {
        showToast(`${p.name} joined the room`);
      }
    });

    // Detect Leaves
    prevList.forEach((p: any) => {
      const exists = newList.some((newP: any) => newP.id === p.id);
      if (!exists && p.id !== user?.id) {
        showToast(`${p.name} left the room`);
      }
    });

    prevPlayersRef.current = newList;
    setLobbyPlayers(newList);
  };

  // Manual color selection removed, auto-assign handled by presence sync

  const toggleReady = async () => {
    if (!user || !gameChannel || activeRoom?.host) return;
    
    if (!myColor) {
      showToast("Please select a color first!");
      return;
    }
    
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    
    await gameChannel.track({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      isHost: false,
      colorSlot: myColor,
      isReady: newReadyState
    });
  };

  const [roomPlayers, setRoomPlayers] = useState<Record<Color, { id: string; name: string; isBot: boolean }>>({
    red: { id: "bot_red", name: "Red Bot", isBot: true },
    green: { id: "bot_green", name: "Green Bot", isBot: true },
    yellow: { id: "bot_yellow", name: "Yellow Bot", isBot: true },
    blue: { id: "bot_blue", name: "Blue Bot", isBot: true }
  });

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
  const [inviteCopied, setInviteCopied] = useState(false);
  const [gameEvent, setGameEvent] = useState<{ type: "capture" | "home"; color: Color; message: string } | null>(null);

  // Initialize room players depending on mode
  const initializeRoomPlayers = (mode: typeof gameMode, playersList: any[] = []) => {
    if (mode === "solo") {
      const mapping = {
        red: { id: user?.id || "player_red", name: user?.firstName || "You", isBot: false },
        green: { id: "bot_green", name: "Green Bot (AI)", isBot: true },
        yellow: { id: "bot_yellow", name: "Yellow Bot (AI)", isBot: true },
        blue: { id: "bot_blue", name: "Blue Bot (AI)", isBot: true }
      };
      setRoomPlayers(mapping);
      return mapping;
    } else if (mode === "team") {
      const mapping = {
        red: { id: user?.id || "player_red", name: user?.firstName || "You", isBot: false },
        yellow: { id: "bot_yellow", name: "Yellow Partner (AI)", isBot: true },
        green: { id: "bot_green", name: "Green Opponent (AI)", isBot: true },
        blue: { id: "bot_blue", name: "Blue Opponent (AI)", isBot: true }
      };
      setRoomPlayers(mapping);
      return mapping;
    } else if (mode === "local") {
      const mapping = {
        red: { id: "local_red", name: "Red Player", isBot: false },
        green: { id: "local_green", name: "Green Player", isBot: false },
        yellow: { id: "local_yellow", name: "Yellow Player", isBot: false },
        blue: { id: "local_blue", name: "Blue Player", isBot: false }
      };
      setRoomPlayers(mapping);
      return mapping;
    } else if (mode === "live") {
      const sorted = [...playersList].sort((a: any, b: any) => {
        if (a.isHost && !b.isHost) return -1;
        if (!a.isHost && b.isHost) return 1;
        return a.id.localeCompare(b.id);
      });
      const mapping = {
        red: sorted[0] ? { id: sorted[0].id, name: sorted[0].name, isBot: false } : { id: "bot_red", name: "Red Bot (AI)", isBot: true },
        green: sorted[1] ? { id: sorted[1].id, name: sorted[1].name, isBot: false } : { id: "bot_green", name: "Green Bot (AI)", isBot: true },
        yellow: sorted[2] ? { id: sorted[2].id, name: sorted[2].name, isBot: false } : { id: "bot_yellow", name: "Yellow Bot (AI)", isBot: true },
        blue: sorted[3] ? { id: sorted[3].id, name: sorted[3].name, isBot: false } : { id: "bot_blue", name: "Blue Bot (AI)", isBot: true }
      };
      setRoomPlayers(mapping);
      return mapping;
    }
  };

  // Load seen questions from localStorage on mount to avoid repetitions
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedSeen = localStorage.getItem("ludo_seen_questions");
        const seenList = storedSeen ? JSON.parse(storedSeen) : [];
        const remaining = TRIVIA_QUESTIONS.filter(q => !seenList.includes(q.q));
        if (remaining.length > 0) {
          setUnusedQuestions(remaining);
        } else {
          // Reset seen list once all questions are answered
          localStorage.removeItem("ludo_seen_questions");
          setUnusedQuestions([...TRIVIA_QUESTIONS]);
        }
      } catch (e) {
        console.error("Error loading seen trivia questions:", e);
      }
    }
  }, []);

  // Monitor URL params for direct sharing invite link
  useEffect(() => {
    if (typeof window !== "undefined" && user && gameMode === "setup") {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get("room");
      if (roomParam && !activeRoom) {
        // Clear param to prevent loop
        window.history.replaceState({}, document.title, window.location.pathname);
        handleJoinRoomById(roomParam);
      }
    }
  }, [user, gameMode, activeRoom]);

  // Public lobby channel completely removed, using invite codes instead.

  // Handle player disconnects during a live game
  useEffect(() => {
    if (gameMode === "live" && activeRoom?.host) {
      // Check if any human player in roomPlayers is no longer in lobbyPlayers
      const newRoomPlayers = { ...roomPlayers };
      let updated = false;

      COLORS.forEach(color => {
        const rp = newRoomPlayers[color];
        if (rp && !rp.isBot) {
          // It's a human player. Check if they are still connected.
          const stillConnected = lobbyPlayers.find(p => p.id === rp.id);
          if (!stillConnected) {
            // Player disconnected! Turn them into a bot.
            newRoomPlayers[color] = { ...rp, name: `${rp.name} (Disconnected - Bot)`, isBot: true };
            updated = true;
            showToast(`${rp.name} disconnected. AI took over!`);
          }
        }
      });

      if (updated) {
        setRoomPlayers(newRoomPlayers);
        // Broadcast the updated roomPlayers so everyone else updates it too
        if (gameChannel) {
          gameChannel.send({
            type: 'broadcast',
            event: 'update_room_players',
            payload: { roomPlayers: newRoomPlayers }
          });
        }
      }
    }
  }, [lobbyPlayers, gameMode, activeRoom, roomPlayers, gameChannel]);

  // Auto-pass turn if no moves possible or if it's a Bot's turn
  useEffect(() => {
    if (gameMode === "setup" || gameMode === "lobby") return;
    
    if (dice !== null && !trivia && !isRolling && !winner) {
      const hasMoves = tokens[turn].some((t, idx) => canMove(turn, idx, dice));
      
      const isMyTurn = (gameMode === "live" && turn === myColor);
      const isHostBot = (gameMode === "live" && activeRoom?.host && roomPlayers[turn]?.isBot);
      const isLocalOrSoloOrTeam = (gameMode !== "live");
      const shouldAct = isLocalOrSoloOrTeam || isMyTurn || isHostBot;

      if (!shouldAct) return;

      if (!hasMoves) {
        setTimeout(() => nextTurn(false, gameMode === "live"), 1000);
      } else if (gameMode !== "local" && ((gameMode === "solo" && turn !== "red") || (gameMode === "team" && turn !== "red") || isHostBot)) {
        // AI Turn
        setTimeout(() => {
          const movable = tokens[turn].map((t, idx) => ({ idx, can: canMove(turn, idx, dice) })).filter(m => m.can);
          if (movable.length > 0) {
            // Smart AI Path Selection
            let bestMoveIdx = movable[0].idx;
            let highestScore = -1000;

            for (const { idx } of movable) {
              let score = 0;
              const currentPos = tokens[turn][idx];
              let nextPos = currentPos;

              if (currentPos === -1) {
                score += 150; // Leaving base is great
                nextPos = START_INDEX[turn];
              } else if (currentPos >= 0 && currentPos < 52) {
                const start = START_INDEX[turn];
                let relativeMoved = (currentPos - start + 52) % 52;
                let nextRelative = relativeMoved + dice;
                if (nextRelative >= 51) {
                  const stretchIdx = nextRelative - 51;
                  if (stretchIdx === 5) {
                    score += 300; // Reaching home
                    nextPos = 200;
                  } else {
                    score += 100; // Entering home stretch
                    nextPos = 100 + stretchIdx;
                  }
                } else {
                  nextPos = (currentPos + dice) % 52;
                  
                  // Capture check
                  let wouldCapture = false;
                  COLORS.forEach(c => {
                    if (c !== turn) {
                      const isTeammate = gameMode === "team" && 
                        ((turn === "red" && c === "yellow") || (turn === "yellow" && c === "red") || 
                         (turn === "green" && c === "blue") || (turn === "blue" && c === "green"));
                      if (!isTeammate) {
                        if (tokens[c].some(p => p === nextPos)) wouldCapture = true;
                      }
                    }
                  });
                  if (wouldCapture) score += 250;
                }
              } else if (currentPos >= 100 && currentPos < 105) {
                const stretchIdx = currentPos - 100;
                if (stretchIdx + dice === 5) {
                  score += 300;
                  nextPos = 200;
                } else {
                  score += 50;
                  nextPos = currentPos + dice;
                }
              }

              // Prefer tokens further along the path
              if (currentPos >= 0 && currentPos < 52) {
                const start = START_INDEX[turn];
                const relativeMoved = (currentPos - start + 52) % 52;
                score += relativeMoved;
              } else if (currentPos >= 100 && currentPos < 105) {
                score += 52 + (currentPos - 100);
              }

              // Danger evaluation (opponent close behind)
              let inDangerBefore = false;
              let inDangerAfter = false;
              COLORS.forEach(c => {
                if (c !== turn) {
                  const isTeammate = gameMode === "team" && 
                    ((turn === "red" && c === "yellow") || (turn === "yellow" && c === "red") || 
                     (turn === "green" && c === "blue") || (turn === "blue" && c === "green"));
                  if (!isTeammate) {
                    if (currentPos >= 0 && currentPos < 52) {
                      tokens[c].forEach(p => {
                        if (p >= 0 && p < 52) {
                          const dist = (currentPos - p + 52) % 52;
                          if (dist > 0 && dist <= 6) inDangerBefore = true;
                        }
                      });
                    }
                    if (nextPos >= 0 && nextPos < 52) {
                      tokens[c].forEach(p => {
                        if (p >= 0 && p < 52) {
                          const dist = (nextPos - p + 52) % 52;
                          if (dist > 0 && dist <= 6) inDangerAfter = true;
                        }
                      });
                    }
                  }
                }
              });

              if (inDangerBefore && !inDangerAfter) {
                score += 80; // Escaped danger
              } else if (!inDangerBefore && inDangerAfter) {
                const isSafeCell = (nextPos === 1) || (nextPos === 14) || (nextPos === 27) || (nextPos === 40);
                if (!isSafeCell) score -= 40; // Moving into danger zone
              }

              if (score > highestScore) {
                highestScore = score;
                bestMoveIdx = idx;
              }
            }
            moveToken(turn, bestMoveIdx, dice, gameMode === "live");
          } else {
            nextTurn(false, gameMode === "live");
          }
        }, 1200);
      }
    } else if (dice === null && !winner) {
      // If it's a bot's turn to roll, do it automatically
      const isHostBot = (gameMode === "live" && activeRoom?.host && roomPlayers[turn]?.isBot);
      const isSoloOrTeamBot = (gameMode === "solo" && turn !== "red") || (gameMode === "team" && turn !== "red");
        
      if (isHostBot || isSoloOrTeamBot) {
        setTimeout(() => executeRoll(gameMode === "live"), 800);
      }
    }
  }, [dice, turn, isRolling, trivia, winner, gameMode, tokens, roomPlayers, activeRoom, myColor]);

  const canMove = (color: Color, tokenIdx: number, roll: number) => {
    const pos = tokens[color][tokenIdx];
    if (pos === -1) return roll === 6;
    if (pos === 200) return false;
    
    // Convert to global path index or home stretch index
    if (pos >= 0 && pos < 52) {
      let nextPos = pos + roll;
      // Check if entering home stretch
      const start = START_INDEX[color];
      
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
    let nextColorForBroadcast = turn;
    if (!extraTurn) {
      const idx = COLORS.indexOf(turn);
      nextColorForBroadcast = COLORS[(idx + 1) % 4];
    }

    setTurn(prevTurn => {
      if (extraTurn) return prevTurn;
      const idx = COLORS.indexOf(prevTurn);
      return COLORS[(idx + 1) % 4];
    });
    setDice(null);

    if (sync && gameMode === "live" && gameChannel) {
      const isMyTurn = turn === myColor;
      const isBotHostTurn = activeRoom?.host && roomPlayers[turn]?.isBot;
      if (isMyTurn || isBotHostTurn) {
        gameChannel.send({ type: 'broadcast', event: 'next_turn', payload: { extraTurn, nextColor: nextColorForBroadcast } });
      }
    }
  };

  const handleRollClick = () => {
    if (dice !== null || isRolling || winner || trivia !== null) return;
    if (gameMode === "live" && turn !== myColor) return; // Only roll for yourself in live

    executeRoll(gameMode === "live");
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

      // If it's a human player and they roll a 6, trigger trivia
      const isHuman = (gameMode === "local") || 
                      (gameMode === "live" && turn === myColor) || 
                      (gameMode === "solo" && turn === "red") ||
                      (gameMode === "team" && turn === "red");

      if (isHuman && result === 6) {
        let questionsToUse = unusedQuestions;
        if (questionsToUse.length === 0) {
          questionsToUse = [...TRIVIA_QUESTIONS];
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem("ludo_seen_questions");
            } catch {}
          }
        }
        
        const qIndex = Math.floor(Math.random() * questionsToUse.length);
        const selectedTrivia = questionsToUse[qIndex];
        
        setTrivia(selectedTrivia);
        
        // Remove the selected question from the unused list
        const updatedQuestions = questionsToUse.filter(q => q.q !== selectedTrivia.q);
        setUnusedQuestions(updatedQuestions);

        // Track seen question in localStorage
        if (typeof window !== "undefined") {
          try {
            const storedSeen = localStorage.getItem("ludo_seen_questions");
            const seenList = storedSeen ? JSON.parse(storedSeen) : [];
            if (!seenList.includes(selectedTrivia.q)) {
              seenList.push(selectedTrivia.q);
              localStorage.setItem("ludo_seen_questions", JSON.stringify(seenList));
            }
          } catch (e) {
            console.error("Error saving seen question:", e);
          }
        }
      }
    }, 600);
  };

  const forceMoveToken = (color: Color, tokenIdx: number, resultTokens: Record<Color, number[]>, extraTurn: boolean, isWin: boolean, winnerColor: Color | null) => {
    setTokens(resultTokens);
    if (isWin) {
      setWinner(winnerColor);
      if (gameMode === "live") {
        if (winnerColor === myColor) awardTeamXP();
      } else {
        if (winnerColor === "red") awardTeamXP();
      }
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
          setGameEvent({ type: "home", color, message: `${getPlayerName(color)} reached Emmaus!` });
          setTimeout(() => setGameEvent(null), 2500);
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
                  setGameEvent({ type: "capture", color: c, message: `${getPlayerName(color)} captured ${getPlayerName(c)}!` });
                  setTimeout(() => setGameEvent(null), 2500);
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
        setGameEvent({ type: "home", color, message: `${getPlayerName(color)} reached Emmaus!` });
        setTimeout(() => setGameEvent(null), 2500);
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
    if (String(opt).trim().toLowerCase() === String(trivia.a).trim().toLowerCase()) {
      setTriviaResult("correct");
      setTimeout(() => {
        setTriviaResult(null);
        setTrivia(null);
      }, 1500);
    } else {
      setTriviaResult("wrong");
      setTimeout(() => {
        setTriviaResult(null);
        setTrivia(null);
        nextTurn(false, gameMode === "live");
      }, 2500);
    }
  };

  // Lobby management logic
  const handleCreateRoom = () => {
    if (!user) return;
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomName = `${user.firstName}'s Room`;
    const roomData = { id: roomCode, name: roomName, host: true, hostId: user.id };
    setActiveRoom(roomData);
    setMyColor("red");
    setGameMode("lobby");
    
    const gChannel = supabase.channel(`ludo_room_${roomCode}`, {
      config: { presence: { key: user.id } }
    });
    
    gChannel.on('presence', { event: 'sync' }, async () => {
      const state = gChannel.presenceState();
      const playersList = extractPresencePlayers(state);
      updateLobbyPlayersList(playersList);
      
      const me = playersList.find((p: any) => p.id === user.id);
      if (me) {
        setMyColor(me.colorSlot || null);
        setIsReady(me.isReady || false);

        if (!me.colorSlot) {
          const color = findFreeColorSlot(playersList, user.id, true);
          if (color) {
            await gChannel.track({ ...me, colorSlot: color });
          }
        } else {
          // Resolve conflicts
          const conflictingPlayer = playersList.find(p => p.id !== user.id && p.colorSlot === me.colorSlot);
          if (conflictingPlayer && !me.isHost) {
            const shouldIYield = conflictingPlayer.isHost || conflictingPlayer.id < user.id;
            if (shouldIYield) {
              await gChannel.track({ ...me, colorSlot: null, isReady: false });
            }
          }
        }
      }
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await gChannel.track({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          isHost: true,
          colorSlot: "red",
          isReady: true
        });
      }
    });
    
    setGameChannel(gChannel);
  };

  const handleJoinRoomById = (roomId: string) => {
    if (!user) return;
    const roomCode = roomId.toUpperCase();
    const roomData = { id: roomCode, name: "Online Room", host: false };
    setActiveRoom(roomData);
    setGameMode("lobby");
    
    const gChannel = supabase.channel(`ludo_room_${roomCode}`, {
      config: { presence: { key: user.id } }
    });
    
    gChannel.on('presence', { event: 'sync' }, async () => {
      const state = gChannel.presenceState();
      const playersList = extractPresencePlayers(state);
      updateLobbyPlayersList(playersList);
      
      const me = playersList.find((p: any) => p.id === user.id);
      if (me) {
        setMyColor(me.colorSlot || null);
        setIsReady(me.isReady || false);

        if (!me.colorSlot) {
          const color = findFreeColorSlot(playersList, user.id, false);
          if (color) {
            await gChannel.track({ ...me, colorSlot: color });
          } else {
            showToast("Room is full!");
            handleLeaveRoom(); // Escape hatch
            return;
          }
        } else {
          // Resolve conflicts
          const conflictingPlayer = playersList.find(p => p.id !== user.id && p.colorSlot === me.colorSlot);
          if (conflictingPlayer && !me.isHost) {
            const shouldIYield = conflictingPlayer.isHost || conflictingPlayer.id < user.id;
            if (shouldIYield) {
              await gChannel.track({ ...me, colorSlot: null, isReady: false });
            }
          }
        }
      }
    })
    .on('broadcast', { event: 'start_game' }, ({ payload }) => {
      setRoomPlayers(payload.roomPlayers);
      setGameMode("live");
      setTokens(payload.tokens);
      setWinner(null);
      setTurn("red");
    })
    .on('broadcast', { event: 'roll_dice' }, ({ payload }) => {
      setDice(payload.result);
    })
    .on('broadcast', { event: 'update_room_players' }, ({ payload }) => {
      setRoomPlayers(payload.roomPlayers);
    })
    .on('broadcast', { event: 'next_turn' }, ({ payload }) => {
      setTurn(payload.nextColor);
      setDice(null);
    })
    .on('broadcast', { event: 'move_token' }, ({ payload }) => {
      forceMoveToken(payload.color, payload.tokenIdx, payload.newTokens, payload.extraTurn, payload.isWin, payload.winnerColor);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await gChannel.track({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          isHost: false,
          colorSlot: null,
          isReady: false
        });
      }
    });
    
    setGameChannel(gChannel);
  };

  const startLiveGame = () => {
    if (!gameChannel) return;
    
    const nonHosts = lobbyPlayers.filter((p: any) => !p.isHost);
    
    if (nonHosts.length === 0) {
      showToast("Waiting for at least one player to join!");
      return;
    }

    const allReady = nonHosts.every((p: any) => p.isReady);
    if (!allReady) {
      showToast("Waiting for all players to be Ready!");
      return;
    }

    const compiledPlayers: any = {
      red: { id: "bot_red", name: "Red Bot (AI)", isBot: true },
      green: { id: "bot_green", name: "Green Bot (AI)", isBot: true },
      yellow: { id: "bot_yellow", name: "Yellow Bot (AI)", isBot: true },
      blue: { id: "bot_blue", name: "Blue Bot (AI)", isBot: true }
    };

    lobbyPlayers.forEach((p: any) => {
      if (p.colorSlot) {
        compiledPlayers[p.colorSlot] = { id: p.id, name: p.name, isBot: false };
      }
    });

    const initialTokens = {
      red: [-1, -1, -1, -1],
      green: [-1, -1, -1, -1],
      yellow: [-1, -1, -1, -1],
      blue: [-1, -1, -1, -1]
    };
    
    gameChannel.send({
      type: 'broadcast',
      event: 'start_game',
      payload: {
        roomPlayers: compiledPlayers,
        tokens: initialTokens
      }
    });
    
    setRoomPlayers(compiledPlayers);
    setGameMode("live");
    setTokens(initialTokens);
    setWinner(null);
    setTurn("red");
  };

  const handleLeaveRoom = async () => {
    if (gameChannel) {
      await supabase.removeChannel(gameChannel);
      setGameChannel(null);
    }
    setActiveRoom(null);
    setLobbyPlayers([]);
    setIsReady(false);
    setJoinCode("");
    setGameMode("setup");
  };

  const getPlayerName = (color: Color) => {
    if (gameMode === "local") {
      return `${color.charAt(0).toUpperCase() + color.slice(1)} Player`;
    }
    if (gameMode === "solo") {
      if (color === "red") return user?.firstName || "You";
      return `${color.charAt(0).toUpperCase() + color.slice(1)} Bot`;
    }
    if (gameMode === "team") {
      if (color === "red") return user?.firstName || "You";
      if (color === "yellow") return "Teammate (AI)";
      return `${color.charAt(0).toUpperCase() + color.slice(1)} Opponent (AI)`;
    }
    if (gameMode === "lobby" || gameMode === "live") {
      if (gameMode === "lobby") {
        const p = lobbyPlayers.find((player: any) => player.colorSlot === color);
        if (p) return p.name;
        if (color === "red" && activeRoom?.host) {
          return user ? `${user.firstName} ${user.lastName}` : "Host";
        }
        // Fallback if not host, check activeRoom.id (which is host's ID)
        if (color === "red" && activeRoom) {
          const hostPlayer = lobbyPlayers.find((player: any) => player.id === activeRoom.id);
          if (hostPlayer) return hostPlayer.name;
        }
      }
      return roomPlayers[color]?.name || "AI Bot";
    }
    return "AI Bot";
  };

  const shareRoomLink = () => {
    if (typeof window !== "undefined" && activeRoom) {
      const link = `${window.location.origin}/ludo?room=${activeRoom.id}`;
      navigator.clipboard.writeText(link);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 3000);
    }
  };

  // Build a fast lookup map for token positions
  const tokenCoordinatesMap = useMemo(() => {
    const map = new Map<string, {color: Color, idx: number}[]>();
    
    COLORS.forEach(color => {
      tokens[color].forEach((t, idx) => {
        if (t === -1 || t === 200) return; // Ignore bases/finished here, they are handled separately
        
        let key = "";
        if (t >= 0 && t < 52) {
          // On path track
          const coord = PATH[t];
          if (coord) key = `${coord.r},${coord.c}`;
        } else if (t >= 100 && t < 105) {
          // In home stretch
          const coord = HOME_STRETCH[color]?.[t - 100];
          if (coord) key = `${coord.r},${coord.c}`;
        }
        
        if (key) {
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push({color, idx});
        }
      });
    });
    
    return map;
  }, [tokens]);

  // Render board cell tokens list helper
  const getCellTokens = (r: number, c: number) => {
    return tokenCoordinatesMap.get(`${r},${c}`) || [];
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfbf7] dark:bg-background">
      {/* Header bar */}
      <div className="px-4 pt-6 pb-4 border-b border-border flex items-center justify-between bg-card shadow-sm z-10">
        <Button onClick={() => {
          if (gameMode === "setup") {
            router.push('/quizzes');
          } else if (gameMode === "lobby" || gameMode === "live") {
            handleLeaveRoom();
          } else {
            setGameMode("setup");
          }
        }} variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold font-serif text-foreground">Journey to Emmaus</h1>
        <div className="w-10 h-10 rounded-full gradient-life text-white flex items-center justify-center shadow-md">🎲</div>
      </div>

      {gameMode === "setup" ? (
        <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-3xl gradient-life flex items-center justify-center mx-auto shadow-2xl mb-6 halo-glow text-5xl">🎲</div>
            <h2 className="text-3xl font-extrabold font-serif mb-2 text-foreground">Bible Ludo</h2>
            <p className="text-muted-foreground text-sm">Race your tokens to the heavenly kingdom by answering scripture trivia!</p>
          </div>

          <div className="space-y-4">
            <Button onClick={() => { setGameMode("solo"); initializeRoomPlayers("solo"); setTokens({red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], blue: [-1,-1,-1,-1]}); setWinner(null); }} className="w-full h-16 rounded-2xl bg-card border-2 border-border/60 justify-start px-6 hover:border-primary/50 text-left flex gap-4 transition">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Users className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-foreground">Solo vs AI</p>
                <p className="text-xs text-muted-foreground font-normal">Play against 3 computer bots</p>
              </div>
            </Button>
            
            <Button onClick={() => { setGameMode("team"); initializeRoomPlayers("team"); setTokens({red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], blue: [-1,-1,-1,-1]}); setWinner(null); }} className="w-full h-16 rounded-2xl bg-card border-2 border-border/60 justify-start px-6 hover:border-primary/50 text-left flex gap-4 transition">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center"><Trophy className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-foreground">2v2 Team Mode <Badge className="ml-2 text-[10px] gradient-gold border-0">40 Grace Points</Badge></p>
                <p className="text-xs text-muted-foreground font-normal">You & Yellow vs Green & Blue</p>
              </div>
            </Button>

            <Button onClick={() => { setGameMode("local"); initializeRoomPlayers("local"); setTokens({red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], blue: [-1,-1,-1,-1]}); setWinner(null); }} className="w-full h-16 rounded-2xl bg-card border-2 border-border/60 justify-start px-6 hover:border-primary/50 hover:shadow-md transition text-left flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center"><Dices className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-foreground">Pass & Play (Group)</p>
                <p className="text-xs text-muted-foreground font-normal">Play locally with up to 4 friends</p>
              </div>
            </Button>

            <Button onClick={() => setGameMode("lobby")} className="w-full h-16 rounded-2xl bg-card border-2 border-border/60 justify-start px-6 hover:border-primary/50 hover:shadow-md transition text-left flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center"><Users className="w-5 h-5" /></div>
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
            <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto shadow-md mb-4 text-white">
               <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold font-serif mb-1 text-foreground">Play Online</h2>
            <p className="text-muted-foreground text-sm">Join a friend's room or create a new one</p>
          </div>
          
          {!activeRoom ? (
            <div className="space-y-6 bg-card rounded-3xl p-6 border shadow-sm">
              <Button onClick={handleCreateRoom} className="w-full h-14 rounded-2xl gradient-gold text-white font-bold text-lg shadow-md halo-glow flex items-center justify-center transition-all hover:scale-[1.02]">
                <Plus className="w-5 h-5 mr-2" /> Create Private Room
              </Button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase font-bold tracking-wider">OR</span>
                <div className="flex-grow border-t border-border"></div>
              </div>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Enter 6-digit Room Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full h-14 bg-muted border-2 border-border/60 rounded-2xl px-6 text-center text-xl font-bold tracking-widest uppercase focus:border-primary focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 placeholder:font-normal placeholder:tracking-normal placeholder:text-base"
                />
                <Button 
                  onClick={() => {
                    if (joinCode.length >= 3) handleJoinRoomById(joinCode);
                    else showToast("Please enter a valid room code");
                  }} 
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold text-base"
                >
                  Join Room
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border p-6 text-center card-holy relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 gradient-gold" />
              
              <div className="mb-6 mt-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Room Code</p>
                <div className="inline-flex items-center justify-center bg-muted border-2 border-border/80 rounded-xl px-6 py-3 cursor-pointer hover:bg-muted/80 transition-colors" onClick={shareRoomLink}>
                   <span className="text-3xl font-black tracking-[0.2em] text-foreground">{activeRoom.id}</span>
                   {inviteCopied ? <Check className="w-5 h-5 ml-4 text-green-500 animate-scale" /> : <Share2 className="w-5 h-5 ml-4 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Click code to copy direct invite link, or share the code</p>
              </div>
              
              {/* Connected Slots List */}
              <div className="space-y-3 mb-8 text-left">
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-2">Players Joined</p>
                
                {/* Users without a color yet */}
                {lobbyPlayers.filter((p: any) => !p.colorSlot).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 border-dashed border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase bg-stone-200 text-stone-500">...</div>
                      <span className="text-sm font-semibold text-muted-foreground">{p.name} (Joining...)</span>
                    </div>
                  </div>
                ))}

                {COLORS.map((color) => {
                  const player = lobbyPlayers.find((p: any) => p.colorSlot === color);
                  const hasPlayer = player !== undefined;
                  const isUser = player?.id === user?.id;
                  
                  const colors = {
                    red: "text-red-500 bg-red-500/10 border-red-500/20",
                    green: "text-green-500 bg-green-500/10 border-green-500/20",
                    yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
                    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20"
                  };

                  return (
                    <div 
                      key={color} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition",
                        hasPlayer ? "bg-card border-border/80" : "bg-muted/40 border-dashed border-border/60 opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase", colors[color])}>
                          {color[0]}
                        </div>
                        <span className={cn("text-sm font-semibold", hasPlayer ? "text-foreground" : "text-muted-foreground")}>
                          {hasPlayer ? `${player.name} ${isUser ? "(You)" : ""}` : `Waiting for player...`}
                        </span>
                      </div>
                      
                      {hasPlayer ? (
                        <div className="flex items-center gap-2">
                          {player.isHost ? (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-bold">
                              Host
                            </Badge>
                          ) : (
                            <Badge className={cn(
                              "text-[9px] font-bold border",
                              player.isReady 
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                : "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400 border-zinc-500/20"
                            )}>
                              {player.isReady ? "Ready" : "Not Ready"}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-medium">Empty</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Lobby Action Buttons */}
              <div className="space-y-3">
                {!activeRoom.host && (
                  <Button 
                    onClick={toggleReady} 
                    className={cn(
                      "w-full h-12 rounded-xl font-bold text-base shadow-md transition",
                      isReady ? "bg-zinc-500 hover:bg-zinc-600 text-white" : "gradient-gold text-white halo-glow"
                    )}
                  >
                    {isReady ? "Cancel Ready" : "I am Ready"}
                  </Button>
                )}

                {activeRoom.host && (
                  <Button onClick={startLiveGame} className="w-full h-12 rounded-xl gradient-gold text-white font-bold text-base shadow-md halo-glow hover:scale-[1.02] transition-transform">
                    Start Game Now
                  </Button>
                )}
                
                <Button onClick={handleLeaveRoom} variant="ghost" className="w-full h-10 rounded-xl text-muted-foreground">
                  Leave Room
                </Button>
              </div>
            </div>
          )}

        </div>
      ) : (
        <>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center pb-32">
          
          {/* Status Bar */}
          <div className="w-full max-w-[400px] mb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between bg-card rounded-2xl p-3 border shadow-sm">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${BG_COLORS[turn]} shadow-inner border-2 border-black/10`} />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Current Turn</p>
                  <p className="font-bold text-sm leading-none capitalize text-foreground">
                    {getPlayerName(turn)} {gameMode === "live" && turn === myColor && " (You)"}
                  </p>
                  {dice === 6 && (
                    <p className="text-[10px] text-amber-500 font-bold mt-1 animate-pulse">
                      📖 Answering Trivia...
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {isRolling ? (
                  <motion.div 
                    animate={{ rotateX: 360, rotateY: 360, scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
                  >
                    <Dices className="w-10 h-10 text-primary drop-shadow-md" />
                  </motion.div>
                ) : dice ? (
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-10 h-10 bg-gradient-to-br from-card to-muted border-2 border-primary rounded-xl flex items-center justify-center text-xl font-black text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  >
                    {dice}
                  </motion.div>
                ) : (
                  <Button 
                    onClick={() => handleRollClick()} 
                    disabled={gameMode === "live" && turn !== myColor}
                    size="sm"
                    className={`rounded-xl font-bold ${((gameMode === "local" || (gameMode !== "live" && turn === "red")) || (gameMode === "live" && turn === myColor)) ? "gradient-gold shadow-md halo-glow" : "bg-muted text-muted-foreground"}`}
                  >
                    Roll
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 px-2 opacity-80">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Up Next:</span>
              <div className={`w-3 h-3 rounded-full ${BG_COLORS[COLORS[(COLORS.indexOf(turn) + 1) % 4]]} shadow-inner border border-black/10`} />
              <span className="text-[11px] text-muted-foreground font-semibold capitalize">
                {getPlayerName(COLORS[(COLORS.indexOf(turn) + 1) % 4])} {gameMode === "live" && COLORS[(COLORS.indexOf(turn) + 1) % 4] === myColor && "(You)"}
              </span>
            </div>
          </div>

          {/* Ludo Premium Board */}
          <div 
            className="bg-white/40 dark:bg-black/40 backdrop-blur-xl p-3 rounded-[2rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/10 relative select-none ring-1 ring-amber-500/20"
            style={{ width: "min(100%, 400px)", aspectRatio: "1/1" }}
          >
            <div className="w-full h-full grid rounded-xl overflow-hidden shadow-inner bg-stone-100/50 dark:bg-neutral-900/50" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)` }}>
              {/* 1. Four corner Bases */}
              {COLORS.map(color => {
                const isTurn = turn === color;
                const playerName = getPlayerName(color);
                
                const baseThemes = {
                  red: {
                    border: isTurn ? "border-red-500 ring-4 ring-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "border-red-500/20",
                    bg: "bg-gradient-to-br from-red-100 via-red-50 to-white dark:from-red-950/40 dark:via-red-900/20 dark:to-black/40",
                    text: "text-red-700 dark:text-red-400 drop-shadow-sm",
                    pockets: "bg-red-500/5 border-red-200/50 dark:border-red-800/30 shadow-inner"
                  },
                  green: {
                    border: isTurn ? "border-green-500 ring-4 ring-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.6)]" : "border-green-500/20",
                    bg: "bg-gradient-to-br from-green-100 via-green-50 to-white dark:from-green-950/40 dark:via-green-900/20 dark:to-black/40",
                    text: "text-green-700 dark:text-green-400 drop-shadow-sm",
                    pockets: "bg-green-500/5 border-green-200/50 dark:border-green-800/30 shadow-inner"
                  },
                  yellow: {
                    border: isTurn ? "border-yellow-500 ring-4 ring-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.6)]" : "border-yellow-500/20",
                    bg: "bg-gradient-to-br from-amber-100 via-amber-50 to-white dark:from-yellow-950/40 dark:via-yellow-900/20 dark:to-black/40",
                    text: "text-amber-700 dark:text-amber-400 drop-shadow-sm",
                    pockets: "bg-amber-500/5 border-amber-200/50 dark:border-yellow-800/30 shadow-inner"
                  },
                  blue: {
                    border: isTurn ? "border-blue-500 ring-4 ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.6)]" : "border-blue-500/20",
                    bg: "bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-blue-950/40 dark:via-blue-900/20 dark:to-black/40",
                    text: "text-blue-700 dark:text-blue-400 drop-shadow-sm",
                    pockets: "bg-blue-500/5 border-blue-200/50 dark:border-blue-800/30 shadow-inner"
                  }
                };
                
                const theme = baseThemes[color];
                
                const gridPositions = {
                  red: { gridRow: '1/7', gridColumn: '1/7' },
                  green: { gridRow: '1/7', gridColumn: '10/16' },
                  yellow: { gridRow: '10/16', gridColumn: '10/16' },
                  blue: { gridRow: '10/16', gridColumn: '1/7' }
                };
                
                const avatarEmojis = { red: "👑", green: "🕊️", yellow: "⭐", blue: "🛡️" };

                return (
                  <div
                    key={`base-${color}`}
                    style={gridPositions[color]}
                    className={cn(
                      "rounded-xl border bg-gradient-to-br p-1.5 flex flex-col justify-between overflow-hidden transition duration-300",
                      theme.bg, theme.border
                    )}
                  >
                    {/* Player Info Header */}
                    <div className="flex items-center justify-between gap-1 border-b border-black/5 pb-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs shrink-0">{avatarEmojis[color]}</span>
                        <span className={cn("text-[9px] font-extrabold truncate", theme.text)}>
                          {playerName}
                        </span>
                      </div>
                      {isTurn && (
                        <span className="text-[7px] font-black uppercase bg-primary text-primary-foreground px-1 py-0.5 rounded animate-pulse shrink-0">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Base Pockets */}
                    <div className={cn("flex-1 mt-1 rounded-lg border border-dashed flex items-center justify-center p-1", theme.pockets)}>
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => {
                          const tokenPos = tokens[color][i];
                          const inBase = tokenPos === -1;
                          
                          return (
                            <div 
                              key={`pocket-${color}-${i}`}
                              className="w-7 h-7 rounded-full border border-black/5 bg-white/40 dark:bg-black/20 shadow-inner flex items-center justify-center relative"
                            >
                              {inBase && (
                                <motion.button
                                  layoutId={`token-${color}-${i}`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                  whileHover={{ scale: 1.1, y: -2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    const canPlayerClick = gameMode === "local" || (gameMode !== "live" && turn === "red") || (gameMode === "live" && turn === myColor);
                                    if (canPlayerClick && turn === color && dice !== null && !trivia && canMove(color, i, dice)) {
                                      moveToken(color, i, dice);
                                    }
                                  }}
                                  className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white cursor-pointer z-20",
                                    BG_COLORS[color], BORDER_COLORS[color],
                                    (((gameMode === "local" || (gameMode !== "live" && turn === "red") || (gameMode === "live" && turn === myColor)) && turn === color && dice && canMove(color, i, dice) && !trivia) ? "animate-pulse ring-4 ring-primary/50" : "")
                                  )}
                                >
                                  {i + 1}
                                </motion.button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 2. Center Home Panel */}
              <div 
                style={{ gridRow: '7/10', gridColumn: '7/10' }}
                className="bg-stone-50 dark:bg-muted border border-black/5 rounded relative flex items-center justify-center shadow-inner overflow-hidden"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 pointer-events-none">
                  {/* Left - Red */}
                  <polygon points="0,0 50,50 0,100" fill="#ef4444" opacity="0.15" />
                  <line x1="0" y1="0" x2="50" y2="50" stroke="#ef4444" strokeWidth="0.5" opacity="0.3" />
                  <line x1="0" y1="100" x2="50" y2="50" stroke="#ef4444" strokeWidth="0.5" opacity="0.3" />

                  {/* Top - Green */}
                  <polygon points="0,0 50,50 100,0" fill="#22c55e" opacity="0.15" />
                  <line x1="0" y1="0" x2="50" y2="50" stroke="#22c55e" strokeWidth="0.5" opacity="0.3" />
                  <line x1="100" y1="0" x2="50" y2="50" stroke="#22c55e" strokeWidth="0.5" opacity="0.3" />

                  {/* Right - Yellow */}
                  <polygon points="100,0 50,50 100,100" fill="#eab308" opacity="0.15" />
                  <line x1="100" y1="0" x2="50" y2="50" stroke="#eab308" strokeWidth="0.5" opacity="0.3" />
                  <line x1="100" y1="100" x2="50" y2="50" stroke="#eab308" strokeWidth="0.5" opacity="0.3" />

                  {/* Bottom - Blue */}
                  <polygon points="0,100 50,50 100,100" fill="#3b82f6" opacity="0.15" />
                  <line x1="0" y1="100" x2="50" y2="50" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
                  <line x1="100" y1="100" x2="50" y2="50" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
                </svg>
                
                <div className="absolute w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-md text-sm pointer-events-none z-10 border border-amber-300">
                  👑
                </div>

                {/* Red Finished (Left side) */}
                {tokens.red.filter(t => t === 200).length > 0 && (
                  <div className="absolute left-1 flex flex-col gap-0.5 z-20">
                    {tokens.red.map((t, i) => t === 200 && (
                      <div key={`fin-red-${i}`} className="w-2 h-2 rounded-full bg-red-500 border border-white dark:border-black shadow-sm" />
                    ))}
                  </div>
                )}
                {/* Green Finished (Top side) */}
                {tokens.green.filter(t => t === 200).length > 0 && (
                  <div className="absolute top-1 flex gap-0.5 z-20">
                    {tokens.green.map((t, i) => t === 200 && (
                      <div key={`fin-green-${i}`} className="w-2 h-2 rounded-full bg-green-500 border border-white dark:border-black shadow-sm" />
                    ))}
                  </div>
                )}
                {/* Yellow Finished (Right side) */}
                {tokens.yellow.filter(t => t === 200).length > 0 && (
                  <div className="absolute right-1 flex flex-col gap-0.5 z-20">
                    {tokens.yellow.map((t, i) => t === 200 && (
                      <div key={`fin-yellow-${i}`} className="w-2 h-2 rounded-full bg-yellow-500 border border-white dark:border-black shadow-sm" />
                    ))}
                  </div>
                )}
                {/* Blue Finished (Bottom side) */}
                {tokens.blue.filter(t => t === 200).length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5 z-20">
                    {tokens.blue.map((t, i) => t === 200 && (
                      <div key={`fin-blue-${i}`} className="w-2 h-2 rounded-full bg-blue-500 border border-white dark:border-black shadow-sm" />
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Path tracks */}
              {PATH.map((p, idx) => {
                const cellTokens = getCellTokens(p.r, p.c);
                let cellClass = "bg-stone-50 dark:bg-muted border border-black/5 hover:bg-stone-100 transition-colors";
                
                // Starting slots
                if (p.r === 6 && p.c === 1) cellClass = "bg-red-100 border-red-300 relative dark:bg-red-950/20";
                else if (p.r === 1 && p.c === 8) cellClass = "bg-green-100 border-green-300 relative dark:bg-green-950/20";
                else if (p.r === 8 && p.c === 13) cellClass = "bg-yellow-100 border-yellow-300 relative dark:bg-yellow-950/20";
                else if (p.r === 13 && p.c === 6) cellClass = "bg-blue-100 border-blue-300 relative dark:bg-blue-950/20";
                
                const isStart = (p.r === 6 && p.c === 1) || (p.r === 1 && p.c === 8) || (p.r === 8 && p.c === 13) || (p.r === 13 && p.c === 6);
                
                return (
                  <div 
                    key={`path-${idx}`} 
                    style={{ gridRowStart: p.r + 1, gridColumnStart: p.c + 1 }}
                    className={`relative flex items-center justify-center ${cellClass}`}
                  >
                    {isStart && <span className="absolute inset-0 flex items-center justify-center text-[10px] opacity-25 select-none">⭐️</span>}
                    {cellTokens.map((t, tokenIdx) => (
                      <motion.button
                        key={`${t.color}-${t.idx}`}
                        layoutId={`token-${t.color}-${t.idx}`}
                        onClick={() => {
                          const canPlayerClick = gameMode === "local" || (gameMode !== "live" && turn === "red") || (gameMode === "live" && turn === myColor);
                          if (canPlayerClick && turn === t.color && dice !== null && !trivia && canMove(turn, t.idx, dice)) {
                            moveToken(turn, t.idx, dice);
                          }
                        }}
                        className={cn(
                          `w-[70%] h-[70%] rounded-full shadow-md border flex items-center justify-center text-[8px] font-bold text-white absolute z-10 transition duration-300 ease-in-out`,
                          BG_COLORS[t.color], BORDER_COLORS[t.color],
                          (((gameMode === "local" || (gameMode !== "live" && turn === "red") || (gameMode === "live" && turn === myColor)) && turn === t.color && dice && canMove(turn, t.idx, dice) && !trivia) ? "animate-pulse ring-2 ring-primary ring-offset-1 scale-110" : "")
                        )}
                        style={{ 
                          transform: cellTokens.length > 1 ? `translate(${(tokenIdx%2)*12 - 6}px, ${Math.floor(tokenIdx/2)*12 - 6}px) scale(0.9)` : "scale(1)"
                        }}
                      >
                        {t.idx + 1}
                      </motion.button>
                    ))}
                  </div>
                );
              })}

              {/* 4. Home stretches */}
              {COLORS.flatMap(color => 
                HOME_STRETCH[color].map((p, sIdx) => {
                  const cellTokens = getCellTokens(p.r, p.c);
                  
                  const homeStretchClasses = {
                    red: "bg-red-50 border-red-200/50 dark:bg-red-950/10",
                    green: "bg-green-50 border-green-200/50 dark:bg-green-950/10",
                    yellow: "bg-yellow-50 border-yellow-200/50 dark:bg-yellow-950/10",
                    blue: "bg-blue-50 border-blue-200/50 dark:bg-blue-950/10"
                  };
                  
                  return (
                    <div
                      key={`stretch-${color}-${sIdx}`}
                      style={{ gridRowStart: p.r + 1, gridColumnStart: p.c + 1 }}
                      className={`relative flex items-center justify-center border border-black/5 ${homeStretchClasses[color]}`}
                    >
                      {cellTokens.map((t, tokenIdx) => (
                        <motion.button
                          key={`${t.color}-${t.idx}`}
                          layoutId={`token-${t.color}-${t.idx}`}
                          onClick={() => {
                            const canPlayerClick = gameMode === "local" || (gameMode !== "live" && turn === "red") || (gameMode === "live" && turn === myColor);
                            if (canPlayerClick && turn === t.color && dice !== null && !trivia && canMove(turn, t.idx, dice)) {
                              moveToken(turn, t.idx, dice);
                            }
                          }}
                          className={cn(
                            `w-[70%] h-[70%] rounded-full shadow-md border flex items-center justify-center text-[8px] font-bold text-white absolute z-10 transition duration-300 ease-in-out`,
                            BG_COLORS[t.color], BORDER_COLORS[t.color],
                            (((gameMode === "local" || (gameMode !== "live" && turn === "red") || (gameMode === "live" && turn === myColor)) && turn === t.color && dice && canMove(turn, t.idx, dice) && !trivia) ? "animate-pulse ring-2 ring-primary ring-offset-1 scale-110" : "")
                          )}
                          style={{ 
                            transform: cellTokens.length > 1 ? `translate(${(tokenIdx%2)*12 - 6}px, ${Math.floor(tokenIdx/2)*12 - 6}px) scale(0.9)` : "scale(1)"
                          }}
                        >
                          {t.idx + 1}
                        </motion.button>
                      ))}
                    </div>
                  );
                })
              )}
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
                className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl card-holy border border-border/80"
              >
                <div className="w-12 h-12 rounded-full gradient-spirit flex items-center justify-center mx-auto mb-4 text-white">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-center font-serif mb-2 text-foreground">Bible Trivia Challenge!</h2>
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
                        className="w-full h-11 justify-start font-semibold text-sm border-border/80 text-foreground"
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
                <h2 className="text-3xl font-bold font-serif mb-2 capitalize text-foreground animate-scale">
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

        {/* Game Event Overlay */}
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <AnimatePresence>
            {gameEvent && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className={cn(
                  "px-6 py-3 rounded-full shadow-2xl border backdrop-blur-sm flex items-center gap-2 font-bold text-sm text-white",
                  gameEvent.type === "capture" 
                    ? "bg-red-600/90 border-red-500/50" 
                    : "bg-emerald-600/90 border-emerald-500/50"
                )}
              >
                <span>{gameEvent.type === "capture" ? "⚔️" : "🎉"}</span>
                <span>{gameEvent.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Toasts */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-xs pointer-events-none">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 text-xs font-bold p-3 rounded-xl shadow-xl border border-zinc-700/50 dark:border-zinc-300/50 backdrop-blur-sm pointer-events-auto flex items-center justify-between"
              >
                <span>{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        </>
      )}
    </div>
  );
}
