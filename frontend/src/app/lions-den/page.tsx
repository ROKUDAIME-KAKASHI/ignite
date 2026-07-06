"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { awardXP } from "@/app/actions/gamification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Key, Skull, Trophy, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

const RIDDLES = [
  {
    question: "I was thrown into a pit, sold for silver, and eventually ruled over those who betrayed me. Who am I?",
    answer: "Joseph"
  },
  {
    question: "I stood tall and proud, a giant among men, but a single smooth stone brought me to my end. Who am I?",
    answer: "Goliath"
  },
  {
    question: "I was commanded to build a massive wooden box, though there was no rain in sight. Who am I?",
    answer: "Noah"
  }
];

export default function LionsDenPage() {
  const { user, setUser } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [guess, setGuess] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setCurrentLevel(0);
    setGuess("");
    setErrorMsg("");
    setAttemptsLeft(5);
    setGameState("playing");
  };

  const handleGuess = () => {
    if (gameState !== "playing" || !guess.trim()) return;

    const currentRiddle = RIDDLES[currentLevel];
    if (guess.trim().toLowerCase() === currentRiddle.answer.toLowerCase()) {
      // Correct
      setErrorMsg("");
      setGuess("");
      if (currentLevel + 1 >= RIDDLES.length) {
        handleWin();
      } else {
        setCurrentLevel(l => l + 1);
      }
    } else {
      // Wrong
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);
      if (newAttempts <= 0) {
        setGameState("lost");
      } else {
        setErrorMsg("Incorrect! The lions are getting closer...");
      }
    }
  };

  const handleWin = async () => {
    setGameState("won");
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    if (!user) return;
    
    setSubmitting(true);
    const res = await awardXP(30, "Escaped the Lion's Den");
    if (res.success && res.xp) {
      setUser({ ...user, xp: res.xp, level: res.level });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Dark scary background for the den */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-background to-background -z-10" />

      <div className="container max-w-2xl mx-auto px-4 pt-24">
        <div className="text-center mb-10">
          <Badge className="mb-4 gradient-dawn text-white border-0">Escape Room</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif mb-4">The Lion's Den</h1>
          <p className="text-muted-foreground">Answer the riddles correctly to escape before the lions wake up.</p>
        </div>

        <div className={cn(
          "bg-card rounded-3xl p-8 border shadow-2xl relative z-10 card-holy mb-8 text-center transition-colors duration-500",
          attemptsLeft <= 2 && gameState === "playing" ? "border-red-500/50 shadow-red-500/10" : "border-border/50"
        )}>
          
          {gameState === "playing" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-8">
                <Badge variant="outline" className="font-bold">Door {currentLevel + 1} of {RIDDLES.length}</Badge>
                <div className="flex items-center gap-2 text-sm font-bold text-red-500">
                  <Skull className="w-4 h-4" /> {attemptsLeft} attempts left
                </div>
              </div>

              <p className="text-xl md:text-2xl font-serif leading-relaxed mb-10 italic">
                "{RIDDLES[currentLevel].question}"
              </p>

              <div className="max-w-xs mx-auto">
                <Input 
                  placeholder="Who am I?" 
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                  className="h-12 text-center text-lg font-bold rounded-xl mb-4 focus-visible:ring-amber-600 border-2 border-border/50"
                  autoFocus
                />
                
                {errorMsg && <p className="text-red-500 text-sm font-bold animate-bounce mb-4">{errorMsg}</p>}

                <Button 
                  onClick={handleGuess}
                  disabled={!guess.trim()}
                  className="w-full h-12 rounded-xl gradient-dawn text-white font-bold text-lg halo-glow"
                >
                  <Key className="w-5 h-5 mr-2" /> Unlock Door
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 animate-in zoom-in duration-500">
              {gameState === "won" ? (
                <div>
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-bold font-serif text-green-500 mb-4">You Escaped!</h3>
                  <p className="text-muted-foreground text-lg mb-8">Daniel's God has protected you. +30 XP</p>
                </div>
              ) : (
                <div>
                  <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Skull className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-bold font-serif text-red-500 mb-4">Game Over</h3>
                  <p className="text-muted-foreground text-lg mb-8">The lions woke up.</p>
                </div>
              )}
              
              <Button onClick={startNewGame} disabled={submitting} className="h-14 px-10 rounded-2xl gradient-gold text-white font-bold text-lg">
                {submitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <RotateCcw className="w-6 h-6 mr-2" />}
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
