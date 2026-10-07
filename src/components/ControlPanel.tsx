"use client";

import { useState, useEffect, useRef } from "react";
import { AgentRole } from "./VirtualOffice";
import { 
  Send, FileText, BarChart2, X, ChevronLeft, ChevronRight, MoreVertical, 
  Package, MessageSquare, Code, DollarSign, Truck, ShieldCheck, Loader2, 
  Megaphone, Video, Search, TrendingUp, Sparkles, HelpCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ControlPanelProps {
  selectedAgent: AgentRole;
  onClose: () => void;
  theme?: "retro" | "dark";
  onAgentSpeech?: (speaker: string, text: string) => void;
  officeEvents?: {
    id: string;
    time: string;
    speaker: string;
    message: string;
    type: "chat" | "task" | "system" | "meeting" | "collab" | "pod" | "thought" | "cupping";
  }[];
  onSelectAgent?: (agent: AgentRole) => void;
  onStartMeeting?: () => void;
}

const AGENT_CONFIGS: Record<string, {
  greeting: string;
  roleDescription: string;
  discussionTopics: string[];
}> = {
  "Budi (Sourcing)": {
    greeting: "Halo bos! Saya baru kontak kelompok tani di Takengon dan Pangalengan. Ada beberapa hal terkait pasokan green beans yang perlu kita diskusikan.",
    roleDescription: "Menangani kemitraan petani, negosiasi harga biji kopi mentah (direct-trade), kalender panen, dan sampel micro-lot.",
    discussionTopics: [
      "Berapa harga green beans Gayo kalau kita tawar?",
      "Tolong kirimkan sampel 2kg ke lab Kafin untuk dites",
      "Kapan jadwal panen raya berikutnya di Takengon?",
      "Tunda dulu pembelian green beans bulan ini, kita evaluasi stok"
    ]
  },
  "Rama (GM)": {
    greeting: "Halo bos, semua divisi roastery sedang beroperasi. Ada arahan strategis, evaluasi KPI, atau tugas baru yang perlu didelegasikan?",
    roleDescription: "Memimpin koordinasi antar departemen, menyetujui anggaran, dan mendelegasikan tugas ke papan Kanban.",
    discussionTopics: [
      "Bagaimana evaluasi performa operasional roastery hari ini?",
      "Tolong buatkan tugas baru untuk evaluasi kemasan Ramu",
      "Bagaimana rencana ekspansi kafe B2B minggu ini?",
      "Kumpulkan seluruh tim untuk rapat di Cupping Table"
    ]
  },
  "Sari (CS)": {
    greeting: "Hai bos! Layanan pelanggan WhatsApp dan marketplace aktif. Rata-rata response time kita di 2 menit.",
    roleDescription: "Menangani interaksi pelanggan, kepuasan pembeli (CSAT), rekomendasi grind size, dan tiket komplain.",
    discussionTopics: [
      "Cek ketersediaan stok kopi terlaris di gudang",
      "Bagaimana status tiket keluhan dan respon pelanggan?",
      "Biji kopi apa yang paling cocok untuk seduh V60 rumahan?",
      "Adakah pelanggan loyal yang minta diskon pembelian grosir?"
    ]
  },
  "Rian (Web Dev)": {
    greeting: "Server stabil, latency 9ms di edge server. Web store Ramu siap menampung lonjakan pesanan checkout.",
    roleDescription: "Bertanggung jawab atas arsitektur web Next.js 15, integrasi payment QRIS Midtrans, dan performa teknis.",
    discussionTopics: [
      "Berapa latency server dan performa checkout web store Ramu?",
      "Apakah ada bug pembayaran QRIS yang dilaporkan hari ini?",
      "Bagaimana optimasi kecepatan loading web di perangkat mobile?",
      "Bisa buatkan fitur langganan kopi otomatis setiap bulan?"
    ]
  },
  "Fina (Finance)": {
    greeting: "Selamat siang bos. Pembukuan harian dan rekonsiliasi mutasi bank BCA & Mandiri sudah selesai saya audit.",
    roleDescription: "Mengelola arus kas roastery, rekonsiliasi omzet, invoice B2B tempo 14 hari, dan faktur pajak PPN 11%.",
    discussionTopics: [
      "Berapa total omzet masuk dan posisi kas kita hari ini?",
      "Berapa gross profit margin kita setelah biaya kemasan & gas?",
      "Bagaimana status faktur pajak PPN transaksi B2B?",
      "Berapa budget aman untuk belanja green beans minggu depan?"
    ]
  },
  "Kafin (R&D)": {
    greeting: "Salam bos! Lab cupping dan sensorik aktif. Profil sangrai batch terbaru sudah selesai dievaluasi.",
    roleDescription: "Menganalisis kurva roasting (RoR & DTR), cupping score standar SCA, dan eksperimen cita rasa specialty coffee.",
    discussionTopics: [
      "Bagaimana hasil cupping score batch Gayo Anaerobic?",
      "Jelaskan kurva RoR dan DTR pada roasting hari ini",
      "Apakah profil sangrai ini cocok untuk espresso mesin kafe?",
      "Bagaimana perbandingan rasa proses Anaerobic vs Honey?"
    ]
  },
  "Doni (Inventory)": {
    greeting: "Siap bos! Gudang roastery dalam kondisi bersih, suhu 22°C dan kelembaban 60% terjaga optimal.",
    roleDescription: "Mengontrol stok fisik karung green beans, kemasan roasted beans siap kirim, dan operasional mesin Probat.",
    discussionTopics: [
      "Berapa sisa karung green beans di gudang dan kelembaban ruangan?",
      "Berapa batch roasting yang bisa dijalankan mesin Probat hari ini?",
      "Apakah stok kemasan foil valve 200g dan 1kg masih mencukupi?",
      "Kapan jadwal pembersihan drum roaster dan chaff collector?"
    ]
  },
  "Gilang (Logistics)": {
    greeting: "Laporan logistik siap, bos. Paket ekspedisi kargo dan kurir sameday sudah dijadwalkan pickup tepat waktu.",
    roleDescription: "Mengatur serah terima resi kargo darat/udara, kurir sameday dingin, dan menjaga SLA pengiriman tepat waktu.",
    discussionTopics: [
      "Bagaimana status pengiriman kargo pesanan kafe Jakarta?",
      "Apakah ada keterlambatan kurir darat menjelang akhir bulan?",
      "Berapa perbandingan tarif Paxel Cold Chain vs J&T Cargo?",
      "Bagaimana penanganan paket rusak saat pengiriman luar pulau?"
    ]
  },
  "Bayu (B2B)": {
    greeting: "Halo bos! Pipeline prospek kafe dan hotel bulan ini sangat potensial. Sudah ada 2 kafe baru minta penawaran harga grosir.",
    roleDescription: "Membuka kemitraan pasokan biji kopi komersial, kontrak PO rutin, dan negosiasi volume B2B.",
    discussionTopics: [
      "Bagaimana penawaran suplai 20kg ke Kafe Sudut Temu?",
      "Berapa minimal order (MOQ) untuk kafe baru dapat harga grosir?",
      "Apakah kita sediakan mesin kopi gratis untuk kontrak jangka panjang?",
      "Bisa buatkan proposal penawaran khusus untuk hotel bintang 4?"
    ]
  },
  "Arya (Ads)": {
    greeting: "Halo bos! Kampanye Meta Ads dan Google Ads roastery berjalan optimal. ROAS rata-rata stabil di angka 3.8x.",
    roleDescription: "Mengelola performa iklan berbayar (Meta Ads, Google Search), retargeting audiens, dan konversi checkout.",
    discussionTopics: [
      "Berapa ROAS dan CPA (biaya per akuisisi) kampanye saat ini?",
      "Audiens mana yang menghasilkan pembelian kopi tertinggi?",
      "Bagaimana hasil iklan retargeting pelanggan yang abandoned cart?",
      "Berapa proyeksi omzet jika budget iklan dinaikkan 30%?"
    ]
  },
  "Maya (Content)": {
    greeting: "Halo bos! Konsep video reels dan TikTok edukasi kopi Nusantara sudah masuk tahap editing. Ada pesan khusus yang mau disampaikan?",
    roleDescription: "Membuat video pendek organik, storytelling biji kopi petani binaan, dan visual branding roastery.",
    discussionTopics: [
      "Video Reels apa yang trending dan menghasilkan engagement tertinggi?",
      "Bagaimana konsep video edukasi proses fermentasi kopi anaerobik?",
      "Kapan jadwal tayang konten video promo bundle akhir pekan?",
      "Bisa buatkan konten wawancara petani kopi binaan di kebun?"
    ]
  }
};

type ChatMessage = {
  sender: "agent" | "user";
  text: string;
};

// Mock data for Kafin's R&D Chart
const RND_DATA = [
  { name: 'Batch 1', acidity: 4, body: 6, sweetness: 5 },
  { name: 'Batch 2', acidity: 5, body: 5, sweetness: 6 },
  { name: 'Batch 3', acidity: 3, body: 7, sweetness: 4 },
  { name: 'Batch 4', acidity: 6, body: 4, sweetness: 7 },
  { name: 'Batch 5', acidity: 5, body: 6, sweetness: 8 },
];

const ALL_AGENTS_SUMMARY: { role: AgentRole; name: string; dept: string; emoji: string }[] = [
  { role: "Rama (GM)", name: "Rama", dept: "General Manager", emoji: "👨‍💼" },
  { role: "Sari (CS)", name: "Sari", dept: "24/7 WhatsApp CS", emoji: "👩‍💼" },
  { role: "Rian (Web Dev)", name: "Rian", dept: "E-Commerce Tech", emoji: "👨‍💻" },
  { role: "Fina (Finance)", name: "Fina", dept: "Finance & Tax", emoji: "👩‍💼" },
  { role: "Kafin (R&D)", name: "Kafin", dept: "R&D & Cupping", emoji: "👨‍🔬" },
  { role: "Doni (Inventory)", name: "Doni", dept: "Roastery & Stock", emoji: "👨‍🔧" },
  { role: "Gilang (Logistics)", name: "Gilang", dept: "Logistics & Cargo", emoji: "🚚" },
  { role: "Bayu (B2B)", name: "Bayu", dept: "B2B Cafe Contracts", emoji: "🤝" },
  { role: "Arya (Ads)", name: "Arya", dept: "Meta & Google Ads", emoji: "📈" },
  { role: "Maya (Content)", name: "Maya", dept: "Social Media & Reels", emoji: "📱" },
  { role: "Budi (Sourcing)", name: "Budi", dept: "Green Beans Sourcing", emoji: "🌿" }
];

export default function ControlPanel({ 
  selectedAgent, 
  onClose, 
  theme = "retro", 
  onAgentSpeech,
  officeEvents,
  onSelectAgent,
  onStartMeeting
}: ControlPanelProps) {
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ramu_agent_conversations");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load saved agent conversations:", e);
      }
    }
    return {};
  });
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-persist conversations to localStorage whenever updated
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(conversations).length > 0) {
      try {
        localStorage.setItem("ramu_agent_conversations", JSON.stringify(conversations));
      } catch (e) {}
    }
  }, [conversations]);

  useEffect(() => {
    if (selectedAgent) {
      const config = AGENT_CONFIGS[selectedAgent as keyof typeof AGENT_CONFIGS];
      setConversations(prev => {
        if (!prev[selectedAgent] || prev[selectedAgent].length === 0) {
          return {
            ...prev,
            [selectedAgent]: [{ sender: "agent", text: config?.greeting || "Halo bos! Saya siap berdiskusi seputar pekerjaan hari ini." }]
          };
        }
        return prev;
      });
    }
  }, [selectedAgent]);

  const handleClearCurrentChat = () => {
    if (!selectedAgent) return;
    if (confirm(`Hapus riwayat chat dengan ${selectedAgent}?`)) {
      setConversations(prev => {
        const updated = { ...prev };
        delete updated[selectedAgent];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("ramu_agent_conversations", JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });
    }
  };

  const messages = (selectedAgent && conversations[selectedAgent]) ? conversations[selectedAgent] : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Live Office Discussion Stream & Agent Directory when no agent is selected
  if (!selectedAgent) {
    if (theme === "retro") {
      return (
        <div className="flex flex-col h-full bg-[#df9d76] text-[#3e2208] relative font-mono select-none overflow-hidden">
          {/* Retro Live Radar Header */}
          <div className="p-3 bg-[#c9865f] border-b-2 border-[#ad6e49] shrink-0 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-base">📻</span>
              <div>
                <div className="font-bold text-[#2d1808] text-xs font-silkscreen flex items-center gap-1.5">
                  <span>RAMU HQ RADAR</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
                </div>
                <div className="text-[9px] text-[#5c3214] font-semibold">11 Tim AI Aktif Berdiskusi</div>
              </div>
            </div>
            {onStartMeeting && (
              <button
                onClick={onStartMeeting}
                className="px-2 py-1 text-[9px] font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded border border-[#3730a3] transition shadow font-mono flex items-center gap-1"
                title="Panggil seluruh tim untuk rapat pleno di Cupping Table"
              >
                <span>📢</span>
                <span>Rapat</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#d69068] border-b border-[#bd7b54] text-center text-[10px]">
            <div className="bg-[#e7aa86] rounded p-1 border border-[#ba7750]">
              <div className="text-[9px] text-[#5c3214]">Status</div>
              <div className="font-bold text-emerald-900 font-mono">11 Online</div>
            </div>
            <div className="bg-[#e7aa86] rounded p-1 border border-[#ba7750]">
              <div className="text-[9px] text-[#5c3214]">CS Live</div>
              <div className="font-bold text-emerald-900 font-mono">24 Jam 🟢</div>
            </div>
            <div className="bg-[#e7aa86] rounded p-1 border border-[#ba7750]">
              <div className="text-[9px] text-[#5c3214]">Cupping</div>
              <div className="font-bold text-[#2d1808] font-mono">87.5 SCA</div>
            </div>
          </div>

          {/* Feed & Directory Container */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3 custom-scrollbar text-xs">
            {/* Live Office Chatter Stream */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10px] font-bold text-[#3e2208] uppercase tracking-wide flex items-center gap-1">
                  <span>💬</span> Live Obrolan Kantor
                </span>
                <span className="text-[9px] text-[#6d3e1a] font-medium">Real-time</span>
              </div>

              <div className="space-y-1.5">
                {officeEvents && officeEvents.length > 0 ? (
                  officeEvents.slice(0, 6).map((ev) => {
                    const matchedAgent = ALL_AGENTS_SUMMARY.find(a => ev.speaker.includes(a.name));
                    const isCupping = ev.type === "cupping";
                    const isCollab = ev.type === "collab" || ev.type === "pod";
                    const isMeeting = ev.type === "meeting";

                    return (
                      <div
                        key={ev.id}
                        onClick={() => matchedAgent && onSelectAgent && onSelectAgent(matchedAgent.role)}
                        className={`p-2 rounded-lg border text-[11px] leading-snug transition cursor-pointer shadow-sm ${
                          matchedAgent ? "hover:border-[#7c441e] hover:shadow" : ""
                        } ${
                          isCupping
                            ? "bg-[#fffbeb] border-[#fde68a] text-[#78350f]"
                            : isMeeting
                            ? "bg-[#eff6ff] border-[#bfdbfe] text-[#1e3a8a]"
                            : isCollab
                            ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#14532d]"
                            : "bg-[#fff8ea] border-[#ad6e49] text-[#2d1808]"
                        }`}
                        title={matchedAgent ? `Klik untuk mulai chat dengan ${ev.speaker}` : undefined}
                      >
                        <div className="flex items-center justify-between text-[9px] mb-1 font-bold">
                          <span className="flex items-center gap-1">
                            <span>{ev.speaker}</span>
                          </span>
                          <span className="text-[8px] opacity-70 font-mono">[{ev.time}]</span>
                        </div>
                        <div className="font-sans text-[11px] font-medium text-[#2a1708]">
                          "{ev.message}"
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 rounded-lg bg-[#fff8ea] border border-[#ad6e49] text-center text-[10px] text-[#5c3214]">
                    Sedang memantau aktivitas diskusi 11 pegawai...
                  </div>
                )}
              </div>
            </div>

            {/* Agent Quick Directory */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10px] font-bold text-[#3e2208] uppercase tracking-wide flex items-center gap-1">
                  <span>👥</span> Mulai Chat Pegawai
                </span>
                <span className="text-[9px] text-[#6d3e1a]">Pilih Agen</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_AGENTS_SUMMARY.map((a) => (
                  <button
                    key={a.name}
                    onClick={() => onSelectAgent && onSelectAgent(a.role)}
                    className="p-1.5 rounded-lg bg-[#fff8ea] hover:bg-[#fffdf7] border border-[#ad6e49] hover:border-[#6a3715] text-left transition flex items-center gap-1.5 shadow-sm group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">{a.emoji}</span>
                    <div className="overflow-hidden">
                      <div className="font-bold text-[10px] text-[#2d1808] truncate font-mono">{a.name}</div>
                      <div className="text-[8px] text-[#6d3e1a] truncate">{a.dept}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-[#1e2336] border-l border-slate-800 text-slate-300 font-mono">
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-[#161a2b]">
          <h2 className="font-bold text-white text-sm">Office Live Dashboard</h2>
        </div>
        <div className="p-4 overflow-y-auto space-y-6 text-xs">
          <div>
            <div className="text-slate-500 mb-2 uppercase tracking-wider font-semibold">Cara Mulai Diskusi</div>
            <div className="bg-[#161a2b] p-3.5 rounded-xl border border-slate-800 text-slate-400 space-y-2 leading-relaxed">
              <p>👉 <strong>Klik salah satu pegawai</strong> di kanvas kantor atau klik tombol avatar di bawah.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const name = selectedAgent.split(" ")[0];
  const role = selectedAgent.split("(")[1]?.replace(")", "");
  const config = AGENT_CONFIGS[selectedAgent as keyof typeof AGENT_CONFIGS];

  const agentIdMap: Record<string, string> = {
    "Rama": "rama",
    "Sari": "sari",
    "Rian": "rian",
    "Fina": "fina",
    "Doni": "doni",
    "Gilang": "gilang",
    "Bayu": "bayu",
    "Kafin": "kafin",
    "Arya": "arya",
    "Maya": "maya",
    "Budi": "budi"
  };

  const handleAction = async (action: string, label: string) => {
    if (!selectedAgent) return;
    const currentAgent = selectedAgent;
    const historyPayload = messages.map(m => ({ sender: m.sender, text: m.text }));
    
    setConversations(prev => ({
      ...prev,
      [currentAgent]: [...(prev[currentAgent] || []), { sender: "user", text: label }]
    }));
    setIsTyping(true);

    try {
      const apiId = agentIdMap[name] || "rama";
      const res = await fetch(`/api/internal/agents/${apiId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: label, 
          history: historyPayload,
          clientTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta"
        })
      });
      
      const responseJson = await res.json();
      let replyText = "";

      if (!res.ok) {
        replyText = `Maaf, terjadi kendala: ${responseJson.error || "Gagal menghubungi agen."}`;
      } else {
        replyText = responseJson.data.reply;
      }

      if (onAgentSpeech) {
        onAgentSpeech(currentAgent, replyText);
      }

      setConversations(prev => ({
        ...prev,
        [currentAgent]: [...(prev[currentAgent] || []), { sender: "agent", text: replyText }]
      }));
    } catch (err) {
      setConversations(prev => ({
        ...prev,
        [currentAgent]: [...(prev[currentAgent] || []), { sender: "agent", text: "Koneksi ke backend terputus. Mohon periksa jaringan server." }]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendText = () => {
    if (!inputValue.trim()) return;
    const txt = inputValue;
    setInputValue("");
    handleAction("custom_chat", txt);
  };

  // --- RETRO THEMED CONTROL PANEL (AI Town Palette: #df9d76, deep coffee brown text) ---
  if (theme === "retro") {
    return (
      <div className="flex flex-col h-full bg-[#df9d76] text-[#3e2208] relative font-mono select-none overflow-hidden">
        
        {/* Retro Header */}
        <div className="p-3 bg-[#c9865f] border-b-2 border-[#ad6e49] shrink-0 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff8ea] border-2 border-[#ad6e49] flex items-center justify-center text-base shadow">
              {name === "Rama" ? "👨‍💼" : name === "Sari" ? "👩‍💼" : name === "Fina" ? "👩‍💼" : name === "Rian" ? "👨‍💻" : name === "Maya" ? "👩‍🎤" : name === "Kafin" ? "👨‍🔬" : name === "Budi" ? "👨‍🌾" : name === "Bayu" ? "👨‍💼" : name === "Arya" ? "👨‍💼" : "👨‍🔧"}
            </div>
            <div>
              <div className="font-bold text-[#2d1808] text-xs font-silkscreen flex items-center gap-1.5">
                <span>{name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-[#5c3214] font-semibold">{role}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleClearCurrentChat}
              className="px-2 py-0.5 text-[9px] font-bold text-[#4a260c] hover:text-[#1f0e03] bg-[#ba7750] hover:bg-[#a96640] rounded border border-[#945633] transition-colors font-mono shadow-sm"
              title="Hapus riwayat chat dengan agen ini"
            >
              🔄 Reset Chat
            </button>
            <button 
              onClick={onClose} 
              className="p-1 text-[#4a260c] hover:text-[#1f0e03] hover:bg-[#b8754e] rounded-md transition-colors"
              title="Tutup Panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Role Sub-bar with Memory Status */}
        <div className="px-3 py-1 bg-[#d38e65] border-b border-[#ad6e49] text-[9.5px] text-[#4a260c] flex items-center justify-between gap-1">
          <span className="truncate max-w-[210px]">{config?.roleDescription || "Spesialis operasional roastery Ramu."}</span>
          <span className="text-[8.5px] bg-[#c37e55] px-1.5 py-0.5 rounded text-[#2c1505] font-bold font-mono shrink-0 shadow-sm">
            💾 Memori Aktif
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col gap-0.5 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className="text-[9px] text-[#5c3214] font-bold px-1 font-silkscreen">
                {msg.sender === "user" ? "Anda (Owner)" : name}
              </div>
              <div className={`p-2.5 text-left shadow-sm whitespace-pre-line leading-relaxed max-w-[92%] font-mono text-[11px] ${
                msg.sender === "user" 
                  ? "bg-[#3e2208] text-[#fff8ea] rounded-xl rounded-tr-none shadow" 
                  : "bg-[#fff8ea] text-[#3e2208] border-2 border-[#caa085] rounded-xl rounded-tl-none shadow-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex flex-col gap-0.5 items-start">
              <div className="text-[9px] text-[#5c3214] font-bold px-1 font-silkscreen">{name}</div>
              <div className="bg-[#fff8ea] border-2 border-[#caa085] p-2.5 rounded-xl rounded-tl-none text-[#3e2208] flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-[#ad6e49]" />
                <span className="text-[11px] text-[#ad6e49] font-bold animate-pulse">{name} sedang mengetik...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Topics Pill Chips */}
        {!isTyping && config?.discussionTopics && (
          <div className="p-2 bg-[#d38e65] border-t border-[#ad6e49] space-y-1.5 shrink-0">
            <div className="text-[9px] text-[#4a260c] font-bold uppercase tracking-wider font-silkscreen">
              ⚡ Topik Diskusi:
            </div>
            <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
              {config.discussionTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction("suggested_topic", topic)}
                  className="text-left px-2 py-1 rounded bg-[#fff8ea] hover:bg-[#fff2d6] border border-[#ad6e49] text-[10px] text-[#3e2208] transition-all truncate font-mono shadow-xs"
                >
                  ☕ {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-2 bg-[#c9865f] border-t-2 border-[#ad6e49] shrink-0">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendText()}
              placeholder={`Beri arahan ke ${name}...`}
              className="flex-1 bg-[#fff8ea] border-2 border-[#ad6e49] text-[#3e2208] placeholder-[#8d5b38] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-mono shadow-inner"
            />
            <button
              onClick={handleSendText}
              disabled={isTyping}
              className="p-1.5 bg-[#3e2208] hover:bg-[#201003] text-[#fff8ea] rounded-lg transition-all shadow flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Fallback dark theme
  return (
    <div className="flex flex-col h-full bg-[#1e2336] border-l border-slate-800 relative text-slate-300 font-mono">
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-[#161a2b]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#334155] flex items-center justify-center text-lg shadow border border-slate-600">
            {name === "Rama" ? "👨‍💼" : "👨‍🔬"}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{name}</div>
            <div className="text-[11px] text-indigo-400">{role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleClearCurrentChat} className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors" title="Reset Chat">
            🔄 Reset
          </button>
          <button onClick={onClose} className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg">
            <X size={18}/>
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-xl ${msg.sender === "user" ? "bg-indigo-600 text-white self-end" : "bg-[#161a2b] text-slate-200"}`}>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}
