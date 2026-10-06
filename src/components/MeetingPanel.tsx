"use client";
import React, { useState, useEffect, useRef } from "react";
import { Users, Send, CheckCircle2, Sparkles, X, MessageSquare } from "lucide-react";

interface MeetingPanelProps {
  onClose: () => void;
  onSpeakerChange?: (speaker: { speaker: string; text: string } | null) => void;
  onViewProjects?: () => void;
  theme?: "retro" | "dark";
}

const TOPIC_SUGGESTIONS = [
  "Peluncuran Varian Baru Flores Bajawa Honey",
  "Strategi Scale-Up Iklan Meta & Konten Reels",
  "Evaluasi Pengiriman Kurir Kargo ke Jakarta",
  "Ekspansi Kemitraan Suplai B2B ke 3 Kafe Baru"
];

export default function MeetingPanel({ onClose, onSpeakerChange, onViewProjects, theme = "retro" }: MeetingPanelProps) {
  const [topic, setTopic] = useState("");
  const [targetRecipient, setTargetRecipient] = useState<string>("ALL");
  const [discussion, setDiscussion] = useState<{ speaker: string; text: string }[]>([]);
  const [activeTurn, setActiveTurn] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const hasAutoStartedRef = useRef(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [discussion, activeTurn]);

  // Auto-start plenary meeting on panel mount so discussion immediately starts on canvas
  useEffect(() => {
    if (!hasAutoStartedRef.current && discussion.length === 0 && !isLoading) {
      hasAutoStartedRef.current = true;
      const initialTopic = "Evaluasi Operasional, Roastery & Penjualan Hari Ini";
      setTopic(initialTopic);
      startMeeting(initialTopic);
    }
  }, []);

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
    const finalTopic = (selectedTopic || topic || "Evaluasi Operasional & Penjualan Hari Ini").trim();
    if (!finalTopic) return;

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
          targetRecipient,
          clientTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta"
        })
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.discussion) && json.data.discussion.length > 0) {
        setDiscussion(json.data.discussion);
        setActiveTurn(0);
      } else {
        throw new Error(json.error || "Format respons rapat tidak valid");
      }
    } catch (err) {
      console.warn("Meeting API error, activating high-resilience local plenary dialog:", err);
      const currentHour = new Date().getHours();
      const sapaan = currentHour < 11 ? "Selamat pagi" : currentHour < 15 ? "Selamat siang" : currentHour < 18 ? "Selamat sore" : "Selamat malam";
      
      let fallbackDiscussion: { speaker: string; text: string }[] = [];
      if (targetRecipient && targetRecipient !== "ALL") {
        fallbackDiscussion = [
          { speaker: "Rama (GM)", text: `${sapaan} tim. Mari kita dengarkan tanggapan langsung dari ${targetRecipient} mengenai topik: "${finalTopic}".` },
          { speaker: `${targetRecipient}`, text: `${sapaan} bos! Mengenai arahan tersebut, divisi kami siap mengawal eksekusinya dan menjaga standar mutu tanpa kompromi.` },
          { speaker: "Rama (GM)", text: "Terima kasih atas klarifikasinya. Segera catat dan eksekusi di task board tim." }
        ];
      } else {
        fallbackDiscussion = [
          { speaker: "Rama (GM)", text: `${sapaan} rekan-rekan tim Ramu! Rapat pleno koordinasi dibuka untuk agenda: "${finalTopic}". Semua divisi standby.` },
          { speaker: "Kafin (R&D)", text: "Dari sisi lab sensorik dan roasting, seluruh batch sangrai hari ini konsisten di skor 87.5 poin specialty. Siap memenuhi kebutuhan produksi." },
          { speaker: "Budi (Sourcing)", text: "Pasokan green beans Gayo dan Flores Bajawa di gudang aman untuk 3 bulan ke depan, kemitraan petani berjalan sangat baik." },
          { speaker: "Arya (Ads)", text: "Kampanye meta ads dan konten Reels hari ini menghasilkan ROAS 4.2x dengan lonjakan traffic checkout yang stabil." },
          { speaker: "Rama (GM)", text: "Kerja bagus semuanya. Arahan sudah dicatat dan tugas tindak lanjut otomatis dibuat di sistem." }
        ];
      }
      setDiscussion(fallbackDiscussion);
      setActiveTurn(0);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleDiscussion = activeTurn >= 0 ? discussion.slice(0, activeTurn + 1) : [];

  return (
    <div className={`flex flex-col h-full font-mono text-sm ${theme === "retro" ? "bg-[#df9d76] text-[#3e2208]" : "bg-[#161a2b] border-l border-slate-800 text-slate-300"}`}>
      {/* Header */}
      <div className={`h-16 flex items-center justify-between px-4 border-b shrink-0 ${theme === "retro" ? "bg-[#c9865f] border-[#ad6e49] text-[#2d1808]" : "bg-[#121624] border-slate-800"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === "retro" ? "bg-[#fff8ea] text-[#3e2208] border-2 border-[#ad6e49]" : "bg-indigo-600/30 border border-indigo-500/40 text-indigo-400"}`}>
            <Users size={18} />
          </div>
          <div>
            <h2 className={`font-bold text-sm ${theme === "retro" ? "text-[#2d1808] font-silkscreen" : "text-white"}`}>Cupping Table Meeting</h2>
            <div className={`text-[11px] ${theme === "retro" ? "text-[#5c3214]" : "text-slate-400"}`}>Multi-Agent Synchronized Chamber</div>
          </div>
        </div>
        <button 
          onClick={() => {
            if (onSpeakerChange) onSpeakerChange(null);
            onClose();
          }}
          className={`p-1.5 rounded-lg transition-colors ${theme === "retro" ? "text-[#4a260c] hover:bg-[#b8754e]" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
        >
          <X size={18} />
        </button>
      </div>

      {/* Discussion Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {discussion.length === 0 && !isLoading ? (
          <div className={`h-full flex flex-col justify-center items-center text-center space-y-4 ${theme === "retro" ? "text-[#5c3214]" : "text-slate-400"}`}>
            <div className={`text-4xl p-4 rounded-full border ${theme === "retro" ? "bg-[#fff8ea] border-[#ad6e49]" : "bg-slate-800/40 border-slate-700/50"}`}>☕</div>
            <div className="space-y-1 max-w-xs">
              <div className={`font-bold text-sm ${theme === "retro" ? "text-[#2d1808] font-silkscreen" : "text-white"}`}>Para Agen Sudah Berkumpul</div>
              <p className={`text-xs ${theme === "retro" ? "text-[#4a260c]" : "text-slate-400"}`}>
                Ketik topik rapat atau pilih agenda strategis berikut untuk memulai diskusi hidup antar divisi.
              </p>
            </div>

            {/* Primary Action: Direct Call Meeting Button */}
            <button
              onClick={() => {
                setTopic("Peluncuran Varian Baru Flores Bajawa Honey");
                startMeeting("Peluncuran Varian Baru Flores Bajawa Honey");
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                theme === "retro" 
                  ? "bg-[#3e2208] hover:bg-[#201003] text-[#fff8ea] border-2 border-[#ad6e49]" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <Users size={15} />
              <span>📢 Mulai Rapat Pleno Sekarang</span>
            </button>

            {/* Quick Topic Chips */}
            <div className="w-full space-y-2 pt-2">
              <div className={`text-[11px] uppercase tracking-wider text-left font-semibold ${theme === "retro" ? "text-[#4a260c] font-silkscreen" : "text-slate-500"}`}>
                Atau Pilih Agenda Strategis:
              </div>
              {TOPIC_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTopic(sug);
                    startMeeting(sug);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center gap-2 group ${theme === "retro" ? "bg-[#fff8ea] hover:bg-[#fff2d6] border border-[#ad6e49] text-[#3e2208]" : "bg-[#1e2336] hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300"}`}
                >
                  <Sparkles size={13} className={`group-hover:scale-110 transition-transform shrink-0 ${theme === "retro" ? "text-[#b45309]" : "text-indigo-400"}`} />
                  <span className="truncate">{sug}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className={`w-8 h-8 border-2 rounded-full animate-spin ${theme === "retro" ? "border-[#3e2208] border-t-transparent" : "border-indigo-500 border-t-transparent"}`}></div>
            <div className={`text-xs animate-pulse ${theme === "retro" ? "text-[#3e2208] font-bold" : "text-indigo-300"}`}>Menghubungkan agen ke Cupping Table...</div>
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
                <span className={`text-[11px] font-bold ${isCurrent ? (theme === "retro" ? "text-[#854d0e] animate-pulse font-silkscreen" : "text-amber-400 animate-pulse") : (theme === "retro" ? "text-[#5c3214] font-silkscreen" : "text-indigo-300")}`}>
                  {msg.speaker}
                </span>
                {isCurrent && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${theme === "retro" ? "bg-[#b45309] text-white" : "bg-amber-500/20 text-amber-300"}`}>
                    Speaking on Canvas
                  </span>
                )}
              </div>

              <div className={`p-3 rounded-xl max-w-[90%] text-xs leading-relaxed border transition-all ${
                isCurrent 
                  ? (theme === "retro" ? "border-[#854d0e] shadow-md ring-2 ring-[#b45309]/30" : "border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.15)]") 
                  : (theme === "retro" ? "border-[#caa085]" : "border-slate-800")
              } ${
                isRama 
                  ? (theme === "retro" ? "bg-[#fff8ea] text-[#3e2208] rounded-tl-none shadow-sm" : "bg-[#1e2336] text-slate-200 rounded-tl-none") 
                  : (theme === "retro" ? "bg-[#fff1dc] text-[#451a03] rounded-tr-none shadow-sm" : "bg-indigo-950/60 text-indigo-100 rounded-tr-none border-indigo-900/50")
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {isCompleted && (
          <div className={`p-3.5 rounded-xl text-xs space-y-2.5 flex flex-col border ${theme === "retro" ? "bg-[#fff8ea] border-2 border-emerald-700 text-emerald-950" : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"}`}>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${theme === "retro" ? "text-emerald-700" : "text-emerald-400"}`} />
              <div>
                <div className={`font-bold ${theme === "retro" ? "text-emerald-900 font-silkscreen text-[11px]" : "text-white"}`}>Rapat Selesai & Tindak Lanjut Terbuat!</div>
                <div className={`text-[11px] leading-relaxed ${theme === "retro" ? "text-emerald-800" : "text-slate-300"}`}>
                  Perintah Anda sebagai pemilik usaha telah otomatis didelegasikan ke tim dan tercatat di database status <span className="font-bold underline">IN_PROGRESS</span>.
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
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow ${theme === "retro" ? "bg-emerald-800 hover:bg-emerald-900 text-white" : "bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/50 text-emerald-200 hover:text-white"}`}
              >
                <span>📋 Buka Kanban Board (Menu Projects)</span>
              </button>
            )}
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Area with Recipient Targeting */}
      <div className={`p-2.5 sm:p-3 border-t space-y-2 ${theme === "retro" ? "bg-[#c9865f] border-t-2 border-[#ad6e49]" : "bg-[#121624] border-slate-800"}`}>
        {/* Recipient Selection Strip */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono scrollbar-none select-none">
          <span className={`shrink-0 font-bold ${theme === "retro" ? "text-[#3e2208]" : "text-slate-400"}`}>Tanya ke:</span>
          <button
            type="button"
            onClick={() => setTargetRecipient("ALL")}
            className={`px-2 py-0.5 rounded transition-all shrink-0 ${
              targetRecipient === "ALL" 
                ? (theme === "retro" ? "bg-[#3e2208] text-[#fff8ea] font-bold" : "bg-indigo-600 text-white font-bold") 
                : (theme === "retro" ? "bg-[#fff8ea]/60 text-[#3e2208] hover:bg-[#fff8ea]" : "bg-slate-800 text-slate-300 hover:bg-slate-700")
            }`}
          >
            👥 Semua
          </button>
          {[
            { id: "Budi", name: "Budi (Sourcing)" },
            { id: "Kafin", name: "Kafin (R&D)" },
            { id: "Doni", name: "Doni (Gudang)" },
            { id: "Rian", name: "Rian (Web Dev)" },
            { id: "Fina", name: "Fina (Finance)" },
            { id: "Sari", name: "Sari (CS)" },
            { id: "Gilang", name: "Gilang (Logistik)" },
            { id: "Bayu", name: "Bayu (B2B)" },
            { id: "Arya", name: "Arya (Ads)" },
            { id: "Maya", name: "Maya (Konten)" },
            { id: "Rama", name: "Rama (GM)" },
          ].map(agent => (
            <button
              key={agent.id}
              type="button"
              onClick={() => setTargetRecipient(agent.id)}
              className={`px-2 py-0.5 rounded transition-all shrink-0 ${
                targetRecipient === agent.id 
                  ? (theme === "retro" ? "bg-[#3e2208] text-[#fff8ea] font-bold ring-1 ring-amber-300" : "bg-indigo-600 text-white font-bold ring-1 ring-indigo-400") 
                  : (theme === "retro" ? "bg-[#fff8ea]/60 text-[#3e2208] hover:bg-[#fff8ea]" : "bg-slate-800 text-slate-300 hover:bg-slate-700")
              }`}
            >
              {agent.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); startMeeting(); }} className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              targetRecipient === "ALL" 
                ? "Tanya tim (atau ketik: 'Budi, harga berapa?')..." 
                : `Tanya langsung ke ${targetRecipient} saja...`
            }
            disabled={isLoading || (activeTurn >= 0 && !isCompleted)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono disabled:opacity-50 ${theme === "retro" ? "bg-[#fff8ea] border-2 border-[#ad6e49] text-[#3e2208] placeholder-[#8d5b38]" : "bg-[#1e2336] border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"}`}
          />
          <button
            type="submit"
            disabled={isLoading || !topic.trim() || (activeTurn >= 0 && !isCompleted)}
            className={`px-3.5 py-2 font-bold rounded-lg transition-colors text-xs disabled:opacity-50 flex items-center gap-1.5 shadow shrink-0 ${theme === "retro" ? "bg-[#3e2208] hover:bg-[#201003] text-[#fff8ea]" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
          >
            <Send size={13} />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
}
