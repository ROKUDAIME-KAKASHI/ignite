"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { awardXP } from "@/app/actions/gamification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, Trophy, Brain, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import Link from "next/link";
import { TRIVIA_QUESTIONS } from "@/lib/trivia";

type Card = {
  id: number;
  pairId: number;
  content: string;
  fullText: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const NUM_PAIRS = 8;

export default function MemoryMatchPage() {
  const { user, setUser } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [submitting, setSubmitting] = useState(false);
  const [hoveredCardText, setHoveredCardText] = useState("");

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem("ignite_memory_match_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCards(parsed.cards);
        setMoves(parsed.moves);
        setMatches(parsed.matches);
        setGameState(parsed.gameState);
        return;
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    startNewGame();
  }, []);

  // Save state on change
  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem("ignite_memory_match_state", JSON.stringify({
        cards,
        moves,
        matches,
        gameState
      }));
    }
  }, [cards, moves, matches, gameState]);

  const startNewGame = () => {
    localStorage.removeItem("ignite_memory_match_state");
    // Pick 8 random questions from the central trivia bank
    const shuffledQuestions = [...TRIVIA_QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, NUM_PAIRS);

    const deck: Card[] = [];
    let idCounter = 1;
    shuffledQuestions.forEach((qObj, index) => {
      const pairId = index + 1;
      // Pair the question with its correct answer
      deck.push({ 
        id: idCounter++, 
        pairId, 
        content: qObj.q.length > 40 ? qObj.q.slice(0, 37) + "..." : qObj.q, 
        fullText: qObj.q,
        isFlipped: false, 
        isMatched: false 
      });
      deck.push({ 
        id: idCounter++, 
        pairId, 
        content: qObj.a, 
        fullText: qObj.a,
        isFlipped: false, 
        isMatched: false 
      });
    });
    // Shuffle
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIdx([]);
    setMoves(0);
    setMatches(0);
    setGameState("playing");
    setHoveredCardText("");
  };

  const handleCardClick = (index: number) => {
    if (gameState !== "playing") return;
    if (flippedIdx.length === 2) return; // Wait for animation
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIdx, index];
    setFlippedIdx(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (newCards[first].pairId === newCards[second].pairId) {
        // Match!
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIdx([]);
          
          const newMatchCount = matches + 1;
          setMatches(newMatchCount);
          if (newMatchCount === NUM_PAIRS) {
            handleWin();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const unflipCards = [...newCards];
          unflipCards[first].isFlipped = false;
          unflipCards[second].isFlipped = false;
          setCards(unflipCards);
          setFlippedIdx([]);
        }, 1000);
      }
    }
  };

  const handleWin = async () => {
    setGameState("won");
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    if (!user) return;
    setSubmitting(true);
    // Base 20 XP, bonus if they did it in fewer moves
    let xp = 20;
    if (moves <= 12) xp += 15;
    else if (moves <= 16) xp += 10;

    const res = await awardXP(xp, "Completed Bible Memory Match");
    if (res.success && res.xp) {
      setUser({ ...user, xp: res.xp, level: res.level });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent -z-10" />
      
      <div className="px-4 pt-6 pb-4 flex items-center justify-between relative z-10">
        <Link href="/quizzes" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10" /> {/* Spacer for centering if needed */}
      </div>

      <div className="container max-w-3xl mx-auto px-4 pt-4">
        <div className="text-center mb-10">
          <Badge className="mb-4 gradient-spirit border-0">Memory Match</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif mb-4">Find the Pairs</h1>
          <p className="text-muted-foreground">Match the biblical figures with their famous stories.</p>
        </div>

        <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border/50 shadow-sm mb-6">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Moves</p>
            <p className="text-2xl font-bold font-serif">{moves}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Matches</p>
            <p className="text-2xl font-bold font-serif text-primary">{matches} / {NUM_PAIRS}</p>
          </div>
          <Button onClick={startNewGame} variant="outline" size="icon" className="rounded-xl">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Display full text container for readability */}
        <div className="min-h-[50px] bg-muted/40 rounded-xl p-3 border border-border/40 text-center mb-6 flex items-center justify-center">
          <p className="text-xs font-medium text-muted-foreground font-serif">
            {hoveredCardText || "Hover over or tap a card to read its full text."}
          </p>
        </div>

        {gameState === "won" ? (
          <div className="bg-card rounded-3xl p-10 border border-border/50 shadow-xl text-center card-holy mb-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold font-serif text-green-500 mb-2">Great Memory!</h3>
            <p className="text-muted-foreground mb-2">You matched all pairs in {moves} moves.</p>
            <p className="text-primary font-bold mb-8">+{moves <= 12 ? 35 : moves <= 16 ? 30 : 20} XP</p>
            
            <Button onClick={startNewGame} disabled={submitting} className="h-12 px-8 rounded-xl gradient-gold text-white font-bold">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RotateCcw className="w-5 h-5 mr-2" />}
              Play Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8">
            {cards.map((card, index) => (
              <div 
                key={card.id} 
                onClick={() => handleCardClick(index)}
                onMouseEnter={() => setHoveredCardText(card.fullText)}
                onMouseLeave={() => setHoveredCardText("")}
                className="aspect-square perspective-1000 cursor-pointer"
              >
                <div className={cn(
                  "w-full h-full relative transition duration-500 preserve-3d",
                  (card.isFlipped || card.isMatched) ? "rotate-y-180" : ""
                )}>
                  {/* Front (Hidden) */}
                  <div className="absolute inset-0 backface-hidden bg-primary/10 border-2 border-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-primary/20 transition-colors shadow-sm">
                    <Brain className="w-8 h-8 text-primary/50" />
                  </div>
                  
                  {/* Back (Revealed) */}
                  <div className={cn(
                    "absolute inset-0 backface-hidden rotate-y-180 rounded-xl md:rounded-2xl flex items-center justify-center p-2 text-center shadow-md border-2 border-border/50",
                    card.isMatched ? "gradient-gold text-white border-0" : "bg-card text-foreground"
                  )}>
                    <p className={cn(
                      "font-serif font-bold text-sm md:text-lg leading-tight",
                      card.isMatched && "text-white"
                    )}>
                      {card.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
