"use client";
import React, { useEffect, useState } from "react";
import { 
  Plus, Check, Clock, PlayCircle, CheckCircle2, AlertCircle, RefreshCw, 
  FileText, Copy, Sparkles, X, ChevronRight, Loader2, Download
} from "lucide-react";

interface AgentTask {
  id: string;
  title: string;
  description: string;
  role: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | string;
  metadata?: string | null;
  createdAt: string;
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [isGeneratingDeliverable, setIsGeneratingDeliverable] = useState(false);
  const [copiedDeliverable, setCopiedDeliverable] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newRole, setNewRole] = useState("CROSS_DEPARTMENT");

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3500);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/internal/tasks");
      const json = await res.json();
      if (json.success) {
        setTasks(json.data);
        // If a task is currently selected, update its reference
        setSelectedTask(current => {
          if (!current) return null;
          return json.data.find((t: AgentTask) => t.id === current.id) || current;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    }
    try {
      await fetch("/api/internal/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchTasks();
    } catch (e) {
      console.error("Update task failed:", e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await fetch("/api/internal/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          role: newRole,
          status: "PENDING"
        })
      });
      setNewTitle("");
      setNewDesc("");
      setShowAddModal(false);
      fetchTasks();
    } catch (e) {
      console.error("Create task failed:", e);
    }
  };

  const handleGenerateDeliverable = async (taskId: string) => {
    setIsGeneratingDeliverable(true);
    try {
      const res = await fetch(`/api/internal/tasks/${taskId}/deliverable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      }
    } catch (err) {
      console.error("Generate deliverable failed:", err);
    } finally {
      setIsGeneratingDeliverable(false);
    }
  };

  const getDeliverableText = (task: AgentTask): string | null => {
    if (!task.metadata) return null;
    try {
      const parsed = JSON.parse(task.metadata);
      return parsed.deliverable || null;
    } catch {
      return null;
    }
  };

  const handleCopyDeliverable = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDeliverable(true);
    setTimeout(() => setCopiedDeliverable(false), 2000);
  };

  const pendingTasks = tasks.filter(t => t.status === "PENDING");
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");

  const TaskCard = ({ task }: { task: AgentTask }) => {
    const deliverable = getDeliverableText(task);

    return (
      <div 
        onClick={() => setSelectedTask(task)}
        className="bg-[#1e2336] p-4 rounded-xl border border-slate-700/80 shadow-md space-y-3 hover:border-indigo-500/70 hover:shadow-indigo-500/10 cursor-pointer transition-all group"
      >
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-white text-sm leading-snug group-hover:text-indigo-300 transition-colors">
            {task.title}
          </h3>
          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full uppercase shrink-0 border border-indigo-500/30">
            {task.role}
          </span>
        </div>
        
        {task.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {deliverable ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded text-[10px] text-emerald-300 font-bold">
            <FileText size={11} className="text-emerald-400" />
            <span>📄 Dokumen Output Siap</span>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <span>Klik kartu untuk buka detail & draf</span>
            <ChevronRight size={10} />
          </div>
        )}

        {/* Action buttons to transition task status */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] text-slate-500 font-mono">
            ID: {task.id.slice(0, 5)}
          </span>
          <div className="flex items-center gap-1.5">
            {task.status === "PENDING" && (
              <button
                onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
                className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <PlayCircle size={12} /> Kerjakan
              </button>
            )}
            {task.status === "IN_PROGRESS" && (
              <button
                onClick={() => handleUpdateStatus(task.id, "COMPLETED")}
                className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <CheckCircle2 size={12} /> Selesai
              </button>
            )}
            {task.status === "COMPLETED" && (
              <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-bold">
                <Check size={12} /> Selesai
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Column = ({ title, count, icon, color, tasksList }: { 
    title: string; 
    count: number; 
    icon: React.ReactNode; 
    color: string; 
    tasksList: AgentTask[] 
  }) => (
    <div className="flex-1 flex flex-col bg-[#161a2b] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <div className={`p-4 border-b border-slate-800 flex items-center justify-between ${color} bg-slate-900/40`}>
        <h2 className="font-bold font-mono text-sm flex items-center gap-2">
          {icon} <span>{title}</span>
        </h2>
        <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-white border border-slate-700">
          {count}
        </span>
      </div>
      
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-230px)]">
        {tasksList.map(t => <TaskCard key={t.id} task={t} />)}
        {tasksList.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-12 border-2 border-dashed border-slate-800/80 rounded-xl font-mono">
            Tidak ada tugas
          </div>
        )}
      </div>
    </div>
  );

  const activeDeliverable = selectedTask ? getDeliverableText(selectedTask) : null;

  return (
    <div className="h-full flex flex-col space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            📋 Project Tasks & Deliverables
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Papan Kanban otomatis: Klik pada tugas untuk melihat <strong>Dokumen Hasil Kerja Nyata</strong> (SOP, Proposal B2B, Naskah Konten) yang disusun para pekerja AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTasks}
            className="p-2 text-slate-400 hover:text-white bg-[#161a2b] border border-slate-700 rounded-lg hover:border-slate-500 transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin text-indigo-400" : ""} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 flex gap-5 overflow-hidden pb-2">
        <Column 
          title="Menunggu (Pending)" 
          count={pendingTasks.length} 
          icon={<Clock size={16} />} 
          color="text-amber-400" 
          tasksList={pendingTasks} 
        />
        <Column 
          title="Dikerjakan (In Progress)" 
          count={inProgressTasks.length} 
          icon={<PlayCircle size={16} />} 
          color="text-blue-400" 
          tasksList={inProgressTasks} 
        />
        <Column 
          title="Selesai (Completed)" 
          count={completedTasks.length} 
          icon={<CheckCircle2 size={16} />} 
          color="text-emerald-400" 
          tasksList={completedTasks} 
        />
      </div>

      {/* Detail & Deliverable Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161a2b] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-[#121624] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded uppercase border border-indigo-500/30">
                    {selectedTask.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    selectedTask.status === "COMPLETED" 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                      : selectedTask.status === "IN_PROGRESS"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}>
                    {selectedTask.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedTask.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Task Instructions */}
              <div className="bg-[#1e2336] p-4 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Instruksi Tugas dari Owner</div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description || "Tidak ada rincian deskripsi tambahan."}
                </p>
              </div>

              {/* Agent Deliverable Output */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <FileText size={16} className="text-indigo-400" />
                    <span>Dokumen Hasil Kerja Nyata (Deliverable)</span>
                  </div>
                  {activeDeliverable && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyDeliverable(activeDeliverable)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                      >
                        {copiedDeliverable ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedDeliverable ? "Tersalin!" : "Salin Draf"}</span>
                      </button>
                      <button
                        onClick={() => handleGenerateDeliverable(selectedTask.id)}
                        disabled={isGeneratingDeliverable}
                        className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        {isGeneratingDeliverable ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        <span>Regenerate</span>
                      </button>
                    </div>
                  )}
                </div>

                {activeDeliverable ? (
                  <div className="bg-[#0f1322] border border-indigo-500/30 rounded-xl p-4 font-mono text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto shadow-inner border-l-4 border-l-indigo-500">
                    {activeDeliverable}
                  </div>
                ) : (
                  <div className="p-6 bg-[#1e2336] border border-dashed border-slate-700 rounded-xl text-center space-y-3">
                    <div className="text-2xl">📝</div>
                    <div className="font-bold text-white">Dokumen Hasil Kerja Belum Dibuat</div>
                    <p className="text-slate-400 text-xs max-w-md mx-auto">
                      Instruksikan AI Agent divisi <strong>{selectedTask.role}</strong> untuk segera menyusun draf SOP, naskah konten, proposal, atau resep sangrai resmi berdasarkan tugas ini.
                    </p>
                    <button
                      onClick={() => handleGenerateDeliverable(selectedTask.id)}
                      disabled={isGeneratingDeliverable}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {isGeneratingDeliverable ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>AI Agent Sedang Menyusun Dokumen...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>⚡ Generate Hasil Kerja Otomatis (AI Agent)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#121624] flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Status Tugas: <strong className="text-white">{selectedTask.status}</strong>
              </div>
              <div className="flex items-center gap-2">
                {selectedTask.status !== "IN_PROGRESS" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, "IN_PROGRESS")}
                    className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg font-bold transition-all"
                  >
                    Set In Progress
                  </button>
                )}
                {selectedTask.status !== "COMPLETED" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, "COMPLETED")}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all shadow flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    <span>Tandai Selesai (Completed)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161a2b] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" /> Buat Tugas Baru
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Kalibrasi Roasting Batch 16..."
                  className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Divisi Penanggung Jawab</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="GENERAL_MANAGER">Rama (General Manager)</option>
                  <option value="CUSTOMER_SERVICE">Sari (Customer Service)</option>
                  <option value="WEB_DEVELOPER">Rian (Web Dev)</option>
                  <option value="FINANCE">Fina (Finance)</option>
                  <option value="ROASTERY_INVENTORY">Doni (Warehouse & Inventory)</option>
                  <option value="LOGISTICS">Gilang (Logistics)</option>
                  <option value="B2B_SALES">Bayu (B2B Sales)</option>
                  <option value="R&D_QUALITY">Kafin (R&D Cupping)</option>
                  <option value="MARKETING_ADS">Arya (Performance Ads)</option>
                  <option value="CREATIVE_CONTENT">Maya (Content Creator)</option>
                  <option value="SOURCING">Budi (Green Bean Sourcing)</option>
                  <option value="CROSS_DEPARTMENT">Lintas Divisi</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Deskripsi Detail</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Rincian instruksi pelaksanaan tugas..."
                  className="w-full bg-[#1e2336] border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors shadow"
                >
                  Simpan & Delegasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
