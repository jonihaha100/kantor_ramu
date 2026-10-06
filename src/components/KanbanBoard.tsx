"use client";
import React, { useEffect, useState } from "react";
import { Plus, Check, Clock, PlayCircle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface AgentTask {
  id: string;
  title: string;
  description: string;
  role: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | string;
  createdAt: string;
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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
      if (json.success) setTasks(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
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

  const pendingTasks = tasks.filter(t => t.status === "PENDING");
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");

  const TaskCard = ({ task }: { task: AgentTask }) => (
    <div className="bg-[#1e2336] p-4 rounded-xl border border-slate-700/80 shadow-md space-y-3 hover:border-indigo-500/50 transition-all group">
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-white text-sm leading-snug">{task.title}</h3>
        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full uppercase shrink-0 border border-indigo-500/30">
          {task.role}
        </span>
      </div>
      
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Action buttons to transition task status */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-500 font-mono">
          ID: {task.id.slice(0, 5)}
        </span>
        <div className="flex items-center gap-1.5">
          {task.status === "PENDING" && (
            <button
              onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
            >
              <PlayCircle size={12} /> Mulai
            </button>
          )}
          {task.status === "IN_PROGRESS" && (
            <button
              onClick={() => handleUpdateStatus(task.id, "COMPLETED")}
              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
            >
              <CheckCircle2 size={12} /> Selesai
            </button>
          )}
          {task.status === "COMPLETED" && (
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <Check size={12} /> Done
            </span>
          )}
        </div>
      </div>
    </div>
  );

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

  return (
    <div className="h-full flex flex-col space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            📋 Project Tasks & Delegation
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Papan Kanban otomatis: Agen membuat tiket sendiri melalui diskusi, delegasi GM, atau hasil Cupping Table Meeting.
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
