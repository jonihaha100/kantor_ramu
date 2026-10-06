"use client";

import { useState } from "react";
import OfficeCanvas, { OfficeEventLog } from "./OfficeCanvas";
import ControlPanel from "./ControlPanel";
import MeetingPanel from "./MeetingPanel";
import KanbanBoard from "./KanbanBoard";
import { 
  Building2, Users, FolderKanban, Archive, 
  Coffee, DollarSign, UserCircle, LogOut, Radio,
  TrendingUp, CheckCircle, Flame, Thermometer, ShieldAlert, Sparkles, MessageSquare
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

  const renderContent = () => {
    switch (activeTab) {
      case "Office HQ":
        return (
          <div className="flex-1 flex min-w-0 bg-[#0f172a]">
            <div className="flex-1 flex flex-col min-w-0">
              
              {/* Top Bar with Live Stats */}
              <div className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-slate-800 bg-[#161a2b]">
                <div className="flex items-center gap-4">
                  <div className="font-bold text-white tracking-[0.18em] font-mono text-base uppercase flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    RAMU ROASTERY HQ
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
                    11 AI Agents Alive
                  </span>
                </div>

                {/* Live Activity Ticker */}
                <div className="hidden lg:flex items-center gap-2 max-w-md px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 overflow-hidden">
                  <Radio size={13} className="text-amber-400 animate-pulse shrink-0" />
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

                <div className="flex items-center gap-3">
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
                </div>
              </div>

              {/* Canvas Container */}
              <div className="flex-1 relative bg-[#090d16] overflow-hidden flex items-center justify-center">
                <OfficeCanvas 
                  onSelectAgent={setSelectedAgent} 
                  selectedAgent={selectedAgent} 
                  onMeetingStart={() => setIsMeetingActive(prev => !prev)}
                  isMeetingActive={isMeetingActive}
                  meetingSpeaker={meetingSpeaker}
                  onOfficeEvent={handleOfficeEvent}
                />
              </div>

              {/* Bottom Office Status Bar */}
              <div className="h-14 shrink-0 bg-[#161a2b] flex items-center px-6 justify-between font-mono text-xs border-t border-slate-800 z-10">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Total Omzet:</span>
                    <span className="text-emerald-400 font-bold">Rp 14.225.000</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-slate-400">Suhu Drum Roaster:</span>
                    <span className="text-amber-400 font-bold">205°C (Stable)</span>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-slate-400">Kelembaban Gudang:</span>
                    <span className="text-sky-400 font-bold">60% RH</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Agen Beroperasi:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    11 / 11 Online
                  </span>
                </div>
              </div>
            </div>

            {/* Right Sidebar Drawer */}
            <div className="w-[360px] bg-[#161a2b] border-l border-slate-800 shrink-0 z-20 flex flex-col">
              {isMeetingActive ? (
                <MeetingPanel 
                  onClose={() => {
                    setIsMeetingActive(false);
                    setMeetingSpeaker(null);
                  }}
                  onSpeakerChange={setMeetingSpeaker}
                  onViewProjects={() => setActiveTab("Projects")}
                />
              ) : (
                <ControlPanel 
                  selectedAgent={selectedAgent} 
                  onClose={() => setSelectedAgent(null)} 
                />
              )}
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
        return (
          <div className="flex-1 p-8 text-white bg-[#0f172a] overflow-y-auto font-mono">
            <h1 className="text-2xl font-bold mb-2">📦 Storage Room & Warehouse Inventory</h1>
            <p className="text-slate-400 text-xs mb-6">Live status ketersediaan green beans dan produk kopi siap kirim.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Total Green Beans (Mentah)</div>
                <div className="text-2xl text-emerald-400 font-bold">1.380 Kg</div>
                <div className="text-[11px] text-slate-500">14 karung Gayo & 9 karung Toraja</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Roasted Coffee Ready Stock</div>
                <div className="text-2xl text-blue-400 font-bold">399 Pack</div>
                <div className="text-[11px] text-slate-500">House blend & single origin siap kirim</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Kondisi Fisik Gudang</div>
                <div className="text-2xl text-amber-400 font-bold">22°C / 60% RH</div>
                <div className="text-[11px] text-emerald-400">Suhu & kelembaban terkalibrasi optimal</div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-[#161a2b] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 font-bold text-sm">
                Daftar Produk & Stok Gudang (Sync dengan SQLite Database)
              </div>
              <div className="p-4 space-y-3">
                {[
                  { name: "Aceh Gayo Anaerobic Natural (200g)", stock: 85, price: "Rp 115.000", status: "Aman" },
                  { name: "Flores Bajawa Honey (200g)", stock: 120, price: "Rp 95.000", status: "Aman" },
                  { name: "Java Preanger Washed (200g)", stock: 64, price: "Rp 85.000", status: "Aman" },
                  { name: "Ramu House Blend Espresso (1kg)", stock: 42, price: "Rp 240.000", status: "Top Seller" },
                  { name: "Toraja Sapan Full Washed (200g)", stock: 50, price: "Rp 110.000", status: "Aman" },
                  { name: "Bali Kintamani Carbonic (200g)", stock: 38, price: "Rp 135.000", status: "Limited" },
                  { name: "Green Beans: Aceh Gayo Grade 1 (60kg)", stock: 14, price: "Rp 8.400.000", status: "Bulk" },
                  { name: "Green Beans: Toraja White Honey (60kg)", stock: 9, price: "Rp 9.200.000", status: "Bulk" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#1e2336] rounded-xl border border-slate-800 text-xs">
                    <span className="font-bold text-white">{item.name}</span>
                    <div className="flex items-center gap-6">
                      <span className="text-slate-400">{item.price}</span>
                      <span className="text-emerald-400 font-bold">{item.stock} pcs</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Roastery":
        return (
          <div className="flex-1 p-8 text-white bg-[#0f172a] overflow-y-auto font-mono">
            <h1 className="text-2xl font-bold mb-2">🔥 Roastery Operations & Cupping Lab</h1>
            <p className="text-slate-400 text-xs mb-6">Monitoring mesin sangrai kopi Probat & evaluasi skor sensorik R&D.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
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
          <div className="flex-1 p-8 text-white bg-[#0f172a] overflow-y-auto font-mono">
            <h1 className="text-2xl font-bold mb-2">💰 Financial Analytics & Sales Reconcile</h1>
            <p className="text-slate-400 text-xs mb-6">Rekonsiliasi transaksi masuk, invoice B2B kafe rekanan, dan arus kas.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Omzet Masuk Hari Ini</div>
                <div className="text-2xl text-emerald-400 font-bold">Rp 14.225.000</div>
                <div className="text-[11px] text-emerald-500">5 transaksi terverifikasi (Lunas)</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Gross Profit Margin</div>
                <div className="text-2xl text-blue-400 font-bold">42.5%</div>
                <div className="text-[11px] text-slate-500">COGS & kemasan dalam batas efisien</div>
              </div>
              <div className="bg-[#161a2b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs text-slate-400">Faktur Pajak PPN 11%</div>
                <div className="text-2xl text-yellow-400 font-bold">Rp 1.564.750</div>
                <div className="text-[11px] text-slate-500">Diarsipkan lengkap oleh Fina</div>
              </div>
            </div>

            <div className="bg-[#161a2b] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 font-bold text-sm">
                Transaksi Hari Ini (Sync Database SQLite)
              </div>
              <div className="p-4 space-y-3">
                {[
                  { client: "Kawasan Kreatif Workspace (B2B)", amount: "Rp 5.000.000", status: "LUNAS", items: "20 pack Bajawa & 28 pack Toraja" },
                  { client: "Kafe Sudut Temu (B2B Bandung)", amount: "Rp 4.800.000", status: "LUNAS", items: "20kg Ramu House Blend Espresso" },
                  { client: "Kopi Senja Collective (B2B Jakarta)", amount: "Rp 3.600.000", status: "LUNAS", items: "15kg Ramu House Blend Espresso" },
                  { client: "Dian Sastrowardoyo (Retail)", amount: "Rp 480.000", status: "TERKIRIM", items: "2kg Ramu House Blend" },
                  { client: "Bramantyo Kusumo (Retail)", amount: "Rp 345.000", status: "TERKIRIM", items: "3 pack Aceh Gayo Anaerobic" },
                ].map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-[#1e2336] rounded-xl border border-slate-800 text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{order.client}</div>
                      <div className="text-slate-400 text-[11px]">{order.items}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400 text-sm">{order.amount}</div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Account":
        return (
          <div className="flex-1 p-8 text-white bg-[#0f172a] overflow-y-auto font-mono">
            <h1 className="text-2xl font-bold mb-2">⚙️ System & AI Engine Settings</h1>
            <p className="text-slate-400 text-xs mb-6">Konfigurasi koneksi AI Agent Ramu Roastery dan panduan interaksi kantor.</p>

            <div className="max-w-2xl space-y-6">
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
                    Saat ini agen beroperasi dengan <strong>High-Fidelity Contextual Engine</strong> yang terhubung ke database SQLite lokal, mampu berdiskusi multi-turn, menawar harga, menguji sampel, dan mengelola Kanban secara dinamis.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Jika Anda memiliki <strong>Google Gemini API Key</strong>, Anda dapat memasukkannya di bawah ini untuk mengaktifkan pemrosesan cloud Gemini 1.5 Flash.
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

              {/* Interaction Guide */}
              <div className="bg-[#161a2b] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>💡</span> Panduan Diskusi dengan Pegawai Kantor
                </h3>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800">
                    <strong className="text-indigo-400 block mb-1">1. Negosiasi & Pengambilan Keputusan</strong>
                    Misal dengan <strong>Budi (Sourcing)</strong>: Anda bisa menawar harga per kilo green beans, meminta sampel varietas baru ke lab Kafin, atau menunda pembelian sampai evaluasi stok selesai.
                  </div>
                  <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800">
                    <strong className="text-indigo-400 block mb-1">2. Delegasi Tugas Otomatis</strong>
                    Katakan pada <strong>Rama (GM)</strong>: <em>"Tolong buatkan tugas baru untuk evaluasi kemasan Ramu"</em>. Rama akan langsung mendelegasikan tugas tersebut ke papan Kanban!
                  </div>
                  <div className="p-3 bg-[#1e2336] rounded-xl border border-slate-800">
                    <strong className="text-indigo-400 block mb-1">3. Cek Data Real-Time</strong>
                    Tanyakan ke <strong>Sari (CS)</strong> soal ketersediaan stok produk, atau ke <strong>Fina (Finance)</strong> soal rekapitulasi omzet Rp 14.2M hari ini.
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
          <NavItem icon={<LogOut size={16}/>} label="Log Out" />
        </nav>
      </div>

      {/* Dynamic Main Content Area */}
      {renderContent()}

    </div>
  );
}
