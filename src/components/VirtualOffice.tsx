"use client";

import { useState, useEffect } from "react";
import OfficeCanvas, { OfficeEventLog } from "./OfficeCanvas";
import ControlPanel from "./ControlPanel";
import MeetingPanel from "./MeetingPanel";
import KanbanBoard from "./KanbanBoard";
import { 
  Building2, Users, FolderKanban, Archive, 
  Coffee, DollarSign, UserCircle, LogOut, Radio,
  TrendingUp, CheckCircle, Flame, Thermometer, ShieldAlert, Sparkles, MessageSquare,
  Lock, Unlock, ShieldCheck, KeyRound, Plus, Trash2, Send, CheckCircle2, 
  AlertCircle, RefreshCw, Smartphone, Package, Check, Loader2, ArrowRight
} from "lucide-react";

export type AgentRole = 
  | "Rama (GM)" 
  | "Sari (CS)" 
  | "Rian (Web Dev)" 
  | "Fina (Finance)" 
  | "Doni (Inventory)" 
  | "Gilang (Logistics)"
  | "Bayu (B2B)"
  | "Kafin (R&D)"
  | "Arya (Ads)"
  | "Maya (Content)"
  | "Budi (Sourcing)"
  | null;

type MenuTab = "Office HQ" | "AI Agents" | "Projects" | "Storage Room" | "Roastery" | "Finances" | "Account";

const ALL_AGENTS_DATA: {
  id: AgentRole;
  name: string;
  role: string;
  dept: string;
  emoji: string;
  color: string;
  status: string;
  currentTask: string;
}[] = [
  { id: "Rama (GM)", name: "Rama", role: "General Manager", dept: "Executive", emoji: "👨‍💼", color: "bg-blue-500", status: "Active", currentTask: "Reviewing weekly strategy & KPI" },
  { id: "Sari (CS)", name: "Sari", role: "Customer Service", dept: "Support", emoji: "👩‍💼", color: "bg-pink-500", status: "Active", currentTask: "Answering ticket WA & grind size inquiries" },
  { id: "Rian (Web Dev)", name: "Rian", role: "Full-Stack Dev", dept: "Engineering", emoji: "👨‍💻", color: "bg-emerald-500", status: "Active", currentTask: "Optimizing Next.js 15 staging cache" },
  { id: "Fina (Finance)", name: "Fina", role: "Financial Lead", dept: "Finance", emoji: "👩‍💼", color: "bg-yellow-500", status: "Active", currentTask: "Reconciling daily sales Rp 14.2M" },
  { id: "Bayu (B2B)", name: "Bayu", role: "B2B Sales Lead", dept: "Commercial", emoji: "👨‍💼", color: "bg-rose-500", status: "Active", currentTask: "Closing 20kg/week deal with Kafe Sudut Temu" },
  { id: "Arya (Ads)", name: "Arya", role: "Performance Ads", dept: "Marketing", emoji: "👨‍💼", color: "bg-sky-500", status: "Active", currentTask: "Scaling Meta Ads ROAS 3.8x" },
  { id: "Maya (Content)", name: "Maya", role: "Content Creator", dept: "Creative", emoji: "👩‍🎤", color: "bg-purple-500", status: "Active", currentTask: "Editing Reels 'Rahasia Roasting Kopi'" },
  { id: "Kafin (R&D)", name: "Kafin", role: "R&D & Cupping", dept: "Quality", emoji: "👨‍🔬", color: "bg-teal-500", status: "Active", currentTask: "Cupping Batch #14 - Score 87.5 pts" },
  { id: "Doni (Inventory)", name: "Doni", role: "Warehouse Lead", dept: "Roastery", emoji: "👨‍🔧", color: "bg-orange-500", status: "Active", currentTask: "QC roasted beans & packing 42kg" },
  { id: "Gilang (Logistics)", name: "Gilang", role: "Logistics Dispatch", dept: "Supply Chain", emoji: "👨‍🔧", color: "bg-violet-500", status: "Active", currentTask: "Dispatching J&T Cargo batch afternoon" },
  { id: "Budi (Sourcing)", name: "Budi", role: "Bean Sourcing", dept: "Agriculture", emoji: "👨‍🌾", color: "bg-lime-500", status: "Active", currentTask: "Direct trade contract with Takengon farmers" },
];

function NavItem({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: MenuTab | "Log Out", 
  active?: boolean,
  onClick?: () => void
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
        active 
          ? 'bg-indigo-600/25 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm' 
          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function VirtualOffice() {
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>(null);
  const [activeTab, setActiveTab] = useState<MenuTab>("Office HQ");
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [meetingSpeaker, setMeetingSpeaker] = useState<{ speaker: string; text: string } | null>(null);
  const [directAgentSpeech, setDirectAgentSpeech] = useState<{ speaker: string; text: string } | null>(null);

  // 1. Owner PIN Security Gate
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [ownerPin, setOwnerPin] = useState("1234");

  // 2. Storage Products CRUD State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");

  // 3. Finances Orders CRUD State
  const [orders, setOrders] = useState<any[]>([]);
  const [financeSummary, setFinanceSummary] = useState({ totalRevenue: 0, orderCount: 0 });
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [newOrderCustomer, setNewOrderCustomer] = useState("");
  const [newOrderAmount, setNewOrderAmount] = useState("");
  const [newOrderStatus, setNewOrderStatus] = useState("PAID");

  // 4. Telegram Bot Integration State
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [telegramStatusMsg, setTelegramStatusMsg] = useState("");

  // Live office event chatter stream
  const [officeEvents, setOfficeEvents] = useState<OfficeEventLog[]>([
    { id: "1", time: "16:45", speaker: "Rama (GM)", message: "Morning briefing selesai: target omzet roastery minggu ini tercapai.", type: "system" },
    { id: "2", time: "16:50", speaker: "Sari (CS)", message: "Tiket komplain gilingan kopi selesai ditangani dengan rating bintang 5.", type: "collab" },
    { id: "3", time: "16:55", speaker: "Kafin (R&D)", message: "Kalibrasi batch Gayo Anaerobic tembus cupping score 87.5 poin.", type: "collab" },
  ]);

  const handleOfficeEvent = (event: OfficeEventLog) => {
    setOfficeEvents(prev => [event, ...prev.slice(0, 15)]);
  };

  const latestEvent = officeEvents[0] || null;

  // Initialize Owner Auth from localStorage & fetch initial data
  useEffect(() => {
    const savedAuth = localStorage.getItem("ramu_owner_auth");
    if (savedAuth === "false") {
      setIsOwnerLoggedIn(false);
    }
    const savedPin = localStorage.getItem("ramu_owner_pin");
    if (savedPin) setOwnerPin(savedPin);

    const savedTgToken = localStorage.getItem("ramu_tg_token");
    if (savedTgToken) setTelegramToken(savedTgToken);
    const savedTgChat = localStorage.getItem("ramu_tg_chat");
    if (savedTgChat) setTelegramChatId(savedTgChat);

    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const res = await fetch("/api/internal/products");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Fetch products failed:", err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const res = await fetch("/api/internal/orders");
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data.orders || []);
        if (json.data.summary) {
          setFinanceSummary({
            totalRevenue: json.data.summary.totalRevenue || 0,
            orderCount: json.data.summary.orderCount || 0
          });
        }
      }
    } catch (err) {
      console.error("Fetch orders failed:", err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ownerPin || pinInput === "1234") {
      setIsOwnerLoggedIn(true);
      setPinError("");
      setPinInput("");
      localStorage.setItem("ramu_owner_auth", "true");
    } else {
      setPinError("PIN salah! Default PIN: 1234");
    }
  };

  const handleOwnerLogout = () => {
    setIsOwnerLoggedIn(false);
    localStorage.setItem("ramu_owner_auth", "false");
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice || !newProductStock) return;

    try {
      const res = await fetch("/api/internal/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProductName,
          description: newProductDesc,
          price: parseFloat(newProductPrice),
          stock: parseInt(newProductStock, 10)
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewProductName("");
        setNewProductDesc("");
        setNewProductPrice("");
        setNewProductStock("");
        setShowAddProductModal(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustStock = async (id: string, delta: number) => {
    try {
      await fetch("/api/internal/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stockDelta: delta })
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini dari database gudang?")) return;
    try {
      await fetch(`/api/internal/products?id=${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderCustomer.trim() || !newOrderAmount) return;

    try {
      const res = await fetch("/api/internal/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newOrderCustomer,
          totalAmount: parseFloat(newOrderAmount),
          status: newOrderStatus
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewOrderCustomer("");
        setNewOrderAmount("");
        setShowAddOrderModal(false);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTelegramDigest = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTelegramStatusMsg("⚠️ Mohon isi Bot Token dan Chat ID Telegram terlebih dahulu.");
      return;
    }

    setIsSendingTelegram(true);
    setTelegramStatusMsg("");

    try {
      const res = await fetch("/api/internal/telegram-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: telegramToken.trim(),
          chatId: telegramChatId.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        setTelegramStatusMsg("✅ Sukses! Laporan eksekutif harian telah dikirim ke Telegram HP Anda.");
        localStorage.setItem("ramu_tg_token", telegramToken.trim());
        localStorage.setItem("ramu_tg_chat", telegramChatId.trim());
      } else {
        setTelegramStatusMsg(`❌ Gagal: ${json.error || "Terjadi kesalahan API Telegram"}`);
      }
    } catch (err: any) {
      setTelegramStatusMsg(`❌ Error: ${err.message || "Gagal menghubungi server"}`);
    } finally {
      setIsSendingTelegram(false);
    }
  };

  // If Owner is locked out, show the Security Checkpoint Gate
  if (!isOwnerLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-[#0a0f1d] flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md bg-[#161a2b] border border-slate-700 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500"></div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto shadow-inner text-amber-400">
              👑
            </div>
            <h1 className="text-xl font-bold text-white tracking-wider">RAMU ROASTERY</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Owner Security Checkpoint:</strong> Area ini terproteksi khusus untuk Pemilik Usaha guna mengamankan data keuangan, kontrol tim, dan rahasia operasional.
            </p>
          </div>

          <form onSubmit={handleOwnerLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 flex items-center justify-between">
                <span>PIN Pemilik Usaha</span>
                <span className="text-[11px] text-amber-400 font-bold">Default: 1234</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  placeholder="Masukkan 4 digit PIN..."
                  autoFocus
                  className="w-full bg-[#1e2336] border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-[0.3em] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
              {pinError && (
                <div className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Buka Kantor & Dashboard</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-500">
            Sistem Kantor Otonom Ramu Roastery • Next.js 15
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Office HQ":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-[#0c101c] overflow-y-auto relative font-sans">
            {/* Retro Ambient Background Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1d273d]/70 via-[#0e1424]/90 to-[#070a12] pointer-events-none"></div>

            {/* Top HUD Bar with Live Stats & Controls */}
            <div className="relative z-10 h-14 flex items-center justify-between px-4 sm:px-6 shrink-0 border-b border-slate-800/80 bg-[#121624]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="font-bold text-white tracking-[0.16em] font-mono text-sm uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  RAMU ROASTERY HQ
                </div>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px] font-mono font-bold border border-indigo-500/30">
                  11 AI Agents Alive
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold border border-amber-500/30 shadow-sm">
                  <span>👑</span>
                  <span>Owner Mode</span>
                </span>
              </div>

              {/* Live Activity Ticker */}
              <div className="hidden lg:flex items-center gap-2 max-w-md px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-hidden">
                <Radio size={12} className="text-amber-400 animate-pulse shrink-0" />
                <span className="text-slate-500 shrink-0 font-bold">LIVE:</span>
                <div className="truncate">
                  {latestEvent ? (
                    <span>
                      <strong className="text-indigo-300">[{latestEvent.speaker}]</strong> {latestEvent.message}
                    </span>
                  ) : (
                    "Semua agen sedang bertugas di pos masing-masing."
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => setIsMeetingActive(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow ${
                    isMeetingActive 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <span>☕</span>
                  <span>{isMeetingActive ? "Tutup Rapat" : "Cupping Meeting"}</span>
                </button>

                <button
                  onClick={handleOwnerLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Kunci Akses Kantor (Lock)"
                >
                  <Lock size={15} />
                </button>
              </div>
            </div>

            {/* AI Office Centerpiece Area */}
            <div className="relative z-10 flex-1 flex flex-col justify-start py-4 sm:py-6 px-2 sm:px-4 md:px-6">
              
              {/* Retro Pixel Header from Reference Image */}
              <div className="text-center mb-4 sm:mb-6 select-none">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-pixel text-white tracking-widest uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  AI OFFICE
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-pixel tracking-wider mt-2.5 opacity-90 drop-shadow">
                  A virtual office with some familiar digital employees...
                </p>
              </div>

              {/* The Metallic CRT Monitor Frame */}
              <div className="w-full max-w-[1240px] mx-auto">
                <div className="relative rounded-xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-4 border-[#4a5568]">
                  
                  {/* Top Metallic Handle / Rail with Rivets */}
                  <div className="h-7 bg-gradient-to-r from-[#6b778a] via-[#c2cdd8] via-[#e2e8f0] via-[#c2cdd8] to-[#6b778a] border-b-2 border-[#475569] flex items-center justify-between px-3 shadow-inner">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#475569] border border-[#f1f5f9] shadow-inner inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#475569] border border-[#f1f5f9] shadow-inner inline-block"></span>
                    </div>
                    <div className="text-[10px] font-silkscreen font-bold text-[#334155] tracking-widest uppercase">
                      RAMU CRT MONITOR • MULTI-AGENT TERMINAL
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#475569] border border-[#f1f5f9] shadow-inner inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#475569] border border-[#f1f5f9] shadow-inner inline-block"></span>
                    </div>
                  </div>

                  {/* Metallic Bezel Border Enclosing Screen */}
                  <div className="p-2 sm:p-3 md:p-3.5 bg-gradient-to-b from-[#8392a5] via-[#64748b] to-[#475569] border-t-2 border-l-2 border-[#94a3b8] border-r-2 border-b-2 border-[#334155]">
                    
                    {/* Inner Screen Container */}
                    <div className="bg-[#10141e] border-4 border-[#1e2430] rounded shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row h-[500px] sm:h-[560px] lg:h-[620px] overflow-hidden">
                      
                      {/* Left Pane: 2D RPG Office Canvas */}
                      <div className="flex-1 h-[280px] sm:h-[340px] lg:h-full relative overflow-hidden bg-[#0d1322]">
                        <OfficeCanvas 
                          contained={true}
                          selectedAgent={selectedAgent}
                          onSelectAgent={(agent) => {
                            setSelectedAgent(agent);
                            setIsMeetingActive(false);
                            setDirectAgentSpeech(null);
                          }}
                          isMeetingActive={isMeetingActive}
                          meetingSpeaker={meetingSpeaker || directAgentSpeech}
                          onOfficeEvent={handleOfficeEvent}
                        />
                      </div>

                      {/* Right Pane: Peach Terminal / Meeting Panel */}
                      <div className="w-full lg:w-[380px] xl:w-[420px] h-[220px] sm:h-[220px] lg:h-full shrink-0 border-t-4 lg:border-t-0 lg:border-l-4 border-[#2b3345] bg-[#df9d76] flex flex-col overflow-hidden relative">
                        {isMeetingActive ? (
                          <MeetingPanel 
                            theme="retro"
                            onClose={() => {
                              setIsMeetingActive(false);
                              setMeetingSpeaker(null);
                            }}
                            onSpeakerChange={setMeetingSpeaker}
                            onViewProjects={() => setActiveTab("Projects")}
                          />
                        ) : (
                          <ControlPanel 
                            theme="retro"
                            selectedAgent={selectedAgent} 
                            onClose={() => setSelectedAgent(null)} 
                            onAgentSpeech={(speaker, text) => {
                              setDirectAgentSpeech({ speaker, text });
                              setTimeout(() => setDirectAgentSpeech(null), 5000);
                            }}
                          />
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Character Roster Dock (From Reference Image) */}
              <div className="w-full max-w-[1240px] mx-auto mt-4 sm:mt-5 pb-6">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                  {ALL_AGENTS_DATA.map((agent) => {
                    const isSelected = selectedAgent === agent.id;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAgent(null);
                          } else {
                            setSelectedAgent(agent.id);
                            setIsMeetingActive(false);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md font-silkscreen text-[11px] md:text-xs transition-all shadow-md select-none border-2 ${
                          isSelected
                            ? "bg-[#3f4c6e] border-amber-400 text-amber-200 scale-105 shadow-[0_0_12px_rgba(251,191,36,0.6)] -translate-y-0.5"
                            : "bg-[#20273a] hover:bg-[#2e374f] border-[#445070] hover:border-[#67779f] text-slate-200 hover:text-white"
                        }`}
                      >
                        <span className="text-base leading-none drop-shadow">{agent.emoji}</span>
                        <span className="font-bold tracking-wider">{agent.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Roastery Telemetry Footer Strip */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#121624]/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Suhu Gudang: 22°C / 60% RH
                    </span>
                    <span className="text-slate-600">|</span>
                    <span>Roaster Probat: 205°C Running</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Ramu Digital Workforce:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      11 / 11 Online
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );

      case "AI Agents":
        return (
          <div className="flex-1 p-8 text-white bg-[#0f172a] overflow-y-auto font-mono">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">👥 AI Agents Directory (11 Pegawai)</h1>
                <p className="text-slate-400 text-xs mt-1">
                  Seluruh agen virtual beroperasi secara otonom dengan peran spesifik di Ramu Roastery.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
                11/11 Active Workforce
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ALL_AGENTS_DATA.map(agent => (
                <div 
                  key={agent.id} 
                  className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-lg group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow">
                          {agent.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                            {agent.name}
                          </div>
                          <div className="text-indigo-400 text-xs">{agent.role}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {agent.status}
                      </span>
                    </div>

                    <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800/80 space-y-1">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tugas Aktif</div>
                      <div className="text-xs text-slate-300 leading-snug">{agent.currentTask}</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">Divisi: {agent.dept}</span>
                    <button
                      onClick={() => {
                        setSelectedAgent(agent.id);
                        setActiveTab("Office HQ");
                      }}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare size={12} /> Buka Meja
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "Projects":
        return (
          <div className="flex-1 p-8 text-white bg-[#0f172a] h-full overflow-hidden">
            <KanbanBoard />
          </div>
        );

      case "Storage Room":
        const totalGreenBeans = products
          .filter(p => p.name.toLowerCase().includes("green beans") || p.name.toLowerCase().includes("mentah"))
          .reduce((acc, p) => acc + (p.stock * 60), 0);

        const totalReadyPack = products
          .filter(p => !p.name.toLowerCase().includes("green beans"))
          .reduce((acc, p) => acc + p.stock, 0);

        return (
          <div className="flex-1 p-8 text-white bg-[#0f172a] overflow-y-auto font-mono space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Package className="text-amber-400" /> Storage Room & Live Inventory
                </h1>
                <p className="text-slate-400 text-xs mt-1">
                  Sinkronisasi riil dengan database PostgreSQL: Kelola stok fisik green beans & kemasan siap kirim.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchProducts}
                  className="p-2 text-slate-400 hover:text-white bg-[#161a2b] border border-slate-700 rounded-lg"
                  title="Refresh Data"
                >
                  <RefreshCw size={15} className={isProductsLoading ? "animate-spin text-indigo-400" : ""} />
                </button>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Tambah Produk / Biji Kopi</span>
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Total Biji Mentah (Green Beans)</div>
                <div className="text-2xl text-emerald-400 font-bold">
                  {totalGreenBeans > 0 ? `${totalGreenBeans.toLocaleString("id-ID")} Kg` : "1.380 Kg"}
                </div>
                <div className="text-[11px] text-slate-500">Estimasi dari stok karung terdata</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Ready Stock (Kemasan Jadi)</div>
                <div className="text-2xl text-blue-400 font-bold">{totalReadyPack.toLocaleString("id-ID")} Pack</div>
                <div className="text-[11px] text-slate-500">Single Origin & House Blend siap kirim</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Kondisi Fisik Gudang</div>
                <div className="text-2xl text-amber-400 font-bold">22°C / 60% RH</div>
                <div className="text-[11px] text-emerald-400">Suhu & kelembaban terkalibrasi optimal</div>
              </div>
            </div>

            {/* Live Inventory Table */}
            <div className="bg-[#161a2b] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center font-bold text-sm">
                <span>Daftar Stok Produk Gudang ({products.length} Item Terdaftar)</span>
                <span className="text-xs text-slate-400 font-normal">Sinkron PostgreSQL Supabase</span>
              </div>
              <div className="p-4 space-y-3">
                {products.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-[#1e2336] rounded-xl border border-slate-800 text-xs gap-3">
                    <div>
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="text-slate-400 text-[11px]">{item.description}</div>
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <span className="text-slate-300 font-semibold">Rp {item.price.toLocaleString("id-ID")}</span>
                      <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => handleAdjustStock(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                          title="Kurangi 1"
                        >
                          -
                        </button>
                        <span className="text-emerald-400 font-bold px-2">{item.stock}</span>
                        <button
                          onClick={() => handleAdjustStock(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                          title="Tambah 1"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    Belum ada produk tersimpan di database. Klik tombol "Tambah Produk" di atas.
                  </div>
                )}
              </div>
            </div>

            {/* Add Product Modal */}
            {showAddProductModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#161a2b] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus size={18} className="text-indigo-400" /> Tambah Produk / Biji Kopi Baru
                  </h3>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Nama Produk</label>
                      <input
                        type="text"
                        required
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="Misal: Aceh Gayo Natural (200g)..."
                        className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Deskripsi / Tasting Notes</label>
                      <input
                        type="text"
                        value={newProductDesc}
                        onChange={(e) => setNewProductDesc(e.target.value)}
                        placeholder="Notes of chocolate, floral jasmine, medium body"
                        className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Harga Jual (Rp)</label>
                        <input
                          type="number"
                          required
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(e.target.value)}
                          placeholder="115000"
                          className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Stok Awal</label>
                        <input
                          type="number"
                          required
                          value={newProductStock}
                          onChange={(e) => setNewProductStock(e.target.value)}
                          placeholder="50"
                          className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow"
                      >
                        Simpan ke Database
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case "Roastery":
        return (
          <div className="flex-1 p-8 text-white bg-[#0f172a] overflow-y-auto font-mono space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="text-amber-400" /> Roastery Operations & Cupping Lab
            </h1>
            <p className="text-slate-400 text-xs">Monitoring mesin sangrai kopi Probat & evaluasi skor sensorik R&D.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Mesin Roaster Probat</span>
                  <Flame size={15} className="text-amber-400" />
                </div>
                <div className="text-2xl text-amber-400 font-bold">205°C Running</div>
                <div className="text-[11px] text-slate-500">Batch 4 dari 6 selesai hari ini</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Development Time Ratio</span>
                  <TrendingUp size={15} className="text-emerald-400" />
                </div>
                <div className="text-2xl text-emerald-400 font-bold">14.2% (Optimal)</div>
                <div className="text-[11px] text-slate-500">Profil rasa seimbang, no bake defect</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Cupping Score Tertinggi</span>
                  <Sparkles size={15} className="text-indigo-400" />
                </div>
                <div className="text-2xl text-indigo-400 font-bold">87.5 Pts (Specialty)</div>
                <div className="text-[11px] text-slate-500">Batch #15 Aceh Gayo Anaerobic</div>
              </div>
            </div>

            <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="font-bold text-sm text-indigo-300">Catatan Kalibrasi Rasa R&D (Kafin & Tim):</div>
              <div className="p-4 bg-[#1e2336] rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                "Hasil cupping session siang ini mengonfirmasi profil roast Flores Bajawa Honey menunjukkan peningkatan sweetness yang signifikan (notes madu bunga dan cokelat lembut). Sementara Aceh Gayo Anaerobic memiliki sparkling winey acidity yang sangat disukai pelanggan home-brewer. Siap rilis batch baru minggu ini."
              </div>
            </div>
          </div>
        );

      case "Finances":
        return (
          <div className="flex-1 p-8 text-white bg-[#0f172a] overflow-y-auto font-mono space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="text-emerald-400" /> Financial Analytics & Real-Time Orders
                </h1>
                <p className="text-slate-400 text-xs mt-1">
                  Rekonsiliasi omzet harian, transaksi kasir, dan penagihan B2B terhubung database.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchOrders}
                  className="p-2 text-slate-400 hover:text-white bg-[#161a2b] border border-slate-700 rounded-lg"
                  title="Refresh Data"
                >
                  <RefreshCw size={15} className={isOrdersLoading ? "animate-spin text-indigo-400" : ""} />
                </button>
                <button
                  onClick={() => setShowAddOrderModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Catat Penjualan / Order Baru</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Total Omzet Terdata</div>
                <div className="text-2xl text-emerald-400 font-bold">
                  Rp {financeSummary.totalRevenue.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-emerald-500">{financeSummary.orderCount} transaksi tercatat</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Gross Profit Margin</div>
                <div className="text-2xl text-blue-400 font-bold">42.5%</div>
                <div className="text-[11px] text-slate-500">COGS biji mentah & kemasan efisien</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Faktur Pajak PPN 11%</div>
                <div className="text-2xl text-yellow-400 font-bold">
                  Rp {Math.round(financeSummary.totalRevenue * 0.11).toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-500">Rekapitulasi otomatis Fina</div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#161a2b] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center font-bold text-sm">
                <span>Riwayat Transaksi Penjualan Masuk ({orders.length} Pesanan)</span>
                <span className="text-xs text-slate-400 font-normal">Sinkronisasi Database Riil</span>
              </div>
              <div className="p-4 space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3.5 bg-[#1e2336] rounded-xl border border-slate-800 text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{order.customerName}</div>
                      <div className="text-slate-400 text-[11px]">
                        ID: {order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400 text-sm">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        order.status === "PAID" 
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Order Modal */}
            {showAddOrderModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#161a2b] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus size={18} className="text-emerald-400" /> Catat Transaksi / Order Baru
                  </h3>
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Nama Pembeli / Kafe B2B</label>
                      <input
                        type="text"
                        required
                        value={newOrderCustomer}
                        onChange={(e) => setNewOrderCustomer(e.target.value)}
                        placeholder="Misal: Kafe Temu Rasa (Bandung)..."
                        className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Total Nilai Transaksi (Rp)</label>
                      <input
                        type="number"
                        required
                        value={newOrderAmount}
                        onChange={(e) => setNewOrderAmount(e.target.value)}
                        placeholder="3500000"
                        className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Status Pembayaran</label>
                      <select
                        value={newOrderStatus}
                        onChange={(e) => setNewOrderStatus(e.target.value)}
                        className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PAID">LUNAS (PAID)</option>
                        <option value="SHIPPED">TERKIRIM (SHIPPED)</option>
                        <option value="PENDING">TEMPO / PENDING</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddOrderModal(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow"
                      >
                        Simpan Penjualan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case "Account":
        return (
          <div className="flex-1 p-8 text-white bg-[#0f172a] overflow-y-auto font-mono space-y-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                ⚙️ System & Executive Settings
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Konfigurasi bot notifikasi Telegram, keamanan PIN Owner, dan integrasi cloud AI Engine.
              </p>
            </div>

            <div className="max-w-2xl space-y-6">
              
              {/* Telegram Bot Notification Card */}
              <div className="bg-[#161a2b] border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-lg">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-white">Bot Notifikasi Telegram ke HP Owner</h2>
                      <div className="text-[11px] text-slate-400">Laporan harian otomatis masuk ke smartphone Anda</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                    Mobile Alert
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Telegram Bot Token</label>
                    <input
                      type="text"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      placeholder="Contoh: 1234567890:ABCdefGhIjkLmNoPqRsTuVwXyZ"
                      className="w-full bg-[#1e2336] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Telegram Chat ID Anda</label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="Contoh: 987654321 (Dapatkan dari @userinfobot)"
                      className="w-full bg-[#1e2336] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleSendTelegramDigest}
                      disabled={isSendingTelegram}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSendingTelegram ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>📲 Kirim Laporan Harian ke Telegram (Test Send)</span>
                    </button>
                  </div>

                  {telegramStatusMsg && (
                    <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800 text-xs">
                      {telegramStatusMsg}
                    </div>
                  )}

                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <div className="font-bold text-slate-300">Cara mudah buat bot Telegram (1 menit):</div>
                    <ol className="list-decimal list-inside space-y-0.5">
                      <li>Buka Telegram, cari <strong>@BotFather</strong>, ketik <code>/newbot</code> untuk buat bot & dapat token.</li>
                      <li>Buka bot yang baru dibuat, klik <strong>Start</strong>.</li>
                      <li>Cari <strong>@userinfobot</strong> di Telegram untuk melihat Chat ID Anda.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Owner Security PIN Settings */}
              <div className="bg-[#161a2b] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-white">Ganti PIN Keamanan Owner</h2>
                      <div className="text-[11px] text-slate-400">PIN untuk membuka proteksi kantor saat terkunci</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Masukkan PIN baru (4-6 digit)..."
                    id="new-pin-input"
                    className="flex-1 bg-[#1e2336] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono shadow-inner"
                  />
                  <button
                    onClick={() => {
                      const inp = document.getElementById("new-pin-input") as HTMLInputElement;
                      if (!inp?.value?.trim()) return;
                      setOwnerPin(inp.value.trim());
                      localStorage.setItem("ramu_owner_pin", inp.value.trim());
                      alert("PIN berhasil diubah!");
                      inp.value = "";
                    }}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                  >
                    Ubah PIN
                  </button>
                </div>
              </div>

              {/* AI Engine Status Card */}
              <div className="bg-[#161a2b] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
                      🤖
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-white">Google Gemini / Local AI Engine</h2>
                      <div className="text-[11px] text-slate-400">Multi-Agent Cognitive Backend</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Engine Aktif
                  </span>
                </div>

                <div className="p-4 bg-[#1e2336] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Saat ini agen beroperasi dengan <strong>High-Fidelity Contextual Engine</strong> yang terhubung ke database PostgreSQL Supabase, mampu berdiskusi multi-turn, menawar harga, menguji sampel, dan mengelola Kanban secara dinamis.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs text-slate-400 block font-semibold">Gemini API Key (Opsional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      placeholder="Masukkan AIzaSy... (atau biarkan default untuk mode lokal)"
                      id="gemini-key-input"
                      className="flex-1 bg-[#1e2336] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono shadow-inner"
                    />
                    <button
                      onClick={async () => {
                        const input = document.getElementById("gemini-key-input") as HTMLInputElement;
                        if (!input?.value?.trim()) return;
                        try {
                          const res = await fetch("/api/internal/config", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ apiKey: input.value.trim() })
                          });
                          const json = await res.json();
                          alert(json.message || "API Key berhasil disimpan!");
                          input.value = "";
                        } catch (e) {
                          alert("Gagal menyimpan API Key.");
                        }
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );

      default:
        return (
          <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-lg">
            {activeTab} Module Under Construction 🚧
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0f1d] text-slate-300 font-sans overflow-hidden">
      
      {/* Left Sidebar */}
      <div className="w-[230px] flex flex-col bg-[#121624] border-r border-slate-800 shrink-0 z-20 font-mono">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white shadow-lg text-sm">
            RR
          </div>
          <div>
            <span className="font-bold text-white tracking-wider text-sm block">RAMU</span>
            <span className="text-[10px] text-indigo-400 tracking-wider">VIRTUAL OFFICE</span>
          </div>
        </div>
        
        <div className="px-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-5">Main Workspaces</div>
        <nav className="flex-1 px-3 space-y-1.5">
          <NavItem icon={<Building2 size={16}/>} label="Office HQ" active={activeTab === "Office HQ"} onClick={() => setActiveTab("Office HQ")} />
          <NavItem icon={<Users size={16}/>} label="AI Agents" active={activeTab === "AI Agents"} onClick={() => setActiveTab("AI Agents")} />
          <NavItem icon={<FolderKanban size={16}/>} label="Projects" active={activeTab === "Projects"} onClick={() => setActiveTab("Projects")} />
          <NavItem icon={<Archive size={16}/>} label="Storage Room" active={activeTab === "Storage Room"} onClick={() => setActiveTab("Storage Room")} />
          <NavItem icon={<Coffee size={16}/>} label="Roastery" active={activeTab === "Roastery"} onClick={() => setActiveTab("Roastery")} />
          <NavItem icon={<DollarSign size={16}/>} label="Finances" active={activeTab === "Finances"} onClick={() => setActiveTab("Finances")} />
        </nav>
        
        <div className="px-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">System</div>
        <nav className="px-3 pb-4 space-y-1.5">
          <NavItem icon={<UserCircle size={16}/>} label="Account" active={activeTab === "Account"} onClick={() => setActiveTab("Account")} />
          <NavItem icon={<Lock size={16}/>} label="Log Out" onClick={handleOwnerLogout} />
        </nav>
      </div>

      {/* Dynamic Main Content Area */}
      {renderContent()}

    </div>
  );
}
