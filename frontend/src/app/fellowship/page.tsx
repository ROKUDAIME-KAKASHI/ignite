"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMessages, sendMessage, deleteMessage } from "@/app/actions/globalChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, MessageCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function FellowshipChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const data = await getMessages(50);
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 5 seconds for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    const content = inputText;
    setInputText(""); // Optimistic clear

    // Optimistic UI update
    const optimisticMessage = {
      id: "temp-" + Date.now(),
      content,
      createdAt: new Date().toISOString(),
      user: {
        id: user?.id,
        firstName: user?.displayName?.split(" ")[0] || "You",
        lastName: "",
        level: user?.level || 1,
      }
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    const res = await sendMessage(content);
    if (!res.success) {
      console.error(res.error);
      // Revert optimistic update if failed
      setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
      setInputText(content);
    } else {
      await fetchMessages(); // Fetch real data to get exact timestamps and IDs
    }
    setSending(false);
  };

  const handleDelete = async (msgId: string) => {
    // Optimistic delete
    setMessages(prev => prev.filter(m => m.id !== msgId));
    const res = await deleteMessage(msgId);
    if (!res.success) {
      console.error(res.error);
      await fetchMessages(); // Re-fetch to restore if failed
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6 bg-gradient-to-br from-amber-800 to-amber-600 shadow-md shrink-0">
        <div className="absolute inset-0 bg-[url('/header-image.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white font-serif">Global Fellowship</h1>
              <p className="text-amber-200 text-xs font-bold uppercase tracking-wider">Voice of the Faithful</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 relative">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
            <MessageCircle className="w-12 h-12 mb-4 text-muted-foreground" />
            <h3 className="font-bold text-foreground">No messages yet</h3>
            <p className="text-sm text-muted-foreground">Be the first to share a testimony or word of encouragement!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.user.id === user?.id;
            const initials = (msg.user.firstName?.[0] || "") + (msg.user.lastName?.[0] || "");
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex w-full gap-2", isMe ? "justify-end" : "justify-start")}
              >
                {!isMe && (
                  <Avatar className="w-8 h-8 shrink-0 mt-auto mb-1 border border-border shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("flex flex-col max-w-[75%]", isMe ? "items-end" : "items-start")}>
                  {!isMe && (
                    <div className="flex items-center gap-1 mb-1 px-1">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {msg.user.firstName} {msg.user.lastName}
                      </span>
                      <span className="text-[8px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                        Lvl {msg.user.level}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl shadow-sm relative text-sm",
                      isMe 
                        ? "bg-amber-600 text-white rounded-br-sm" 
                        : "bg-card text-foreground border border-border/50 rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {(isMe || user?.role === "ADMIN" || user?.role === "PRIEST") && (
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className="text-[9px] text-red-500/70 hover:text-red-500 transition-colors flex items-center"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t shrink-0 pb-safe pb-24">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share a word of encouragement..."
            className="flex-1 rounded-full bg-muted/50 border-border/50 focus-visible:ring-amber-500 h-12 px-5 text-sm shadow-inner pr-12"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="absolute right-1 top-1 w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm p-0 flex items-center justify-center transition"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
