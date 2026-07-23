"use client";
import Image from 'next/image';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar as CalendarIcon, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { bookAppointment } from "./actions";

export default function AppointmentsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await bookAppointment(formData);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 bg-gradient-to-br from-stone-800 to-neutral-900">
        <div className="absolute inset-0 bg-[url('/header-image.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none flex flex-col items-center">
          <Image src="/header-image.png" width={400} height={200} priority className="h-16 sm:h-24 w-auto rounded-2xl shadow-2xl border-[3px] border-white/20 opacity-95 object-contain rotate-3 drop-shadow-xl mb-2 sm:mb-3" alt="Church emblem" />
          <div className="flex flex-col items-center text-center opacity-90 rotate-1">
            <span className="text-[6px] sm:text-[8px] font-extrabold text-white uppercase tracking-widest font-serif leading-tight text-shadow-sm">St. Gregorios Jacobite<br/>Syrian Orthodox Church</span>
            <span className="text-[5px] sm:text-[6px] text-white/80 uppercase tracking-widest mt-0.5 font-semibold text-shadow-sm">Hosa Road - Bangalore</span>
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">🗓️</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Meet the Priest</h1>
              <p className="text-stone-300 text-xs font-semibold uppercase tracking-wider">Spiritual Direction</p>
            </div>
          </div>
          <p className="text-stone-300/80 text-sm italic font-serif mt-2">
            "Therefore confess your sins to each other and pray for each other so that you may be healed." — James 5:16
          </p>
        </div>
      </div>

      <div className="px-4 pt-6 pb-12">
        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800/30 p-6 text-center card-holy shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold font-serif text-foreground mb-2">Request Sent</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Your appointment request has been sent. The parish office or priest will contact you soon to confirm the exact time.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="font-bold">
              Book Another Appointment
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-5 card-holy shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold font-serif text-foreground mb-1">Request an Appointment</h2>
              <p className="text-sm text-muted-foreground">
                Specific time slots will be available soon. For now, please indicate your preferred date and time, and we will get back to you to confirm.
              </p>
              {error && <p className="text-red-500 text-sm mt-3 font-semibold">{error}</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" /> Preferred Date
                </label>
                <input 
                  type="date" 
                  name="date"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500/50" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Preferred Time <span className="lowercase normal-case font-normal text-muted-foreground/70">(e.g., Morning, 3:00 PM)</span>
                </label>
                <input 
                  type="text" 
                  name="time"
                  placeholder="Anytime in the afternoon..." 
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500/50" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Purpose (Optional)
                </label>
                <textarea 
                  name="purpose"
                  placeholder="Confession, counseling, spiritual guidance..." 
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500/50 resize-none" 
                ></textarea>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold shadow-md transition"
              >
                {loading ? "Sending Request..." : "Request Appointment"}
              </Button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
