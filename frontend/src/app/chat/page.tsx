"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, User as UserIcon, Loader2, BookOpen, Volume2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: `Peace be with you${user ? `, ${user.firstName}` : ""}! I am Abba, your spiritual guide AI. I am here to help clarify ideas, theology, and concepts related to the Christian faith. What is on your heart today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPublicChatSuggestions().then(res => {
      if (res && res.length > 0) setSuggestions(res);
    });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      
      // Clean up text for smoother reading (remove asterisks, brackets, etc.)
      const cleanText = text.replace(/[*_~\[\]]/g, '');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      
      let preferredVoice = 
        voices.find(v => v.name.includes('Google UK English Male')) || 
        voices.find(v => v.name.includes('David') || v.name.includes('Male')) || 
        voices.find(v => v.lang === 'en-GB' && v.name.includes('Male'));
        
      utterance.rate = 0.95; // Natural calm pace
      utterance.pitch = 0.85; // Natural deep voice
      
      // Fallback
      if (!preferredVoice) preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice) utterance.voice = preferredVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateAIResponse = (userText: string): string => {
    const text = userText.toLowerCase();
    
    if (text.includes("trinity")) {
      return "The Holy Trinity is the central mystery of the Christian faith. It teaches that God is one in essence, but exists in three distinct persons: the Father, the Son, and the Holy Spirit. They are not three gods, but one God. Think of it like the sun: there is the star itself (Father), the light it emits (Son), and the heat you feel (Holy Spirit). All distinct, yet all one sun.";
    }
    if (text.includes("pray")) {
      return "Prayer is simply a conversation with God. A great way to start is the Lord's Prayer, or by using the ACTS model: Adoration (praising God), Confession (admitting our sins), Thanksgiving (thanking Him for blessings), and Supplication (asking for needs). The Jesus Prayer ('Lord Jesus Christ, Son of God, have mercy on me, a sinner') is also a powerful Orthodox tradition.";
    }
    if (text.includes("orthodox")) {
      return "The word 'Orthodox' comes from two Greek words: 'orthos' (right or true) and 'doxa' (belief or glory). The Orthodox Church traces its roots directly back to Jesus Christ and the Apostles, seeking to preserve the original faith, traditions, and teachings of the early Church without alteration.";
    }
    if (text.includes("thomas")) {
      return "St. Thomas was one of the Twelve Apostles of Jesus. Though famously remembered as 'Doubting Thomas' because he initially doubted the Resurrection, he made one of the greatest confessions of faith: 'My Lord and my God!' Tradition holds that he traveled to India in AD 52 to spread the Gospel, establishing the foundation of the faith in Kerala.";
    }
    
    return "That is a wonderful question. The depths of theology and faith are vast. While I am still learning to answer complex theological questions, I encourage you to read the Scriptures or speak with your priest to dive deeper into this topic!";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking and responding
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: generateAIResponse(userMessage.content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // 1.5 - 2.5s delay
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      
      {/* Header */}
      <div className="px-5 pt-8 pb-6 gradient-spirit shrink-0 relative z-10 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white font-serif">Abba AI</h1>
            <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Theological Guide & Companion</p>
          </div>
        </div>
        
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-2xl mx-auto pb-6">
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAi = msg.role === "ai";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    isAi ? "mr-auto" : "ml-auto flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 shrink-0 rounded-full flex items-center justify-center shadow-sm",
                    isAi ? "gradient-spirit text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {isAi ? <Sparkles className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>
                  
                  <div className={cn(
                    "p-3.5 rounded-2xl text-sm leading-relaxed",
                    isAi 
                      ? "bg-card border border-border/50 text-foreground shadow-sm rounded-tl-sm card-holy" 
                      : "gradient-gold text-white shadow-md rounded-tr-sm"
                  )}>
                    <p className={cn(isAi && "font-serif text-[15px]")}>{msg.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider",
                        isAi ? "text-muted-foreground" : "text-white/70"
                      )}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isAi && (
                        <button 
                          onClick={() => speakText(msg.content)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-full hover:bg-primary/10"
                          title="Listen to response"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%] mr-auto"
            >
              <div className="w-8 h-8 shrink-0 rounded-full gradient-spirit text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm rounded-tl-sm card-holy flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 pb-[5.5rem] md:pb-4 bg-background/80 backdrop-blur-md border-t border-border shrink-0">
        <div className="max-w-2xl mx-auto">
          {messages.length === 1 && (
            <div className="flex gap-2 p-2">
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
              placeholder="Ask Abba about faith, theology, or the church..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="h-12 rounded-2xl bg-card border-2 pr-12 text-sm shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary"
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className={cn(
                "absolute right-1.5 w-9 h-9 rounded-xl transition-all duration-200",
                input.trim() ? "gradient-gold shadow-md halo-glow" : "bg-muted text-muted-foreground"
              )}
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2 font-semibold">
            Abba AI can make mistakes. Please verify important theological concepts.
          </p>
        </div>
      </div>

    </div>
  );
}
