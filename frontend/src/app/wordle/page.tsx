"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trophy, RotateCcw } from "lucide-react";
import Link from "next/link";
import { awardXP } from "@/app/actions/gamification";
import { useAuth } from "@/context/AuthContext";

const BIBLICAL_WORDS = [
  { word: "GRACE", clue: "Unmerited favor from God" },
  { word: "FAITH", clue: "Confidence in what we hope for" },
  { word: "JESUS", clue: "The Son of God" },
  { word: "DAVID", clue: "A man after God's own heart" },
  { word: "MOSES", clue: "Led the Israelites out of Egypt" },
  { word: "PEACE", clue: "A fruit of the Spirit, beyond understanding" },
  { word: "CROSS", clue: "Symbol of Jesus' sacrifice" },
  { word: "GLORY", clue: "Magnificence and great beauty of God" },
  { word: "MERCY", clue: "Compassion or forgiveness shown" },
  { word: "ANGEL", clue: "Heavenly messenger" },
  { word: "ALTAR", clue: "Structure for offering sacrifices" },
  { word: "BIBLE", clue: "The Holy Scriptures" },
  { word: "PETER", clue: "The rock upon which the church was built" },
  { word: "MARYS", clue: "The mother of Jesus (plural/possessive variant)" },
  { word: "SPIRIT", clue: "The Holy ____" },
  { word: "BLOOD", clue: "Shed for the remission of sins" },
  { word: "BREAD", clue: "Jesus is the ____ of life" },
  { word: "WATER", clue: "Used in baptism" },
  { word: "LIGHT", clue: "Let there be ____" },
  { word: "TRUTH", clue: "The way, the ____, and the life" },
  { word: "RESURRECTION", clue: "Rising from the dead" },
  { word: "COMMANDMENT", clue: "Divine rule" },
  { word: "REVELATION", clue: "The last book of the Bible" },
  { word: "BETHLEHEM", clue: "Birthplace of Jesus" }
];

let initialWord = { word: "GRACE", clue: "Unmerited favor from God" };
if (typeof window !== "undefined") {
  initialWord = BIBLICAL_WORDS[Math.floor(Math.random() * BIBLICAL_WORDS.length)];
}
const MAX_GUESSES = 6;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
];

export default function WordlePage() {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const { user, setUser } = useAuth();
  const [targetWordObj, setTargetWordObj] = useState(initialWord);
  const targetWord = targetWordObj.word;
  const wordLength = targetWord.length;
  const [awarded, setAwarded] = useState(false);

  useEffect(() => {
    // Select randomly on client mount to avoid hydration mismatch
    setTargetWordObj(BIBLICAL_WORDS[Math.floor(Math.random() * BIBLICAL_WORDS.length)]);
  }, []);

  const resetGame = () => {
    setTargetWordObj(BIBLICAL_WORDS[Math.floor(Math.random() * BIBLICAL_WORDS.length)]);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setAwarded(false);
  };

  const submitGuess = useCallback(async () => {
    if (currentGuess.length !== wordLength) return;
    
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (currentGuess === targetWord) {
      setWon(true);
      setGameOver(true);
      if (user && !awarded) {
        setAwarded(true);
        const res = await awardXP(10, "Won Scripture Wordle");
        if (res.success && res.xp) setUser({ ...user, xp: res.xp, level: res.level });
      }
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
    }
  }, [currentGuess, guesses, user, awarded, setUser, targetWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === "Enter") {
        submitGuess();
      } else if (e.key === "Backspace") {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < wordLength) {
        setCurrentGuess(prev => (prev + e.key).toUpperCase());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameOver, submitGuess, wordLength]);

  const onKeyPress = (key: string) => {
    if (gameOver) return;
    if (key === "ENTER") {
      submitGuess();
    } else if (key === "BACKSPACE") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < wordLength) {
      setCurrentGuess(prev => (prev + key).toUpperCase());
    }
  };

  const getLetterStatus = (letter: string, index: number, guess: string) => {
    if (targetWord[index] === letter) return "correct";
    if (targetWord.includes(letter)) return "present";
    return "absent";
  };

  const getKeyStatus = (key: string) => {
    const statuses: Record<string, string> = {};
    guesses.forEach(guess => {
      Array.from(guess).forEach((char, i) => {
        if (targetWord[i] === char) statuses[char] = "correct";
        else if (targetWord.includes(char) && statuses[char] !== "correct") statuses[char] = "present";
        else if (statuses[char] !== "correct" && statuses[char] !== "present") statuses[char] = "absent";
      });
    });
    return statuses[key] || "unused";
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <div className="px-4 pt-6 pb-4 border-b border-border flex items-center justify-between bg-card">
        <Link href="/quizzes" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold font-serif text-foreground">Scripture Wordle</h1>
        <div className="w-10 h-10 rounded-full gradient-royal text-white flex items-center justify-center shadow-md">🧩</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-6 max-w-md w-full">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Clue</p>
          <p className="text-lg font-serif text-foreground font-semibold bg-card border border-border p-3 rounded-xl shadow-sm">{targetWordObj.clue}</p>
        </div>
        <div className="grid gap-2 mb-8">
          {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
            const guess = guesses[rowIndex];
            const isCurrentRow = rowIndex === guesses.length;
            const rowStr = guess || (isCurrentRow ? currentGuess : "");

            return (
              <div key={rowIndex} className="flex gap-2">
                {Array.from({ length: wordLength }).map((_, colIndex) => {
                  const letter = rowStr[colIndex] || "";
                  let status = "empty";
                  if (guess) status = getLetterStatus(letter, colIndex, guess);
                  else if (letter) status = "tbd";

                  return (
                    <motion.div 
                      key={colIndex}
                      initial={guess ? { rotateX: 90 } : false}
                      animate={guess ? { rotateX: 0 } : { scale: letter ? 1.05 : 1 }}
                      transition={{ delay: guess ? colIndex * 0.1 : 0 }}
                      className={`flex items-center justify-center font-bold font-serif rounded-xl border-2 transition-colors ${
                        wordLength > 7 ? "w-10 h-10 md:w-12 md:h-12 text-xl" : "w-14 h-14 md:w-16 md:h-16 text-2xl"
                      } ${
                        status === "correct" ? "bg-green-500 border-green-600 text-white shadow-lg" :
                        status === "present" ? "bg-yellow-500 border-yellow-600 text-white shadow-lg" :
                        status === "absent" ? "bg-stone-500 border-stone-600 text-white" :
                        status === "tbd" ? "border-primary text-foreground" :
                        "border-border bg-card text-foreground"
                      }`}
                    >
                      {letter}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {gameOver && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center bg-card p-6 rounded-2xl border border-border/60 card-holy shadow-xl max-w-sm w-full">
            <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-3 shadow-lg halo-glow text-3xl">
              {won ? "🏆" : "😔"}
            </div>
            <h2 className="text-2xl font-extrabold font-serif mb-1">{won ? "You Won!" : "Game Over"}</h2>
            <p className="text-muted-foreground mb-4">The word was <strong className="text-foreground">{targetWord}</strong></p>
            {won && <p className="text-amber-600 font-bold mb-4">+10 Grace Points Awarded!</p>}
            <Button onClick={resetGame} className="mt-6 w-full h-11 rounded-xl gradient-royal text-white font-bold">
              <RotateCcw className="w-4 h-4 mr-2" /> Play Again
            </Button>
          </motion.div>
        )}

        <div className="w-full max-w-md px-1 mt-auto pb-4">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex justify-center gap-1.5 mb-1.5">
              {row.map(key => {
                const status = getKeyStatus(key);
                return (
                  <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className={`h-12 rounded-lg font-bold text-sm transition-colors flex items-center justify-center ${
                      key === "ENTER" || key === "BACKSPACE" ? "px-3 bg-muted text-foreground" : "flex-1 max-w-[40px] " + (
                        status === "correct" ? "bg-green-500 text-white" :
                        status === "present" ? "bg-yellow-500 text-white" :
                        status === "absent" ? "bg-stone-500 text-white opacity-50" :
                        "bg-muted text-foreground hover:bg-muted-foreground/20"
                      )
                    }`}
                  >
                    {key === "BACKSPACE" ? "⌫" : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
