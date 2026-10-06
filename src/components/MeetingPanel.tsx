"use client";
import React, { useState, useEffect, useRef } from "react";
import { Users, Send, CheckCircle2, Sparkles, X, MessageSquare } from "lucide-react";

interface MeetingPanelProps {
  onClose: () => void;
  onSpeakerChange?: (speaker: { speaker: string; text: string } | null) => void;
  onViewProjects?: () => void;
}

const TOPIC_SUGGESTIONS = [
  "Peluncuran Varian Baru Flores Bajawa Honey",
  "Strategi Scale-Up Iklan Meta & Konten Reels",
  "Evaluasi Pengiriman Kurir Kargo ke Jakarta",
  "Ekspansi Kemitraan Suplai B2B ke 3 Kafe Baru"
];

export default function MeetingPanel({ onClose, onSpeakerChange, onViewProjects }: MeetingPanelProps) {
  const [topic, setTopic] = useState("");
  const [discussion, setDiscussion] = useState<{ speaker: string; text: string }[]>([]);
  const [activeTurn, setActiveTurn] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [discussion, activeTurn]);

  // Turn-by-turn animation synchronization with Canvas
  useEffect(() => {
    if (discussion.length === 0 || activeTurn < 0) return;

    if (activeTurn < discussion.length) {
      const current = discussion[activeTurn];
      if (onSpeakerChange) {
        onSpeakerChange(current);
      }

      const timer = setTimeout(() => {
        setActiveTurn(prev => prev + 1);
      }, 3500); // 3.5s per turn for canvas speech bubble

      return () => clearTimeout(timer);
    } else {
      // Finished all turns
      setIsCompleted(true);
      if (onSpeakerChange) {
        onSpeakerChange(null);
      }
    }
  }, [discussion, activeTurn, onSpeakerChange]);

  const startMeeting = async (selectedTopic?: string) => {
    const finalTopic = selectedTopic || topic;
    if (!finalTopic.trim()) return;

    setIsLoading(true);
    setDiscussion([]);
    setActiveTurn(-1);
    setIsCompleted(false);

    try {
      const res = await fetch("/api/internal/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: finalTopic,
          clientTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta"
        })
      });
      const json = await res.json();
      if (json.success && json.data.discussion) {
        setDiscussion(json.data.discussion);
        setActiveTurn(0);
      }
    } catch (err) {
      setDiscussion([{ speaker: "Rama (GM)", text: "Koneksi rapat terganggu. Mari kita tinjau kembali jadwalnya." }]);
      setActiveTurn(0);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleDiscussion = activeTurn >= 0 ? discussion.slice(0, activeTurn + 1) : [];

  return (
    <div className="flex flex-col h-full bg-[#161a2b] border-l border-slate-800 text-slate-300 font-mono text-sm">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-[#121624]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Users size={18} />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Cupping Table Meeting</h2>
            <div className="text-[11px] text-slate-400">Multi-Agent Synchronized Chamber</div>
          </div>
        </div>
        <button 
          onClick={() => {
            if (onSpeakerChange) onSpeakerChange(null);
            onClose();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Discussion Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {discussion.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col justify-center items-center text-center space-y-4 text-slate-400">
            <div className="text-4xl p-4 bg-slate-800/40 rounded-full border border-slate-700/50">☕</div>
            <div className="space-y-1 max-w-xs">
              <div className="font-bold text-white text-sm">Para Agen Sudah Berkumpul</div>
              <p className="text-xs text-slate-400">
                Ketik topik rapat atau pilih agenda strategis berikut untuk memulai diskusi hidup antar divisi.
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div className="w-full space-y-2 pt-2">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 text-left font-semibold">
                Agenda Prioritas Hari Ini:
              </div>
              {TOPIC_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTopic(sug);
                    startMeeting(sug);
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-[#1e2336] hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-indigo-300 transition-all flex items-center gap-2 group"
                >
                  <Sparkles size={13} className="text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate">{sug}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs text-indigo-300 animate-pulse">Menghubungkan agen ke Cupping Table...</div>
          </div>
        )}

        {visibleDiscussion.map((msg, idx) => {
          const isRama = msg.speaker.includes("Rama");
          const isCurrent = idx === activeTurn && !isCompleted;

          return (
            <div 
              key={idx} 
              className={`flex flex-col space-y-1 transition-all duration-300 ${
                isRama ? "items-start" : "items-end"
              }`}
            >
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[11px] font-bold ${isCurrent ? "text-amber-400 animate-pulse" : "text-indigo-300"}`}>
                  {msg.speaker}
                </span>
                {isCurrent && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-semibold">
                    Speaking on Canvas
                  </span>
                )}
              </div>

              <div className={`p-3 rounded-xl max-w-[90%] text-xs leading-relaxed border transition-all ${
                isCurrent 
                  ? "border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.15)]" 
                  : "border-slate-800"
              } ${
                isRama 
                  ? "bg-[#1e2336] text-slate-200 rounded-tl-none" 
                  : "bg-indigo-950/60 text-indigo-100 rounded-tr-none border-indigo-900/50"
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {isCompleted && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs space-y-2.5 flex flex-col">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <div className="font-bold text-white">Rapat Selesai & Tindak Lanjut Terbuat!</div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  Perintah Anda sebagai pemilik usaha telah otomatis didelegasikan ke tim dan tercatat di database status <span className="text-amber-400 font-bold">IN_PROGRESS</span>.
                </div>
              </div>
            </div>
            {onViewProjects && (
              <button
                onClick={() => {
                  if (onSpeakerChange) onSpeakerChange(null);
                  onClose();
                  onViewProjects();
                }}
                className="w-full py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/50 hover:border-emerald-400 text-emerald-200 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <span>📋 Buka Kanban Board (Menu Projects)</span>
              </button>
            )}
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#121624] border-t border-slate-800">
        <form onSubmit={(e) => { e.preventDefault(); startMeeting(); }} className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ketik topik rapat..."
            disabled={isLoading || (activeTurn >= 0 && !isCompleted)}
            className="flex-1 px-3 py-2 bg-[#1e2336] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !topic.trim() || (activeTurn >= 0 && !isCompleted)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-xs disabled:opacity-50 flex items-center gap-1.5 shadow"
          >
            <Send size={13} />
            <span>Mulai</span>
          </button>
        </form>
      </div>
    </div>
  );
}
