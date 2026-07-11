"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, User as UserIcon, Loader2, BookOpen, MessageSquare, X, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

import { askAbba, getPublicChatSuggestions } from "@/app/actions/chat";

const DEFAULT_SUGGESTIONS = [
  "Explain the Holy Trinity",
  "How should I pray effectively?",
  "What does Orthodox mean?",
  "Tell me about St. Thomas"
];

export function GlobalChat() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hide the floating button on game/quiz pages
  const isHidden = pathname.startsWith("/quizzes") || pathname.startsWith("/ludo") || pathname.startsWith("/wordle");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: `Peace be with you${user ? `, ${user.firstName}` : ""}! I am Abba, your spiritual guide AI. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const speak = (textToSay: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = textToSay.replace(/[*_~\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      
      let preferredVoice = 
        voices.find(v => v.name.includes('Google UK English Male')) || 
        voices.find(v => v.name.includes('David') || v.name.includes('Male')) || 
        voices.find(v => v.lang === 'en-GB' && v.name.includes('Male'));
        
      utterance.rate = 0.75; // Slower, calmer pace
      utterance.pitch = 0.6; // Deeper, resonant, heavenly voice
      
      if (!preferredVoice) preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    getPublicChatSuggestions().then(res => {
      if (res && res.length > 0) setSuggestions(res);
    });
  }, []);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Close the modal automatically if navigating to a game
  useEffect(() => {
    if (isHidden) {
      setTimeout(() => setIsOpen(false), 0);
    }
  }, [isHidden]);

  // Stop speaking when chat is closed
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  if (isHidden) return null;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await askAbba(userText, history);

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: response.success && response.text ? response.text : "I apologize, but I am having trouble connecting right now.",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);

    if (isVoiceEnabled && response.success && response.text) {
      speak(response.text);
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[60]" />
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[60] flex flex-col items-end gap-2 pointer-events-auto cursor-grab active:cursor-grabbing"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full gradient-spirit text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all p-0 flex items-center justify-center halo-glow"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-[80px] md:bottom-24 right-4 md:right-8 z-50 w-[calc(100vw-32px)] md:w-[400px] h-[550px] max-h-[calc(100vh-100px)] bg-background rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border/50 ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="px-5 py-4 gradient-spirit shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-white font-serif leading-tight">Abba AI</h1>
                  <p className="text-orange-100 text-[10px] font-bold uppercase tracking-wider">Spiritual Guide</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsVoiceEnabled(!isVoiceEnabled);
                    if (isVoiceEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8"
                  title={isVoiceEnabled ? "Mute Voice" : "Enable Voice"}
                >
                  {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 bg-muted/20 overflow-y-auto min-h-0">
              <div className="space-y-5 pb-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isAi = msg.role === "ai";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                          "flex gap-2.5 max-w-[85%]",
                          isAi ? "mr-auto" : "ml-auto flex-row-reverse"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 shrink-0 rounded-full flex items-center justify-center shadow-sm",
                          isAi ? "gradient-spirit text-white" : "bg-muted text-muted-foreground"
                        )}>
                          {isAi ? <Sparkles className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                        </div>
                        
                        <div className={cn(
                          "p-3 rounded-2xl text-sm leading-relaxed max-w-full overflow-hidden flex flex-col",
                          isAi 
                            ? "bg-card border border-border/50 text-foreground shadow-sm rounded-tl-sm card-holy" 
                            : "gradient-gold text-white shadow-md rounded-tr-sm"
                        )}>
                          <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                            <p className={cn("whitespace-pre-wrap break-words", isAi && "font-serif text-[14px]")}>{msg.content}</p>
                          </div>
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider mt-1.5 block",
                            isAi ? "text-muted-foreground" : "text-white/70 text-right"
                          )}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2.5 max-w-[85%] mr-auto"
                    >
                      <div className="w-7 h-7 shrink-0 rounded-full gradient-spirit text-white flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-card border border-border/50 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={scrollRef} className="h-px w-full" />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-background border-t border-border shrink-0">
              {messages.length === 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                  {suggestions.map(sug => (
                    <button
                      key={sug}
                      onClick={() => { setInput(sug); }}
                      className="shrink-0 px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary transition-colors rounded-full border border-border/50 text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3 h-3" /> {sug}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2 relative">
                <Input 
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="h-11 rounded-xl bg-card border-2 pr-12 text-sm shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className={cn(
                    "absolute right-1.5 w-8 h-8 rounded-lg transition-all duration-200",
                    input.trim() ? "gradient-gold shadow-md halo-glow" : "bg-muted text-muted-foreground"
                  )}
                >
                  {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
