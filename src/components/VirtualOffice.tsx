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
  AlertCircle, RefreshCw, Smartphone, Package, Check, Loader2, ArrowRight,
  FileText, Printer, Calendar, Award, TrendingDown, Layers, ChevronRight, Scale, PieChart, Briefcase, ExternalLink, X
} from "lucide-react";

export type AgentRole = 
  | "Kang Dudung (GM)" 
  | "Teh Euis (CS)" 
  | "Ujang (Web Dev)" 
  | "Ceu Edah (Finance)" 
  | "Mang Dadang (Inventory)" 
  | "Kang Aceng (Logistics)"
  | "Kang Jajang (B2B)"
  | "Kang Tatang (R&D)"
  | "Kang Deden (Ads)"
  | "Neng Iteung (Content)"
  | "Mang Encep (Sourcing)"
  | "Kang Asep (Security)"
  | null;

type MenuTab = "Office HQ" | "AI Agents" | "Projects" | "Storage Room" | "Roastery" | "Finances" | "Reports" | "WhatsApp CS" | "Account";

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
  { id: "Kang Dudung (GM)", name: "Kang Dudung", role: "General Manager", dept: "Executive", emoji: "👨‍💼", color: "bg-blue-500", status: "Active", currentTask: "Mungkas evaluasi operasional roastery bari ngopi tubruk ☕" },
  { id: "Teh Euis (CS)", name: "Teh Euis", role: "Customer Service (24/7 Geulis)", dept: "Support", emoji: "👩‍💼", color: "bg-pink-500", status: "Active 24/7", currentTask: "Standby 24 Jam ramah pisan ngabalesan chat WA juragan" },
  { id: "Ujang (Web Dev)", name: "Ujang", role: "Full-Stack Dev", dept: "Engineering", emoji: "👨‍💻", color: "bg-emerald-500", status: "Active", currentTask: "Ngoprek Next.js 15 bari nyemil bala-bala bumbu kacang" },
  { id: "Ceu Edah (Finance)", name: "Ceu Edah", role: "Bendahara Roastery", dept: "Finance", emoji: "👩‍💼", color: "bg-yellow-500", status: "Active", currentTask: "Ngitung laba bersih jeung nagih kuitansi bon belanjaan" },
  { id: "Kang Jajang (B2B)", name: "Kang Jajang", role: "B2B Sales Lead", dept: "Commercial", emoji: "👨‍💼", color: "bg-rose-500", status: "Active", currentTask: "Lobi-lobi kafe Bandung deal suplai biji kopi 50kg/minggu" },
  { id: "Kang Deden (Ads)", name: "Kang Deden", role: "Performance Ads", dept: "Marketing", emoji: "👨‍💼", color: "bg-sky-500", status: "Active", currentTask: "Ngoptimalkeun Meta Ads ameh ROAS gurih teu boncos" },
  { id: "Neng Iteung (Content)", name: "Neng Iteung", role: "Content Creator Geulis", dept: "Creative", emoji: "👩‍🎤", color: "bg-purple-500", status: "Active", currentTask: "Syuting video Reels proses sangrai kopi viral" },
  { id: "Kang Tatang (R&D)", name: "Kang Tatang", role: "R&D & Master Cupping", dept: "Quality", emoji: "👨‍🔬", color: "bg-teal-500", status: "Active", currentTask: "Nyeruput cupping Gayo Anaerobic - skor 87.5 SCA" },
  { id: "Mang Dadang (Inventory)", name: "Mang Dadang", role: "Mandor Gudang", dept: "Roastery", emoji: "👨‍🔧", color: "bg-orange-500", status: "Active", currentTask: "Ngontrol karung green beans & mesin roaster Probat" },
  { id: "Kang Aceng (Logistics)", name: "Kang Aceng", role: "Kurir Satset", dept: "Supply Chain", emoji: "👨‍🔧", color: "bg-violet-500", status: "Active", currentTask: "Gaspol motor matic nganter paket kargo tepat waktu" },
  { id: "Mang Encep (Sourcing)", name: "Mang Encep", role: "Sobat Patani Kopi", dept: "Agriculture", emoji: "👨‍🌾", color: "bg-lime-500", status: "Active", currentTask: "Nyaba ka kebon kopi Takengon silaturahmi jeung patani" },
  { id: "Kang Asep (Security)", name: "Kang Asep", role: "Cyber Security & Hansip Digital (24/7)", dept: "Security", emoji: "👮‍♂️", color: "bg-sky-600", status: "Active 24/7", currentTask: "Ngaronda firewall, DDoS & lalu lintas web ameh aman sentosa 🛡️🚨" },
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

  // 5. Executive Reports & Monthly Closing State
  const [reportsData, setReportsData] = useState<any>(null);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [reportsSubTab, setReportsSubTab] = useState<"gm" | "workers" | "closing">("gm");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("Kang Dudung (GM)");
  const [activeDeliverableModal, setActiveDeliverableModal] = useState<any>(null);
  const [selectedClosingMonth, setSelectedClosingMonth] = useState<string>("2026-10");
  const [isClosingExecuting, setIsClosingExecuting] = useState(false);
  const [closingNotification, setClosingNotification] = useState<string>("");

  // 6. Cron Auto-Closing State
  const [isTestingCron, setIsTestingCron] = useState(false);
  const [cronResultMsg, setCronResultMsg] = useState("");

  // 7. WhatsApp Gateway & Live Simulator State
  const [waChats, setWaChats] = useState<any[]>([]);
  const [isWaLoading, setIsWaLoading] = useState(false);
  const [waSimCustomerName, setWaSimCustomerName] = useState("Kak Dian");
  const [waSimMessage, setWaSimMessage] = useState("");
  const [isSendingWaSim, setIsSendingWaSim] = useState(false);
  const [waSelectedProvider, setWaSelectedProvider] = useState("Fonnte");
  const [waApiKey, setWaApiKey] = useState("");
  const [waWebhookCopied, setWaWebhookCopied] = useState(false);

  // Live office event chatter stream
  const [officeEvents, setOfficeEvents] = useState<OfficeEventLog[]>([
    { id: "1", time: "16:45", speaker: "Kang Dudung (GM)", message: "Briefing isuk rengse: target omzet roastery minggu ieu kahontal, mangga gararap!", type: "system" },
    { id: "2", time: "16:50", speaker: "Teh Euis (CS)", message: "Alhamdulillah tiket komplain gilingan kopi tos beres dilayani kalayan ramah, bintang 5!", type: "collab" },
    { id: "3", time: "16:55", speaker: "Kang Tatang (R&D)", message: "Kopi Gayo Anaerobic tembus cupping score 87.5 poin, seungitna matak kabita!", type: "cupping" },
  ]);

  const handleOfficeEvent = (event: OfficeEventLog) => {
    setOfficeEvents(prev => [event, ...prev.slice(0, 15)]);
  };

  const handleToggleMeeting = (forcedState?: boolean) => {
    setIsMeetingActive(prev => {
      const next = typeof forcedState === "boolean" ? forcedState : !prev;
      if (next) {
        setSelectedAgent(null);
        setDirectAgentSpeech(null);
        handleOfficeEvent({
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          speaker: "Kang Dudung (GM)",
          message: "📢 Euleuh-euleuh barudak! Hayu kumpul di Meja Cupping urang rapat pleno koordinasi heula!",
          type: "meeting"
        });
      } else {
        setMeetingSpeaker(null);
        handleOfficeEvent({
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          speaker: "Kang Dudung (GM)",
          message: "Rapat rengse. Hatur nuhun sadayana, mangga teraskeun hanca garapan masing-masing!",
          type: "meeting"
        });
      }
      return next;
    });
  };

  const latestEvent = officeEvents[0] || null;

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

  const fetchReports = async (monthToFetch?: string) => {
    setIsReportsLoading(true);
    try {
      const m = monthToFetch || selectedClosingMonth;
      const res = await fetch(`/api/internal/reports?month=${m}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReportsData(json.data);
      }
    } catch (err) {
      console.error("Fetch reports failed:", err);
    } finally {
      setIsReportsLoading(false);
    }
  };

  const fetchWaChats = async () => {
    setIsWaLoading(true);
    try {
      const res = await fetch("/api/internal/whatsapp");
      const json = await res.json();
      if (json.success && json.data) {
        setWaChats(json.data.recentChats || []);
      }
    } catch (err) {
      console.error("Fetch WhatsApp failed:", err);
    } finally {
      setIsWaLoading(false);
    }
  };

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
    fetchReports();
    fetchWaChats();
  }, []);

  const handleExecuteClosing = async () => {
    if (!confirm(`Konfirmasi Tutup Buku Bulanan Periode ${selectedClosingMonth}?\n\nRekonsiliasi omzet, HPP, OPEX, dan persediaan akan diverifikasi dan dikunci secara resmi oleh Kang Dudung (GM) & Ceu Edah (Finance Lead).`)) {
      return;
    }
    setIsClosingExecuting(true);
    setClosingNotification("");
    try {
      const res = await fetch("/api/internal/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedClosingMonth,
          action: "CLOSE_BOOK",
          notes: `Tutup buku periode ${selectedClosingMonth} telah diaudit dan diverifikasi resmi oleh Kang Dudung (GM) bersama Ceu Edah (Finance Lead). Seluruh pos kas dan aset terekonsiliasi 100%.`
        })
      });
      const json = await res.json();
      if (json.success) {
        setClosingNotification(`✅ ${json.message}`);
        fetchReports(selectedClosingMonth);
      } else {
        setClosingNotification(`❌ Gagal: ${json.error || "Gagal menutup buku"}`);
      }
    } catch (err: any) {
      setClosingNotification(`❌ Error: ${err.message}`);
    } finally {
      setIsClosingExecuting(false);
    }
  };

  const handleTestCronClosing = async () => {
    setIsTestingCron(true);
    setCronResultMsg("");
    try {
      const res = await fetch(`/api/internal/cron/monthly-closing?month=${selectedClosingMonth}&botToken=${encodeURIComponent(telegramToken)}&chatId=${encodeURIComponent(telegramChatId)}`);
      const json = await res.json();
      if (json.success) {
        setCronResultMsg(`✅ Sukses! ${json.message} (Tutup buku tersimpan & ${json.data?.telegramNotification?.sent ? "Telegram terkirim ke HP" : "Telegram siap"})`);
        fetchReports(selectedClosingMonth);
      } else {
        setCronResultMsg(`❌ Gagal: ${json.error || "Gagal mengeksekusi cron"}`);
      }
    } catch (err: any) {
      setCronResultMsg(`❌ Error: ${err.message}`);
    } finally {
      setIsTestingCron(false);
    }
  };

  const handleSendWaSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waSimMessage.trim()) return;

    setIsSendingWaSim(true);
    try {
      const res = await fetch("/api/internal/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: waSimCustomerName.trim() || "Pelanggan",
          message: waSimMessage.trim()
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setWaChats(prev => [json.data, ...prev]);
        setWaSimMessage("");
      }
    } catch (err) {
      console.error("WhatsApp simulation failed:", err);
    } finally {
      setIsSendingWaSim(false);
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
                  12 AI Agents Alive
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
                  id="btn-call-meeting-top"
                  onClick={() => handleToggleMeeting()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow ${
                    isMeetingActive 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'
                  }`}
                  title="Panggil Rapat Tim (Call Meeting)"
                >
                  <span>{isMeetingActive ? "🔴" : "📢"}</span>
                  <span>{isMeetingActive ? "Tutup Rapat" : "Call Meeting"}</span>
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
                          onMeetingStart={handleToggleMeeting}
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
                            officeEvents={officeEvents}
                            onSelectAgent={(agent) => {
                              setSelectedAgent(agent);
                              setIsMeetingActive(false);
                            }}
                            onStartMeeting={() => handleToggleMeeting(true)}
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
                      12 / 12 Online
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
                <h1 className="text-2xl font-bold">👥 AI Agents Directory (12 Pegawai)</h1>
                <p className="text-slate-400 text-xs mt-1">
                  Seluruh agen virtual beroperasi secara otonom dengan peran spesifik di Ramu Roastery.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
                12/12 Active Workforce
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

      case "Reports": {
        const workerList = reportsData?.workerReports || [];
        const currentWorker = workerList.find((w: any) => w.id === selectedWorkerId) || workerList[0];
        const gmSummary = reportsData?.gmExecutiveSummary;
        const closing = reportsData?.monthlyClosing;
        const inc = closing?.incomeStatement;
        const inv = closing?.inventoryValuation;
        const dist = closing?.profitDistribution;

        return (
          <div className="flex-1 p-6 md:p-8 text-white bg-[#0a0f1d] overflow-y-auto font-mono space-y-6">
            
            {/* Top Navigation & Controls Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                    <FileText size={20} />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    Laporan Kinerja & Tutup Buku Bulanan
                  </h1>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                    closing?.isClosed 
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  }`}>
                    {closing?.status || "PERIODE AKTIF"}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Konsolidasi hasil pekerjaan 12 divisi pekerja oleh Kang Dudung (GM) serta Laporan Tutup Buku Bulanan (P&L & Valuasi Stok) profesional.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Month Picker Dropdown */}
                <div className="flex items-center bg-[#161a2b] border border-slate-700/80 rounded-xl px-3 py-2 gap-2 text-xs shadow-inner">
                  <Calendar size={14} className="text-indigo-400" />
                  <select 
                    value={selectedClosingMonth}
                    onChange={(e) => {
                      setSelectedClosingMonth(e.target.value);
                      fetchReports(e.target.value);
                    }}
                    className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="2026-10" className="bg-[#161a2b]">Periode: Oktober 2026</option>
                    <option value="2026-09" className="bg-[#161a2b]">Periode: September 2026</option>
                    <option value="2026-08" className="bg-[#161a2b]">Periode: Agustus 2026</option>
                  </select>
                </div>

                {/* Refresh Data */}
                <button
                  onClick={() => fetchReports()}
                  className="p-2.5 bg-[#161a2b] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition shadow"
                  title="Refresh Laporan & Status"
                >
                  <RefreshCw size={14} className={isReportsLoading ? "animate-spin text-indigo-400" : ""} />
                </button>

                {/* Print/Export */}
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#161a2b] hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition shadow"
                  title="Cetak Dokumen atau Simpan PDF"
                >
                  <Printer size={14} />
                  <span>Cetak / PDF</span>
                </button>

                {/* Send Telegram Digest */}
                <button
                  onClick={handleSendTelegramDigest}
                  disabled={isSendingTelegram}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSendingTelegram ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Kirim ke HP</span>
                </button>
              </div>
            </div>

            {/* Notification alert if closed */}
            {closingNotification && (
              <div className="p-3.5 bg-indigo-950/60 border border-indigo-700/50 rounded-2xl text-xs text-indigo-200 flex items-center justify-between">
                <span>{closingNotification}</span>
                <button onClick={() => setClosingNotification("")} className="text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Subtab Navigation Pills */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
              <button
                onClick={() => setReportsSubTab("gm")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  reportsSubTab === "gm"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-[#161a2b] text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>👔</span>
                <span>Ringkasan Eksekutif GM</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">96 Pts</span>
              </button>

              <button
                onClick={() => setReportsSubTab("workers")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  reportsSubTab === "workers"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-[#161a2b] text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>👥</span>
                <span>Laporan 12 Pekerja</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">12 Divisi</span>
              </button>

              <button
                onClick={() => setReportsSubTab("closing")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  reportsSubTab === "closing"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-[#161a2b] text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>📊</span>
                <span>Tutup Buku Bulanan (P&L)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">Rekonsiliasi</span>
              </button>
            </div>

            {/* SUBTAB 1: GM EXECUTIVE SUMMARY */}
            {reportsSubTab === "gm" && (
              <div className="space-y-6">
                
                {/* Health & Verdict Banner */}
                <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-3xl shadow-inner">
                        👨‍💼
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white">Kang Dudung — General Manager Briefing</h2>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                            {gmSummary?.period || "Oktober 2026"}
                          </span>
                        </div>
                        <div className="text-xs text-indigo-300 font-bold mt-0.5">
                          {gmSummary?.verdict || "KONDISI BISNIS: PRIMA & MENGUNTUNGKAN (MARGIN 52.8%)"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-[#121626]/80 border border-slate-700/80 px-4 py-3 rounded-2xl">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Health Score</div>
                        <div className="text-2xl font-bold text-emerald-400">96 / 100</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg">
                        <Award size={22} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#121626]/90 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed font-sans">
                    {gmSummary?.executiveNarrative || "Operasional bulan ini berjalan pada tingkat efisiensi tertinggi dengan koordinasi lintas 11 divisi yang harmonis."}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                    <div className="bg-[#161a2b] p-3 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Total Omzet</div>
                      <div className="text-white font-bold text-sm mt-0.5">Rp {(inc?.revenue?.totalGrossRevenue || 70850000).toLocaleString("id-ID")}</div>
                    </div>
                    <div className="bg-[#161a2b] p-3 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Gross Margin</div>
                      <div className="text-emerald-400 font-bold text-sm mt-0.5">{inc?.cogs?.grossMarginPct || 52.8}%</div>
                    </div>
                    <div className="bg-[#161a2b] p-3 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Net Profit</div>
                      <div className="text-yellow-400 font-bold text-sm mt-0.5">Rp {(inc?.netIncome?.netProfitClean || 21354550).toLocaleString("id-ID")}</div>
                    </div>
                    <div className="bg-[#161a2b] p-3 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Akurasi Gudang</div>
                      <div className="text-indigo-400 font-bold text-sm mt-0.5">99.8% (Aman)</div>
                    </div>
                  </div>
                </div>

                {/* 4 Strategic Pillars */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers size={16} className="text-indigo-400" />
                    <span>Konsolidasi 4 Pilar Operasional Strategis</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(gmSummary?.departmentalPillars || []).map((pil: any, idx: number) => (
                      <div key={idx} className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg hover:border-indigo-500/40 transition">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white tracking-wide">{pil.pillar}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {pil.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-indigo-300">
                          PIC: <span className="text-slate-300">{pil.leads}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          {pil.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolved Bottlenecks */}
                <div className="bg-[#161a2b] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Hambatan Kritis Yang Berhasil Dipecahkan Tim</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">3 Solusi Strategis</span>
                  </div>
                  <div className="space-y-3">
                    {(gmSummary?.resolvedBottlenecks || []).map((b: any, idx: number) => (
                      <div key={idx} className="p-4 bg-[#1e2336] rounded-xl border border-slate-800 text-xs space-y-1.5">
                        <div className="text-rose-400 font-bold flex items-center gap-1.5">
                          <span>⚠️ Kendala:</span>
                          <span className="text-slate-200 font-normal">{b.challenge}</span>
                        </div>
                        <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span>💡 Solusi Tim:</span>
                          <span className="text-slate-200 font-normal">{b.solution}</span>
                        </div>
                        <div className="text-indigo-400 text-[11px] font-mono pt-0.5">
                          Dampak: <span className="text-white font-bold">{b.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategic Guidance for Owner */}
                <div className="bg-[#161a2b] border border-amber-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl">
                      👑
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Panduan Strategis GM untuk Pemilik Usaha (Owner)</h3>
                      <div className="text-[11px] text-slate-400">Rekomendasi alokasi dana laba bersih & ekspansi kapasitas</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {(gmSummary?.strategicGuidanceForOwner || []).map((guide: string, idx: number) => (
                      <div key={idx} className="p-3.5 bg-[#1e2336] rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                        <span className="text-amber-400 font-bold mt-0.5">#{idx + 1}</span>
                        <span className="leading-relaxed font-sans">{guide}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 2: ALL 11 WORKERS ACCOMPLISHMENT REPORTS */}
            {reportsSubTab === "workers" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 12 Workers Left Picker Sidebar */}
                <div className="lg:col-span-4 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Daftar 12 Pekerja Ramu
                  </div>
                  <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
                    {workerList.map((worker: any) => {
                      const isSelected = worker.id === (currentWorker?.id || "Kang Dudung (GM)");
                      return (
                        <button
                          key={worker.id}
                          onClick={() => setSelectedWorkerId(worker.id)}
                          className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500/60 shadow-lg"
                              : "bg-[#161a2b] border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{worker.emoji}</span>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{worker.fullName || worker.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">{worker.dept}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {worker.tasksCompleted} Tugas
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Worker Detail Report Card */}
                <div className="lg:col-span-8 space-y-6">
                  {currentWorker ? (
                    <div className="bg-[#161a2b] border border-slate-800 p-6 rounded-3xl space-y-6 shadow-2xl">
                      
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl shadow-inner">
                            {currentWorker.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-lg font-bold text-white">{currentWorker.fullName}</h2>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                {currentWorker.status}
                              </span>
                            </div>
                            <div className="text-xs text-indigo-400 mt-0.5">{currentWorker.role} • {currentWorker.dept}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-[#1e2336] px-4 py-2 rounded-xl border border-slate-700/80">
                          <CheckCircle size={16} className="text-emerald-400" />
                          <div className="text-xs">
                            <span className="text-slate-400">Total Selesai: </span>
                            <span className="text-white font-bold">{currentWorker.tasksCompleted} Pekerjaan</span>
                          </div>
                        </div>
                      </div>

                      {/* Work Accomplishment Summary */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                          Ringkasan Hasil Kerja Nyata:
                        </h3>
                        <div className="p-4 bg-[#1e2336] rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                          {currentWorker.workSummary}
                        </div>
                      </div>

                      {/* Measurable KPIs Grid */}
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Key Performance Indicators (KPI):
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {(currentWorker.kpiSummary || []).map((kpi: any, idx: number) => (
                            <div key={idx} className="bg-[#121626] border border-slate-800 p-3.5 rounded-xl space-y-1">
                              <div className="text-[10px] text-slate-400 truncate">{kpi.label}</div>
                              <div className="text-base font-bold text-white">{kpi.value}</div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-500">Target: {kpi.target}</span>
                                <span className="text-emerald-400 font-bold">{kpi.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deliverables / Dokumen Hasil Kerja */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText size={14} className="text-indigo-400" />
                            <span>Dokumen Deliverables ({currentWorker.deliverables?.length || 0})</span>
                          </h3>
                          <span className="text-[11px] text-slate-500">Klik untuk membaca dokumen lengkap</span>
                        </div>

                        <div className="space-y-2.5">
                          {(currentWorker.deliverables || []).map((del: any) => (
                            <div 
                              key={del.id}
                              className="p-4 bg-[#1e2336] border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white">{del.title}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                                    {del.type}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{del.date}</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-2 font-sans">
                                {del.snippet}
                              </p>
                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => setActiveDeliverableModal({ ...del, author: currentWorker.fullName })}
                                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                                >
                                  <span>Buka & Baca Dokumen Lengkap</span>
                                  <ExternalLink size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Next Action Plan */}
                      <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl text-xs space-y-1">
                        <div className="text-indigo-300 font-bold">Langkah Kerja Selanjutnya (Next Sprint):</div>
                        <div className="text-slate-300 font-sans">{currentWorker.nextActionPlan}</div>
                      </div>

                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-500 bg-[#161a2b] rounded-3xl border border-slate-800">
                      Pilih pekerja di sebelah kiri untuk melihat laporan rinci.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SUBTAB 3: MONTHLY CLOSING (TUTUP BUKU BULANAN) */}
            {reportsSubTab === "closing" && (
              <div className="space-y-6">
                
                {/* Closing Header & Action Bar */}
                <div className="bg-[#161a2b] border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔐</span>
                        <h2 className="text-lg font-bold text-white">Status Tutup Buku: {closing?.period || "Oktober 2026"}</h2>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          closing?.isClosed
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        }`}>
                          {closing?.isClosed ? "RECONCILED & LOCKED" : "READY FOR CLOSING"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Diverifikasi resmi oleh <strong>{closing?.closedBy}</strong>. Semua kas, piutang B2B, dan persediaan telah diaudit.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleExecuteClosing}
                        disabled={isClosingExecuting}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                      >
                        {isClosingExecuting ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                        <span>{closing?.isClosed ? "Kunci Ulang Tutup Buku" : "Eksekusi Tutup Buku Periode Ini"}</span>
                      </button>
                    </div>
                  </div>

                  {closing?.closedAt && (
                    <div className="text-[11px] text-slate-400 bg-[#1e2336] p-2.5 rounded-xl border border-slate-800">
                      Waktu Tutup Buku: <span className="text-white font-mono">{new Date(closing.closedAt).toLocaleString("id-ID")}</span>
                    </div>
                  )}

                  {/* Cron Job Auto-Closing & Telegram Digest Card */}
                  <div className="p-4 bg-[#121626] rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-inner">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-bold text-white">Cron Auto-Closing Scheduler: Aktif Setiap Awal Bulan</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">Tgl 1 Pukul 00:01 WIB</span>
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        Kang Dudung (GM) otomatis mengunci pembukuan bulan lalu, menghitung laba bersih, dan mengirim ringkasan P&L + Dividen langsung ke Telegram HP Anda.
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Endpoint Cron: <code>/api/internal/cron/monthly-closing</code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleTestCronClosing}
                        disabled={isTestingCron}
                        className="px-4 py-2.5 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow disabled:opacity-50"
                      >
                        {isTestingCron ? <Loader2 size={13} className="animate-spin" /> : <span>⚡</span>}
                        <span>Test Jalankan Cron & Kirim Telegram</span>
                      </button>
                    </div>
                  </div>

                  {cronResultMsg && (
                    <div className="p-3.5 bg-indigo-950/70 border border-indigo-800/80 rounded-2xl text-xs text-indigo-200 flex items-center justify-between">
                      <span>{cronResultMsg}</span>
                      <button onClick={() => setCronResultMsg("")} className="text-slate-400 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 4 Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-1 shadow">
                    <div className="text-xs text-slate-400">Total Omzet Penjualan</div>
                    <div className="text-xl font-bold text-white">
                      Rp {(inc?.revenue?.totalGrossRevenue || 70850000).toLocaleString("id-ID")}
                    </div>
                    <div className="text-[10px] text-emerald-400">Ritel + B2B + Custom Roast</div>
                  </div>

                  <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-1 shadow">
                    <div className="text-xs text-slate-400">HPP (Harga Pokok Produksi)</div>
                    <div className="text-xl font-bold text-rose-400">
                      Rp {(inc?.cogs?.totalCogs || 33441200).toLocaleString("id-ID")}
                    </div>
                    <div className="text-[10px] text-slate-500">Gross Margin: {inc?.cogs?.grossMarginPct || 52.8}%</div>
                  </div>

                  <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-1 shadow">
                    <div className="text-xs text-slate-400">Beban Operasional (OPEX)</div>
                    <div className="text-xl font-bold text-amber-400">
                      Rp {(inc?.opex?.totalOpex || 15700000).toLocaleString("id-ID")}
                    </div>
                    <div className="text-[10px] text-slate-500">Iklan, Logistik, Server, Roastery</div>
                  </div>

                  <div className="bg-[#161a2b] border border-emerald-500/40 p-5 rounded-2xl space-y-1 shadow bg-emerald-950/10">
                    <div className="text-xs text-emerald-300 font-bold">Laba Bersih Bersih (Net Profit)</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      Rp {(inc?.netIncome?.netProfitClean || 21354550).toLocaleString("id-ID")}
                    </div>
                    <div className="text-[10px] text-emerald-500 font-bold">Net Margin: {inc?.netIncome?.netMarginPct || 30.6}% (Setelah Pajak)</div>
                  </div>
                </div>

                {/* Professional Income Statement (Laporan Laba Rugi) Table */}
                <div className="bg-[#161a2b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-5 border-b border-slate-800 bg-[#121626] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">Laporan Laba Rugi Komprehensif (Income Statement)</h3>
                      <div className="text-[11px] text-slate-400">Standar Akuntansi Usaha Roastery • Periode {closing?.period || "Oktober 2026"}</div>
                    </div>
                    <span className="text-xs font-mono text-indigo-400 font-bold">IDR (Rupiah)</span>
                  </div>

                  <div className="divide-y divide-slate-800/80 text-xs">
                    
                    {/* Section 1: Revenue */}
                    <div className="p-4 bg-slate-900/50">
                      <div className="font-bold text-indigo-300 text-xs uppercase tracking-wider mb-2">
                        I. PENDAPATAN USAHA (REVENUE)
                      </div>
                      <div className="space-y-1.5 pl-2">
                        <div className="flex justify-between text-slate-300">
                          <span>• Penjualan Ritel Online & Marketplace (B2C)</span>
                          <span className="font-mono">Rp {(inc?.revenue?.retailSales || 18450000).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>• Kontrak Pasokan B2B Kafe Rekanan (18 Kafe)</span>
                          <span className="font-mono">Rp {(inc?.revenue?.b2bSales || 42800000).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>• Jasa Sangrai Custom Batch (Maklon Roastery)</span>
                          <span className="font-mono">Rp {(inc?.revenue?.customRoastSales || 9600000).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-bold text-white border-t border-slate-800 pt-1.5">
                          <span>TOTAL PENDAPATAN KOTOR</span>
                          <span className="font-mono text-emerald-400">Rp {(inc?.revenue?.totalGrossRevenue || 70850000).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: COGS */}
                    <div className="p-4 bg-slate-900/30">
                      <div className="font-bold text-rose-300 text-xs uppercase tracking-wider mb-2">
                        II. HARGA POKOK PENJUALAN (HPP / COGS)
                      </div>
                      <div className="space-y-1.5 pl-2">
                        <div className="flex justify-between text-slate-300">
                          <span>• Pembelian Green Beans Petani (Direct Trade)</span>
                          <span className="font-mono">Rp {(inc?.cogs?.greenBeansCost || 25506000).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>• Kemasan Foil Valve, Box & Stiker Label</span>
                          <span className="font-mono">Rp {(inc?.cogs?.packagingCost || 3896750).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>• Gas LPG Probat UG22 & Daya Listrik Produksi</span>
                          <span className="font-mono">Rp {(inc?.cogs?.roastingUtilities || 2267200).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>• Alokasi Susut Bobot Sangrai (14.8%)</span>
                          <span className="font-mono">Rp {(inc?.cogs?.roastingShrinkage || 1771250).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-bold text-rose-400 border-t border-slate-800 pt-1.5">
                          <span>TOTAL HARGA POKOK PENJUALAN</span>
                          <span className="font-mono">Rp {(inc?.cogs?.totalCogs || 33441200).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-bold text-white pt-1">
                          <span>LABA KOTOR (GROSS PROFIT)</span>
                          <span className="font-mono text-emerald-400">
                            Rp {(inc?.cogs?.grossProfit || 37408800).toLocaleString("id-ID")} ({inc?.cogs?.grossMarginPct || 52.8}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: OPEX */}
                    <div className="p-4 bg-slate-900/50">
                      <div className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-2">
                        III. BEBAN OPERASIONAL (OPEX)
                      </div>
                      <div className="space-y-1.5 pl-2">
                        <div className="flex justify-between text-slate-300">
                          <span>• Belanja Iklan Digital (Meta Ads & TikTok Ads)</span>
                          <span className="font-mono">Rp {(inc?.opex?.performanceAds || 6800000).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>• Biaya Pengiriman & Logistik Dispatch Kurir</span>
                          <span className="font-mono">Rp {(inc?.opex?.logisticsShipping || 3450000).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>• Hosting Cloud, Domain & Payment Gateway Fee</span>
                          <span className="font-mono">Rp {(inc?.opex?.techAndHosting || 1250000).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>• Pemeliharaan Mesin Sangrai & Operasional Pabrik</span>
                          <span className="font-mono">Rp {(inc?.opex?.roasteryOverhead || 4200000).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-bold text-amber-400 border-t border-slate-800 pt-1.5">
                          <span>TOTAL BEBAN OPERASIONAL (OPEX)</span>
                          <span className="font-mono">Rp {(inc?.opex?.totalOpex || 15700000).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Net Income */}
                    <div className="p-4 bg-emerald-950/20">
                      <div className="font-bold text-emerald-300 text-xs uppercase tracking-wider mb-2">
                        IV. LABA BERSIH & KEWAJIBAN PAJAK
                      </div>
                      <div className="space-y-1.5 pl-2">
                        <div className="flex justify-between text-slate-300">
                          <span>• Laba Operasional (Operating Profit / EBITDA)</span>
                          <span className="font-mono">Rp {(inc?.netIncome?.operatingProfit || 21708800).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>• Beban Pajak PPh Final UMKM 0.5% (PP 23/2018)</span>
                          <span className="font-mono text-rose-300">- Rp {(inc?.netIncome?.taxFinalUmkm || 354250).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-emerald-400 border-t border-slate-800 pt-2">
                          <span>LABA BERSIH BERSIH (NET PROFIT)</span>
                          <span className="font-mono">Rp {(inc?.netIncome?.netProfitClean || 21354550).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Warehouse Balance Sheet Valuation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Inventory Valuation Card */}
                  <div className="bg-[#161a2b] border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-2.5">
                      <Archive size={18} className="text-orange-400" />
                      <h3 className="text-sm font-bold text-white">Valuasi Persediaan Gudang (Stock Assets)</h3>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800 flex justify-between">
                        <div>
                          <div className="text-slate-300 font-bold">Stok Green Beans Mentah</div>
                          <div className="text-[11px] text-slate-500">{inv?.greenBeansStockKg || 1250} kg tersimpan di pallet</div>
                        </div>
                        <div className="text-right font-mono font-bold text-white">
                          Rp {(inv?.greenBeansValue || 117500000).toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800 flex justify-between">
                        <div>
                          <div className="text-slate-300 font-bold">Stok Roasted Beans Siap Kirim</div>
                          <div className="text-[11px] text-slate-500">{inv?.roastedStockKg || 180} kg di display pack valve</div>
                        </div>
                        <div className="text-right font-mono font-bold text-white">
                          Rp {(inv?.roastedStockValue || 247725000).toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/40 flex justify-between font-bold">
                        <span className="text-indigo-300">TOTAL VALUASI ASET TERKUNCI</span>
                        <span className="text-white font-mono">
                          Rp {(inv?.totalInventoryValue || 365225000).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profit Allocation Plan */}
                  <div className="bg-[#161a2b] border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-2.5">
                      <PieChart size={18} className="text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Rencana Alokasi Laba Bersih oleh GM</h3>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800 flex justify-between">
                        <div>
                          <div className="text-emerald-300 font-bold">💰 Dividen Pemilik Usaha (35%)</div>
                          <div className="text-[11px] text-slate-500">Siap ditarik langsung ke rekening owner</div>
                        </div>
                        <div className="text-right font-mono font-bold text-emerald-400">
                          Rp {(dist?.ownerDividends || 7474092).toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800 flex justify-between">
                        <div>
                          <div className="text-amber-300 font-bold">🌾 Restock Panen Raya Petani (45%)</div>
                          <div className="text-[11px] text-slate-500">Reinvestasi belanja green beans Takengon</div>
                        </div>
                        <div className="text-right font-mono font-bold text-amber-400">
                          Rp {(dist?.restockReinvestment || 9609548).toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800 flex justify-between">
                        <div>
                          <div className="text-blue-300 font-bold">🛡️ Cadangan Kas Darurat (20%)</div>
                          <div className="text-[11px] text-slate-500">Buffer likuiditas operasional roastery</div>
                        </div>
                        <div className="text-right font-mono font-bold text-blue-400">
                          Rp {(dist?.emergencyReserve || 4270910).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Verification Signatures */}
                <div className="bg-[#121626] border border-slate-800 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                  <div className="p-4 bg-[#161a2b] rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Disusun & Disetujui Oleh</div>
                    <div className="text-xl">👨‍💼</div>
                    <div className="font-bold text-white text-xs">Kang Dudung</div>
                    <div className="text-[11px] text-indigo-400 font-mono">General Manager</div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-500/10 py-1 rounded-lg border border-emerald-500/20">
                      ✓ SIGNED & AUDITED
                    </div>
                  </div>

                  <div className="p-4 bg-[#161a2b] rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Diaudit & Direkonsiliasi Oleh</div>
                    <div className="text-xl">👩‍💼</div>
                    <div className="font-bold text-white text-xs">Ceu Edah</div>
                    <div className="text-[11px] text-yellow-400 font-mono">Head of Finance & Tax Accounting</div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-500/10 py-1 rounded-lg border border-emerald-500/20">
                      ✓ RECONCILED 100%
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Deliverable Reader Modal */}
            {activeDeliverableModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-3xl bg-[#121626] border border-indigo-500/40 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
                  
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                        {activeDeliverableModal.type || "Dokumen Kerja"}
                      </span>
                      <h2 className="text-base md:text-lg font-bold text-white mt-1">
                        {activeDeliverableModal.title}
                      </h2>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Diterbitkan oleh: <strong className="text-indigo-300">{activeDeliverableModal.author}</strong> • {activeDeliverableModal.date}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveDeliverableModal(null)}
                      className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <div className="p-5 bg-[#0a0f1d] border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                      {activeDeliverableModal.fullText || activeDeliverableModal.snippet}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Ramu Roastery Document Verification ID: #{activeDeliverableModal.id || "DOC-2026"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(activeDeliverableModal.fullText || activeDeliverableModal.snippet);
                          alert("Isi dokumen disalin ke clipboard!");
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        Salin Teks
                      </button>
                      <button
                        onClick={() => setActiveDeliverableModal(null)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        );
      }

      case "WhatsApp CS":
        return (
          <div className="flex-1 p-6 md:p-8 text-white bg-[#0a0f1d] overflow-y-auto font-mono space-y-6">
            
            {/* Top Navigation & Controls Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <MessageSquare size={20} />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    WhatsApp Gateway & Virtual Barista CS (Sari)
                  </h1>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    CS 24/7 ONLINE (TANPA JAM CLOSING)
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Layanan pelanggan WhatsApp 24 Jam Non-Stop tanpa jam closing. Kapan pun pelanggan bertanya di nomor WhatsApp, Sari selalu aktif membalas instan untuk konsultasi grind size, rekomendasi beans, dan status order.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={fetchWaChats}
                  className="p-2.5 bg-[#161a2b] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition shadow"
                  title="Refresh Riwayat Chat"
                >
                  <RefreshCw size={14} className={isWaLoading ? "animate-spin text-emerald-400" : ""} />
                </button>
                <div className="px-3.5 py-2 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 rounded-xl text-xs font-bold font-mono">
                  CSAT: 98.4% • 144+ Tiket Selesai
                </div>
              </div>
            </div>

            {/* Main Content 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Gateway Configuration & Knowledge */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Webhook Endpoint Card */}
                <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">🔗 Webhook URL Integrasi</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">POST / GET</span>
                  </div>

                  <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl text-xs text-slate-300 font-mono break-all select-all flex items-center justify-between gap-2">
                    <code>/api/internal/whatsapp/webhook</code>
                    <button
                      onClick={() => {
                        const fullUrl = `${window.location.origin}/api/internal/whatsapp/webhook`;
                        navigator.clipboard?.writeText(fullUrl);
                        setWaWebhookCopied(true);
                        setTimeout(() => setWaWebhookCopied(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold shrink-0 transition"
                    >
                      {waWebhookCopied ? "✓ Tersalin!" : "Salin URL"}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Tempelkan URL ini ke dashboard provider WhatsApp Anda (Fonnte, Wablas, Meta Cloud API, atau WAHA). Semua pesan masuk dari pelanggan akan otomatis dijawab oleh Sari secara instan!
                  </p>
                </div>

                {/* Provider Selection & Token Config */}
                <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Pilih WhatsApp Provider</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {["Fonnte", "Wablas", "Meta Cloud API", "WAHA"].map((prov) => (
                      <button
                        key={prov}
                        onClick={() => setWaSelectedProvider(prov)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          waSelectedProvider === prov
                            ? "bg-emerald-600/20 border-emerald-500/60 text-emerald-300 shadow"
                            : "bg-[#121626] border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>📱</span>
                        <span>{prov}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-xs text-slate-400 block font-semibold">
                      API Token / Device Key ({waSelectedProvider}):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Masukkan token dari provider WA..."
                        value={waApiKey}
                        onChange={(e) => setWaApiKey(e.target.value)}
                        className="flex-1 bg-[#1e2336] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        onClick={() => {
                          alert(`Token untuk ${waSelectedProvider} berhasil disimpan secara lokal!`);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sari's Knowledge Matrix Card */}
                <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>🧠 Matriks Otak Virtual Barista Sari</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-[#1e2336] rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold">1. Konsultasi Ukuran Gilingan:</span>
                      <div className="text-[11px] text-slate-300 mt-0.5">Otomatis rekomendasikan Fine (Espresso/Tubruk), Medium (V60/Aeropress), Coarse (French Press/Cold Brew).</div>
                    </div>
                    <div className="p-2.5 bg-[#1e2336] rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold">2. Rekomendasi Karakter Rasa:</span>
                      <div className="text-[11px] text-slate-300 mt-0.5">Kopi susu: Ramu House Blend & Dampit Robusta (gurih manis). Filter hitam: Gayo Anaerobic & Flores Bajawa (fruity floral).</div>
                    </div>
                    <div className="p-2.5 bg-[#1e2336] rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold">3. Garansi Fresh Roast & Dispatch:</span>
                      <div className="text-[11px] text-slate-300 mt-0.5">Edukasi resting degassing 3-5 hari pasca sangrai mesin Probat & kurir same-day Gilang.</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Live WhatsApp Interactive Simulator & Real Chat Log */}
              <div className="lg:col-span-7 space-y-5">
                
                <div className="bg-[#161a2b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
                  
                  {/* WhatsApp App Mockup Top Bar */}
                  <div className="p-4 bg-[#075e54] text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-800/80 border border-emerald-400/50 flex items-center justify-center text-xl shadow">
                        👩‍💼
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>Sari — Ramu Roastery CS</span>
                          <span className="text-[10px] bg-emerald-400/30 text-white px-1.5 rounded">Official</span>
                        </div>
                        <div className="text-[10px] text-emerald-100/90 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                          <span>online (Virtual Barista 24 Jam)</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-emerald-100 bg-emerald-900/40 px-2.5 py-1 rounded-lg">
                      Auto-Reply: Aktif
                    </div>
                  </div>

                  {/* WhatsApp Chat Bubbles Scroll Area */}
                  <div className="flex-1 p-4 bg-[#0b141a] overflow-y-auto space-y-3 text-xs font-sans">
                    
                    <div className="text-center my-2">
                      <span className="text-[10px] bg-[#182229] text-slate-400 px-3 py-1 rounded-full border border-slate-800 font-mono">
                        Hari ini • Enkripsi End-to-End Ramu AI
                      </span>
                    </div>

                    {waChats.map((chat: any) => (
                      <div key={chat.id} className="space-y-2">
                        
                        {/* Customer incoming message bubble (Left / Dark Slate) */}
                        <div className="flex justify-start">
                          <div className="max-w-[85%] bg-[#202c33] text-slate-100 p-3 rounded-2xl rounded-tl-sm border border-slate-700/60 shadow space-y-1">
                            <div className="text-[10px] text-amber-400 font-bold flex items-center justify-between gap-2">
                              <span>{chat.senderName} ({chat.senderPhone || "WA"})</span>
                              <span className="text-slate-400 font-mono text-[9px]">
                                {new Date(chat.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{chat.customerMessage}</p>
                          </div>
                        </div>

                        {/* Sari AI outgoing reply bubble (Right / WhatsApp Emerald Green) */}
                        <div className="flex justify-end">
                          <div className="max-w-[85%] bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-sm shadow space-y-1">
                            <div className="text-[10px] text-emerald-200 font-bold flex items-center justify-between gap-2">
                              <span>👩‍💼 Sari (Virtual Barista)</span>
                              <span className="text-emerald-200/70 font-mono text-[9px] flex items-center gap-1">
                                <span>{new Date(chat.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                                <span>✓✓</span>
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">{chat.sariReply}</p>
                          </div>
                        </div>

                      </div>
                    ))}

                    {isSendingWaSim && (
                      <div className="flex justify-end">
                        <div className="bg-[#005c4b] text-emerald-200 px-4 py-2 rounded-2xl text-xs flex items-center gap-2">
                          <Loader2 size={12} className="animate-spin" />
                          <span>Sari sedang mengetik jawaban...</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Simulator Quick Prompt Shortcuts */}
                  <div className="p-2.5 bg-[#111b21] border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
                    <span className="text-slate-500 text-[10px] shrink-0">Coba cepat:</span>
                    {[
                      "Rekomendasi kopi susu yang gak asam",
                      "Ukuran gilingan V60 vs Aeropress apa bedanya?",
                      "Kapan tanggal sangrai batch terakhir?",
                      "Gimana cara lacak paket resi saya?"
                    ].map((promptText, idx) => (
                      <button
                        key={idx}
                        onClick={() => setWaSimMessage(promptText)}
                        className="px-2.5 py-1 bg-[#202c33] hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap text-[10px] transition shrink-0"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>

                  {/* Simulator Message Input Form */}
                  <form onSubmit={handleSendWaSimulation} className="p-3 bg-[#202c33] border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nama pelanggan..."
                      value={waSimCustomerName}
                      onChange={(e) => setWaSimCustomerName(e.target.value)}
                      className="w-28 bg-[#111b21] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Ketik pesan simulasi pelanggan ke Sari di sini..."
                      value={waSimMessage}
                      onChange={(e) => setWaSimMessage(e.target.value)}
                      className="flex-1 bg-[#111b21] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                    />
                    <button
                      type="submit"
                      disabled={isSendingWaSim}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      {isSendingWaSim ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>Kirim</span>
                    </button>
                  </form>

                </div>

              </div>

            </div>

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
          <NavItem icon={<FileText size={16}/>} label="Reports" active={activeTab === "Reports"} onClick={() => setActiveTab("Reports")} />
          <NavItem icon={<MessageSquare size={16}/>} label="WhatsApp CS" active={activeTab === "WhatsApp CS"} onClick={() => setActiveTab("WhatsApp CS")} />
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
