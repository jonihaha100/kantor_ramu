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
    greeting: "Halo bos! Pipeline kemitraan kafe dan supply chain kopi horeca sedang hangat-hangatnya minggu ini.",
    roleDescription: "Menegosiasikan kontrak suplai biji kopi ke coffeeshop & resto, skema wholesale, dan repeat order.",
    discussionTopics: [
      "Bagaimana kelanjutan kontrak suplai 20kg Kafe Sudut Temu?",
      "Berapa tier harga wholesale untuk pemesanan di atas 50kg?",
      "Kapan kita bisa kirim proposal ke calon mitra kafe Jaksel?",
      "Apakah kita perlu menyediakan mesin kopi sistem konsinyasi?"
    ]
  },
  "Arya (Ads)": {
    greeting: "Halo bos! Metrik dashboard Meta Ads dan Google Search menunjukkan ROAS 3.82x hari ini.",
    roleDescription: "Mengelola belanja iklan digital, target audiens penikmat kopi, cost-per-click (CPC), dan conversion rate.",
    discussionTopics: [
      "Berapa angka ROAS Meta Ads hari ini dan biaya per akuisisi?",
      "Apakah kita perlu scale-up budget iklan akhir pekan ini?",
      "Segmen audiens mana yang paling banyak checkout di web?",
      "Bagaimana hasil A/B testing materi iklan foto vs video Reels?"
    ]
  },
  "Maya (Content)": {
    greeting: "Hai bos! Reels Instagram dan video TikTok terbaru kita lagi rame engagement dan komentar audiens.",
    roleDescription: "Membuat video estetik proses sangrai kopi, storytelling biji kopi nusantara, dan meningkatkan organic reach.",
    discussionTopics: [
      "Bagaimana performa views Reels edukasi roasting di Instagram?",
      "Ide konten video apa yang lagi trending untuk TikTok Ramu?",
      "Bisakah bikin video A Day in the Life roaster bersama Kafin & Doni?",
      "Bagaimana cara mengonversi penonton video jadi pembeli di web?"
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

export default function ControlPanel({ selectedAgent, onClose }: ControlPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedAgent) {
      const config = AGENT_CONFIGS[selectedAgent as keyof typeof AGENT_CONFIGS];
      setMessages([{ sender: "agent", text: config?.greeting || "Halo bos! Saya siap berdiskusi seputar pekerjaan hari ini." }]);
    }
  }, [selectedAgent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!selectedAgent) {
    return (
      <div className="flex flex-col h-full bg-[#1e2336] border-l border-slate-800 text-slate-300 font-mono">
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-[#161a2b]">
          <h2 className="font-bold text-white text-sm">Office Live Dashboard</h2>
          <div className="flex gap-2 text-slate-500">
            <button className="hover:text-white"><ChevronLeft size={18}/></button>
            <button className="hover:text-white"><ChevronRight size={18}/></button>
            <button className="hover:text-white"><MoreVertical size={18}/></button>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto space-y-6 text-xs">
          <div>
            <div className="text-slate-500 mb-2 uppercase tracking-wider font-semibold">Live Operational Status</div>
            <div className="bg-[#161a2b] p-3.5 rounded-xl border border-slate-800 space-y-2.5 shadow-inner">
              <div className="flex justify-between">
                <span>Total Omzet Hari Ini</span>
                <span className="text-emerald-400 font-bold">Rp 14.225.000</span>
              </div>
              <div className="flex justify-between">
                <span>Green Beans Tersedia</span>
                <span className="text-blue-400 font-bold">1.380 Kg (23 Sacks)</span>
              </div>
              <div className="flex justify-between">
                <span>Suhu Roaster Drum</span>
                <span className="text-amber-400 font-bold">205°C (Running)</span>
              </div>
              <div className="flex justify-between">
                <span>Sistem Server Next.js</span>
                <span className="text-purple-400 font-bold">9ms Latency</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-slate-500 mb-2 uppercase tracking-wider font-semibold">Cara Mulai Diskusi</div>
            <div className="bg-[#161a2b] p-3.5 rounded-xl border border-slate-800 text-slate-400 space-y-2 leading-relaxed">
              <p>👉 <strong>Klik salah satu pegawai</strong> di kanvas kantor atau pilih dari daftar direktori.</p>
              <p>👉 Anda dapat menawar harga, meminta sampel pengujian, bertanya status stok, mendelegasikan tugas, atau mendiskusikan strategi bisnis roastery secara bebas!</p>
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
    const historyPayload = messages.map(m => ({ sender: m.sender, text: m.text }));
    
    setMessages(prev => [...prev, { sender: "user", text: label }]);
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

      setMessages(prev => [...prev, { sender: "agent", text: replyText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "agent", text: "Koneksi ke backend terputus. Mohon periksa jaringan server." }]);
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

  return (
    <div className="flex flex-col h-full bg-[#1e2336] border-l border-slate-800 relative text-slate-300 font-mono">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-[#161a2b]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#334155] flex items-center justify-center text-lg shadow border border-slate-600">
            {name === "Rama" ? "👨‍💼" : name === "Sari" ? "👩‍💼" : name === "Fina" ? "👩‍💼" : name === "Rian" ? "👨‍💻" : name === "Maya" ? "👩‍🎤" : name === "Kafin" ? "👨‍🔬" : name === "Budi" ? "👨‍🌾" : name === "Bayu" ? "👨‍💼" : name === "Arya" ? "👨‍💼" : "👨‍🔧"}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{name}</div>
            <div className="text-[11px] text-indigo-400">{role}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <button onClick={onClose} className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18}/>
          </button>
        </div>
      </div>

      {/* Role Context Bar */}
      <div className="px-4 py-2 bg-[#121624] border-b border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <HelpCircle size={13} className="text-indigo-400 shrink-0" />
        <span className="truncate">{config?.roleDescription || "Spesialis operasional roastery Ramu."}</span>
      </div>

      {/* Kafin R&D Chart Injection */}
      {name === "Kafin" && (
        <div className="p-3 bg-[#161a2b] border-b border-slate-800 shrink-0">
          <div className="text-[11px] text-teal-400 mb-1.5 flex items-center gap-1.5">
            <TrendingUp size={13}/> R&D Roast Profile Analysis
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <Line type="monotone" dataKey="sweetness" stroke="#f43f5e" strokeWidth={2} />
                <Line type="monotone" dataKey="acidity" stroke="#2dd4bf" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div className="text-[10px] text-slate-500 font-bold px-1">{msg.sender === "user" ? "Anda (Bos)" : name}</div>
            <div className={`p-3 text-left shadow-sm whitespace-pre-line leading-relaxed max-w-[90%] ${
              msg.sender === "user" 
                ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-indigo-600/20" 
                : "bg-[#161a2b] border border-slate-800 text-slate-200 rounded-2xl rounded-tl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex flex-col gap-1 items-start">
            <div className="text-[10px] text-slate-500 font-bold px-1">{name}</div>
            <div className="bg-[#161a2b] border border-slate-800 p-3 rounded-2xl rounded-tl-none text-slate-300 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-indigo-400" />
              <span className="text-xs text-indigo-300 animate-pulse">{name} sedang merumuskan analisa...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Interactive Discussion Starters / Topic Suggestions */}
      {!isTyping && config?.discussionTopics && (
        <div className="p-3 bg-[#121624] border-t border-slate-800 space-y-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400 shrink-0" />
            <span>Ide Topik Diskusi (Klik untuk Membahas):</span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            {config.discussionTopics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleAction("suggested_topic", topic)}
                className="text-left px-2.5 py-1.5 rounded-lg bg-[#1a1f33] hover:bg-indigo-600/20 border border-slate-700/80 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-indigo-300 transition-all flex items-center gap-2 group"
              >
                <span className="text-indigo-400 group-hover:scale-110 transition-transform">💬</span>
                <span className="truncate">{topic}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-[#1e2336] border-t border-slate-800/80 shrink-0">
        <div className="relative">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            className="w-full bg-[#161a2b] border border-slate-700 rounded-xl p-3 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            placeholder={`Diskusikan dengan ${name} (cth: tawar harga, cek data)...`}
          />
          <button 
            onClick={handleSendText}
            disabled={isTyping || !inputValue.trim()}
            className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow disabled:opacity-40"
          >
            <Send size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
}
