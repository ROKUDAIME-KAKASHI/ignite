"use client";

import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { checkInToEvent, validateEvent } from "./actions";

export default function ScanPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [status, setStatus] = useState<"idle" | "scanning" | "processing" | "reflection" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventIdStr, setEventIdStr] = useState("");
  const [scanType, setScanType] = useState<"event" | "mission">("event");
  const [reflection, setReflection] = useState("");

  const handleScan = async (data: string) => {
    if (status !== "scanning" && status !== "idle") return;

    try {
      // Expecting URL format like: https://ignite.com/scan?eventId=123
      // Or just a raw ID if that's how we encode it. Let's try to extract eventId.
      let eventId = data;
      try {
        const url = new URL(data);
        const searchParams = new URLSearchParams(url.search);
        if (searchParams.has("eventId")) {
          eventId = searchParams.get("eventId")!;
        }
      } catch (e) {
        // Not a URL, maybe it's just the ID
      }

      setStatus("processing");
      
      const res = await validateEvent(eventId);
      
      if (res.error) {
        setMessage(res.error);
        setStatus("error");
      } else if (res.success) {
        setEventTitle(res.eventTitle || "Event");
        setEventIdStr(res.eventId || eventId);
        setScanType(res.type || "event");
        setStatus("reflection");
      }
    } catch (error) {
      setMessage("Invalid QR Code.");
      setStatus("error");
    }
  };

  const submitReflection = async () => {
    setStatus("processing");
    const res = await checkInToEvent(eventIdStr, reflection, scanType);
    if (res.error) {
      setMessage(res.error);
      setStatus("error");
    } else if (res.success && res.xp && res.level) {
      if (user) {
        setUser({ ...user, xp: res.xp, level: res.level });
      }
      setMessage(`+${scanType === "mission" ? "Mission" : "150"} Grace Points Earned!`);
      setStatus("success");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white h-full">
      
      {/* ── Header ── */}
      <div className="px-5 pt-8 pb-6 bg-slate-900 border-b border-white/10 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold">QR Check-in</h1>
            <p className="text-xs text-white/60">Scan to earn Grace Points</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        
        {status === "idle" || status === "scanning" ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
            <div className="rounded-3xl overflow-hidden border-4 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.3)] bg-black relative">
              <Scanner
                onScan={(result) => handleScan(result[0].rawValue)}
                styles={{ container: { width: "100%", height: "350px", position: "relative" } }}
              />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none z-10" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
              <ScanLine className="w-8 h-8 text-amber-400 animate-pulse" />
              <h2 className="font-bold text-lg">Scan Event Code</h2>
              <p className="text-sm text-white/50">Point your camera at the QR code displayed at the event to check in instantly.</p>
            </div>
          </motion.div>
        ) : status === "processing" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
            <p className="font-bold text-lg">Verifying Check-in...</p>
          </motion.div>
        ) : status === "reflection" ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center bg-slate-900 p-6 rounded-3xl border border-slate-700 w-full max-w-md text-left">
            <h2 className="font-extrabold text-2xl font-serif mb-2 text-white w-full">Sermon Notes</h2>
            <p className="font-semibold text-amber-400 mb-4 w-full">{eventTitle}</p>
            <p className="text-sm text-white/70 mb-4 w-full">To complete your check-in and earn your 150 Grace Points, please share one key takeaway or verse from today's sermon/event.</p>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
              rows={4}
              placeholder="What did you learn today?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
            <button 
              onClick={submitReflection}
              disabled={reflection.trim().split(/\s+/).filter(w => w.length > 0).length < 3 || reflection.trim().length < 10}
              className="mt-6 px-6 py-3 gradient-gold text-white hover:opacity-90 disabled:opacity-50 disabled:grayscale rounded-xl font-bold transition w-full flex justify-center"
            >
              Submit & Check-in
            </button>
          </motion.div>
        ) : status === "success" ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center bg-green-950/30 p-8 rounded-3xl border border-green-900/50 w-full max-w-md">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-extrabold text-2xl font-serif mb-1 text-green-400">Checked In!</h2>
            <p className="font-semibold text-lg mb-4">{eventTitle}</p>
            <div className="px-4 py-2 rounded-xl gradient-gold text-white font-bold text-lg shadow-lg">
              {message}
            </div>
            <button 
              onClick={() => router.push("/dashboard")}
              className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors w-full"
            >
              Back to Dashboard
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center bg-red-950/30 p-8 rounded-3xl border border-red-900/50 w-full max-w-md">
            <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="font-bold text-xl mb-2 text-red-400">Check-in Failed</h2>
            <p className="text-white/70 mb-8">{message}</p>
            <button 
              onClick={() => setStatus("idle")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors w-full"
            >
              Try Again
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
