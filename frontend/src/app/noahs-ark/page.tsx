"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { awardXP } from "@/app/actions/gamification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Droplets, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const WORDS = [
  { word: "JERUSALEM", hint: "The Holy City" },
  { word: "GOLIATH", hint: "The giant defeated by David" },
  { word: "GENESIS", hint: "The first book of the Bible" },
  { word: "APOSTLE", hint: "One of the 12 chosen by Jesus" },
  { word: "BETHLEHEM", hint: "The birthplace of Jesus" },
  { word: "REVELATION", hint: "The final book of the Bible" },
  { word: "PROPHET", hint: "A messenger of God" },
  { word: "COVENANT", hint: "A sacred promise or agreement" }
];

export default function NoahsArkPage() {
  const { user, setUser } = useAuth();
  const [currentWordObj, setCurrentWordObj] = useState(WORDS[0]);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [submitting, setSubmitting] = useState(false);

  const MAX_WRONG = 6; // 6 stages of the flood

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWordObj(randomWord);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameState("playing");
  };

  const guess = (letter: string) => {
    if (gameState !== "playing" || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters).add(letter);
    setGuessedLetters(newGuessed);

    if (!currentWordObj.word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= MAX_WRONG) {
        setGameState("lost");
      }
    } else {
      // Check win
      const isWin = currentWordObj.word.split("").every(l => newGuessed.has(l) || l === " ");
      if (isWin) {
        setGameState("won");
        handleWin();
      }
    }
  };

  const handleWin = async () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    if (!user) return;
    setSubmitting(true);
    const res = await awardXP(15, "Saved Noah's Ark");
    if (res.success && res.xp) {
      setUser({ ...user, xp: res.xp, level: res.level });
    }
    setSubmitting(false);
  };

  const waterLevel = (wrongGuesses / MAX_WRONG) * 100;

  return (
    <div className="min-h-screen bg-background pb-20 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent -z-10" />
      
      {/* Flood Animation Background */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-blue-500/30 transition-all duration-1000 -z-10 flex items-start justify-center"
        style={{ height: `${waterLevel}%` }}
      >
        <div className="w-full h-4 bg-blue-400/50 animate-pulse" />
      </div>

      <div className="container max-w-2xl mx-auto px-4 pt-24">
        <div className="text-center mb-10">
          <Badge className="mb-4 gradient-spirit border-0">Noah's Ark</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif mb-4">Beat the Flood</h1>
          <p className="text-muted-foreground">Guess the biblical word before the floodwaters rise completely.</p>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl relative z-10 card-holy mb-8 text-center">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Hint</p>
          <p className="text-lg italic text-muted-foreground mb-8">"{currentWordObj.hint}"</p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {currentWordObj.word.split("").map((letter, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-10 h-12 md:w-14 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-bold font-serif rounded-xl border-2",
                  guessedLetters.has(letter) || gameState === "lost" 
                    ? "border-primary bg-primary/10 text-foreground" 
                    : "border-border bg-muted/50 text-transparent"
                )}
              >
                {guessedLetters.has(letter) || gameState === "lost" ? letter : ""}
              </div>
            ))}
          </div>

          {gameState === "playing" ? (
            <div className="flex flex-wrap justify-center gap-2">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => (
                <Button
                  key={letter}
                  onClick={() => guess(letter)}
                  disabled={guessedLetters.has(letter)}
                  variant={guessedLetters.has(letter) ? "secondary" : "outline"}
                  className="w-10 h-10 p-0 font-bold"
                >
                  {letter}
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-6 animate-in fade-in slide-in-from-bottom-4">
              {gameState === "won" ? (
                <div>
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold font-serif text-green-500 mb-2">You survived!</h3>
                  <p className="text-muted-foreground mb-6">The Ark is safe. +15 XP</p>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold font-serif text-red-500 mb-2">The flood came...</h3>
                  <p className="text-muted-foreground mb-6">The word was {currentWordObj.word}</p>
                </div>
              )}
              
              <Button onClick={startNewGame} disabled={submitting} className="h-12 px-8 rounded-xl gradient-gold text-white font-bold">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RotateCcw className="w-5 h-5 mr-2" />}
                Play Again
              </Button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-muted-foreground">Water Level: {wrongGuesses} / {MAX_WRONG}</p>
          <div className="w-full max-w-md mx-auto h-3 bg-muted rounded-full mt-2 overflow-hidden border border-border">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: \`\${waterLevel}%\` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
