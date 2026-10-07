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
  "Kang Dudung (GM)": {
    greeting: "Sampurasun bos! Sadayana 10 divisi roastery nuju harudang gararap tugas. Aya pituduh strategis atanapi tugas anyar anu bade didelegasikeun?",
    roleDescription: "Pimpinan roastery bageur anu ngatur sadaya divisi, nyatujuan anggaran belanja, sareng mingpin rapat pleno di Meja Cupping.",
    discussionTopics: [
      "Kumaha evaluasi kinerja operasional roastery dinten ieu?",
      "Pangdamelkeun tugas anyar keur evaluasi bungkus kemasan Ramu",
      "Kumaha rencana ekspansi kafe B2B di Bandung minggu ieu?",
      "Kumpulkeun sadaya tim urang rapat pleno di Meja Cupping!"
    ]
  },
  "Teh Euis (CS)": {
    greeting: "Sampurasun juragan! Layanan palanggan WhatsApp sareng marketplace 24 jam standby terus. Aya anu tiasa dibantos ku Teh Euis dinten ieu?",
    roleDescription: "Ngalayanan palanggan kalayan ramah pisan 24 jam nonstop, ngajaga kapuasan pembeli (CSAT), sareng konsultasi grind size seduh kopi.",
    discussionTopics: [
      "Cek kasadiaan stok kopi Bajawa Honey di gudang",
      "Kumaha status tiket keluhan sareng respon palanggan WA?",
      "Biji kopi naon anu pangcocokna kanggo diseduh V60 di bumi?",
      "Aya palanggan satia anu nyuhunkeun diskon grosiran teu?"
    ]
  },
  "Ujang (Web Dev)": {
    greeting: "Aman bos! Server Next.js 15 lemes pisan latency 9ms bari nyemil bala-bala haneut. Web store siap nampung jutaan pesenan checkout!",
    roleDescription: "Arsitek web store Next.js Ramu Coffee, ngurus pembayaran QRIS otomatis Midtrans, sareng ngajaga server ameh teu ngadat.",
    discussionTopics: [
      "Sabaraha latency server sareng performa checkout web store?",
      "Aya bug pamayaran QRIS anu dilaporkeun dinten ieu teu?",
      "Kumaha optimasi loading web dina HP ameh leuwih ngabret?",
      "Tiasa damelkeun fitur langganan kopi otomatis tiap sasih?"
    ]
  },
  "Ceu Edah (Finance)": {
    greeting: "Wilujeng sumping bos! Pembukuan kas dinten ieu parantos diitung nepi ka sabubuk-bubukna. Mana kuitansi bon balanjaan kamari, tong hilap!",
    roleDescription: "Bendahara roastery anu taliti pisan, ngatur arus kas (cashflow), rekonsiliasi mutasi bank, tagihan invoice kafe tempo 14 dinten, sareng faktur pajak.",
    discussionTopics: [
      "Sabaraha total omzet lebet sareng posisi kas urang dinten ieu?",
      "Sabaraha margin laba bersih sabada dipotong biaya gas & bungkus?",
      "Kumaha status faktur pajak PPN transaksi kafe B2B?",
      "Sabaraha anggaran aman keur balanja green beans minggu payun?"
    ]
  },
  "Kang Tatang (R&D)": {
    greeting: "Salam sruuup bos! Lab cupping sareng sensorik hurung terus. Biji kopi anyar skor SCA na 87.5 poin, seungitna matak kabita pisan!",
    roleDescription: "Master cupping & sensorik, ngulik kurva sangrai (RoR & DTR), evaluasi cita rasa specialty coffee standar SCA, sareng nyiptakeun blend anyar.",
    discussionTopics: [
      "Kumaha hasil cupping score batch Gayo Anaerobic?",
      "Jelaskeun kurva RoR sareng DTR dina roasting dinten ieu",
      "Naha profil sangrai ieu cocog keur mesin espresso kafe?",
      "Kumaha babandingan rasa proses Anaerobic vs Honey?"
    ]
  },
  "Mang Dadang (Inventory)": {
    greeting: "Siap juragan! Gudang beresih, karung kopi aman di luhur palet, mesin Probat siap ngagolak deui 5 batch dinten ieu!",
    roleDescription: "Mandor gudang, ngadalikeun stok fisik karung green beans, kemasan roasted beans siap kirim, sareng operasional mesin sangrai Probat.",
    discussionTopics: [
      "Sabaraha sésa karung green beans di gudang sareng suhu ruangan?",
      "Sabaraha batch roasting anu tiasa digeber mesin Probat dinten ieu?",
      "Naha stok bungkus valve 200g sareng 1kg masih cekap?",
      "Iraha jadwal meresihan drum roaster sareng chaff collector?"
    ]
  },
  "Kang Aceng (Logistics)": {
    greeting: "Laporan kargo siap bos! Paket ekspedisi kargo sareng kurir sameday tos siap ngabret, resi parantos dibagi-bagi!",
    roleDescription: "Kurir satset, ngatur serah terima resi kargo darat/hawa, kurir sameday tiis, sareng ngajaga paket dugi ka tujuan kalayan salamet tepat waktu.",
    discussionTopics: [
      "Kumaha status pangiriman kargo pesenan kafe Jakarta?",
      "Aya kakirangan armada kurir menjelang akhir sasih teu?",
      "Sabaraha babandingan ongkir Paxel vs J&T Cargo?",
      "Kumaha nanganan paket anu lecet nalika dikirim ka luar pulo?"
    ]
  },
  "Kang Jajang (B2B)": {
    greeting: "Halo bos! Pipeline kafe B2B sae pisan. Parantos aya 2 kafe anyar sapuk bade meser biji kopi 50kg rutin sabulan!",
    roleDescription: "Jagoan lobi kafe & hotel, muka kerjasama suplai biji kopi komersil, kontrak PO rutin, sareng negosiasi volume borongan B2B.",
    discussionTopics: [
      "Kumaha nawarkeun suplai 20kg ka Kafe Sudut Temu Bandung?",
      "Sabaraha minimal order (MOQ) ameh kafe kenging harga grosir?",
      "Naha urang nyadiakeun mesin kopi haratis keur kontrak sataun?",
      "Tiasa damelkeun proposal panawaran khusus keur hotel bintang 4?"
    ]
  },
  "Kang Deden (Ads)": {
    greeting: "Halo bos! Iklan Meta Ads nuju ngabret, ROAS rata-rata 4.2x gurih nyoy teu boncos. Siap scale-up anggaran iklan!",
    roleDescription: "Spesialis iklan digital berbayar (Meta Ads, Google Search, TikTok Ads), retargeting audiens nginum kopi, sareng ningkatkeun konversi checkout.",
    discussionTopics: [
      "Sabaraha ROAS sareng CPA (biaya per pembeli) kampanye ayeuna?",
      "Target audiens mana anu ngahasilkeun pameseran kopi pangseueurna?",
      "Kumaha hasil iklan retargeting palanggan anu can checkout?",
      "Sabaraha proyeksi omzet lamun budget iklan ditaekkeun 30%?"
    ]
  },
  "Neng Iteung (Content)": {
    greeting: "Sampurasun wargi roastery! Neng Iteung nembe rengse ngadamel video Reels TikTok proses nyeduh V60, viewersna pasti rame!",
    roleDescription: "Kreator konten geulis & kreatif, ngadamel video pondok organik, carita inspiratif patani kopi binaan, sareng visual branding Ramu Coffee.",
    discussionTopics: [
      "Video Reels naon anu nuju trending sareng engagementna pangluhurna?",
      "Kumaha konsép video edukasi proses fermentasi kopi anaerobik?",
      "Iraha jadwal tayang video promo paket hemat akhir pekan?",
      "Tiasa ngadamel liputan wawancara patani kopi di kebon Pangalengan?"
    ]
  },
  "Mang Encep (Sourcing)": {
    greeting: "Sampurasun bos! Mang Encep nembe mulang ti kebon kopi Takengon silaturahmi jeung patani. Pasokan green beans aman terkendali!",
    roleDescription: "Sobat patani kopi di kebon gunung, negosiasi harga meuli biji kopi mentah (direct-trade) anu adil, kalender panen raya, sareng milari micro-lot langka.",
    discussionTopics: [
      "Sabaraha harga green beans Gayo lamun urang tawar borongan?",
      "Pangintunkeun sampel 2kg ka lab Kang Tatang keur dites cupping",
      "Iraha jadwal panen raya salajengna di Takengon jeung Pangalengan?",
      "Tunda heula meuli green beans sasih ieu, urang cek stok gudang"
    ]
  },
  "Kang Asep (Security)": {
    greeting: "Sampurasun juragan bos! Hansip Cyber Asep standby ngaronda firewall, SSL, sareng lalu lintas server 24 jam nonstop. Moal aya heker liar nu lolos ti piriwit kuring! 🛡️🚨",
    roleDescription: "Hansip Cyber & Panjaga Sistem Roastery 24/7, ngahalau serangan DDoS, mariksa lalu-lintas checkout palsu/bot, enkripsi data pembeli, sareng ngajaga server web Ramu.",
    discussionTopics: [
      "Kumaha status kaamanan firewall sareng serangan siber dinten ieu?",
      "Parios sertifikat SSL sareng enkripsi gateway pembayaran QRIS",
      "Aya bot liar atanapi spam checkout anu diblokir dinten ieu?",
      "Laksanakeun patroli sareng scan kerentanan sistem sakedapan!"
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
  { role: "Kang Dudung (GM)", name: "Kang Dudung", dept: "General Manager", emoji: "👨‍💼" },
  { role: "Teh Euis (CS)", name: "Teh Euis", dept: "24/7 WhatsApp CS", emoji: "👩‍💼" },
  { role: "Ujang (Web Dev)", name: "Ujang", dept: "E-Commerce Tech", emoji: "👨‍💻" },
  { role: "Ceu Edah (Finance)", name: "Ceu Edah", dept: "Bendahara Roastery", emoji: "👩‍💼" },
  { role: "Kang Tatang (R&D)", name: "Kang Tatang", dept: "R&D & Master Cupping", emoji: "👨‍🔬" },
  { role: "Mang Dadang (Inventory)", name: "Mang Dadang", dept: "Mandor Gudang", emoji: "👨‍🔧" },
  { role: "Kang Aceng (Logistics)", name: "Kang Aceng", dept: "Kurir Satset", emoji: "🚚" },
  { role: "Kang Jajang (B2B)", name: "Kang Jajang", dept: "Lobi Kafe B2B", emoji: "🤝" },
  { role: "Kang Deden (Ads)", name: "Kang Deden", dept: "Meta & Google Ads", emoji: "📈" },
  { role: "Neng Iteung (Content)", name: "Neng Iteung", dept: "Medsos & TikTok", emoji: "📱" },
  { role: "Mang Encep (Sourcing)", name: "Mang Encep", dept: "Sobat Patani Kopi", emoji: "🌿" },
  { role: "Kang Asep (Security)", name: "Kang Asep", dept: "Cyber Security & Hansip", emoji: "👮‍♂️" }
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
                <div className="text-[9px] text-[#5c3214] font-semibold">12 Tim AI Aktif Berdiskusi</div>
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
              <div className="font-bold text-emerald-900 font-mono">12 Online</div>
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
                    Sedang memantau aktivitas diskusi 12 pegawai...
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

  const name = selectedAgent.split("(")[0].trim();
  const role = selectedAgent.split("(")[1]?.replace(")", "");
  const config = AGENT_CONFIGS[selectedAgent as keyof typeof AGENT_CONFIGS];

  const agentIdMap: Record<string, string> = {
    "Kang Dudung": "dudung",
    "Teh Euis": "euis",
    "Ujang": "ujang",
    "Ceu Edah": "edah",
    "Mang Dadang": "dadang",
    "Kang Aceng": "aceng",
    "Kang Jajang": "jajang",
    "Kang Tatang": "tatang",
    "Kang Deden": "deden",
    "Neng Iteung": "iteung",
    "Mang Encep": "encep",
    "Kang Asep": "asep",
    "Kang Asep (Security)": "asep",
    // Fallback legacy IDs
    "Rama": "dudung",
    "Sari": "euis",
    "Rian": "ujang",
    "Fina": "edah",
    "Doni": "dadang",
    "Gilang": "aceng",
    "Bayu": "jajang",
    "Kafin": "tatang",
    "Arya": "deden",
    "Maya": "iteung",
    "Budi": "encep"
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
      const apiId = agentIdMap[name] || "dudung";
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
        replyText = `Hapunten, aya kendala: ${responseJson.error || "Teu tiasa ngahubungi agen."}`;
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
        [currentAgent]: [...(prev[currentAgent] || []), { sender: "agent", text: "Koneksi ka server pegat. Mangga parios jaringan internét." }]
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

  // Helper to render formatted markdown, bold text, and action badges nicely
  const renderMessageContent = (text: string, isUser: boolean) => {
    const lines = text.split("\n");
    return lines.map((line, lIdx) => {
      // Highlight Kanban action badges
      if (line.includes("📋 *[Tiket") || line.includes("📋 *[Tugas")) {
        return (
          <div key={lIdx} className="my-1.5 p-1.5 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-[10.5px] font-bold flex items-center gap-1.5 shadow-xs">
            <span>📋</span>
            <span>{line.replace(/^.*📋\s*\*?\[?/, "").replace(/\*?\]?$/, "")}</span>
          </div>
        );
      }

      // Parse **bold** and *italic*
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={lIdx} className="block leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className={isUser ? "font-bold text-white" : "font-bold text-[#1f0e03]"}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
              return <em key={pIdx} className="italic opacity-90">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  // --- RETRO THEMED CONTROL PANEL (AI Town Palette: #df9d76, deep coffee brown text) ---
  if (theme === "retro") {
    return (
      <div className="flex flex-col h-full bg-[#df9d76] text-[#3e2208] relative font-mono select-none overflow-hidden">
        
        {/* Retro Header */}
        <div className="p-3 bg-[#c9865f] border-b-2 border-[#ad6e49] shrink-0 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fff8ea] border-2 border-[#ad6e49] flex items-center justify-center text-base shadow">
              {name.includes("Dudung") ? "👨‍💼" : 
               name.includes("Euis") ? "👩‍💼" : 
               name.includes("Edah") ? "👩‍💼" : 
               name.includes("Ujang") ? "👨‍💻" : 
               name.includes("Iteung") ? "👩‍🎤" : 
               name.includes("Tatang") ? "👨‍🔬" : 
               name.includes("Encep") ? "👨‍🌾" : 
               name.includes("Jajang") ? "👨‍💼" : 
               name.includes("Deden") ? "👨‍💼" : 
               name.includes("Dadang") ? "👨‍🔧" : 
               name.includes("Asep") ? "👮‍♂️" : "🚚"}
            </div>
            <div>
              <div className="font-bold text-[#2d1808] text-xs font-silkscreen flex items-center gap-1.5">
                <span>{name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
                <span className="text-[7.5px] bg-[#1e4620] text-emerald-100 px-1 py-0.2 rounded font-sans font-bold shadow-xs">
                  🟢 Live AI
                </span>
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
          <span className="truncate max-w-[200px]">{config?.roleDescription || "Spesialis operasional roastery Ramu."}</span>
          <span className="text-[8.5px] bg-[#c37e55] px-1.5 py-0.5 rounded text-[#2c1505] font-bold font-mono shrink-0 shadow-sm">
            🧠 Agen Otonom
          </span>
        </div>

        {/* Dynamic Quick Prompt Bar */}
        <div className="px-2 py-1 bg-[#caa085]/40 border-b border-[#ad6e49] flex gap-1 overflow-x-auto text-[9.5px] shrink-0 custom-scrollbar">
          <button
            onClick={() => handleAction("ask_opinion", `Menurut kamu sebagai ${name}, apa ide atau saran terbaikmu untuk pengembangan Ramu Roastery saat ini?`)}
            className="px-2 py-0.5 rounded-full bg-[#fff8ea] hover:bg-[#fff2d6] border border-[#ad6e49] text-[#3e2208] shrink-0 font-bold transition flex items-center gap-1 shadow-2xs"
          >
            <span>💡</span> Ide {name}
          </button>
          <button
            onClick={() => handleAction("ask_tech", "Bagaimana pendapatmu tentang Anti Gravity IDE dan ekosistem Next.js 15 untuk sistem agen ini?")}
            className="px-2 py-0.5 rounded-full bg-[#fff8ea] hover:bg-[#fff2d6] border border-[#ad6e49] text-[#3e2208] shrink-0 font-bold transition flex items-center gap-1 shadow-2xs"
          >
            <span>🚀</span> Anti Gravity IDE
          </button>
          <button
            onClick={() => handleAction("check_kanban", "Tolong buatkan tugas baru di Kanban board untuk evaluasi mingguan roastery!")}
            className="px-2 py-0.5 rounded-full bg-[#fff8ea] hover:bg-[#fff2d6] border border-[#ad6e49] text-[#3e2208] shrink-0 font-bold transition flex items-center gap-1 shadow-2xs"
          >
            <span>📋</span> Buat Tugas Kanban
          </button>
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
                {renderMessageContent(msg.text, msg.sender === "user")}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex flex-col gap-0.5 items-start">
              <div className="text-[9px] text-[#5c3214] font-bold px-1 font-silkscreen">{name}</div>
              <div className="bg-[#fff8ea] border-2 border-[#caa085] p-2.5 rounded-xl rounded-tl-none text-[#3e2208] flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-[#ad6e49]" />
                <span className="text-[11px] text-[#ad6e49] font-bold animate-pulse">{name} sedang berpikir & menganalisis konteks...</span>
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
              placeholder={`Beri instruksi atau diskusikan ide dengan ${name}...`}
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
