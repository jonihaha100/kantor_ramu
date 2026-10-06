"use client";

import { useEffect, useRef, useState } from "react";
import { AgentRole } from "./VirtualOffice";

export interface OfficeEventLog {
  id: string;
  time: string;
  speaker: string;
  message: string;
  type: "collab" | "meeting" | "task" | "system";
}

interface OfficeCanvasProps {
  onSelectAgent: (agent: AgentRole) => void;
  selectedAgent: AgentRole | null;
  onMeetingStart?: () => void;
  isMeetingActive?: boolean;
  meetingSpeaker?: { speaker: string; text: string } | null;
  onOfficeEvent?: (event: OfficeEventLog) => void;
}

type AgentActivity = 
  | "working" 
  | "walking" 
  | "drinking" 
  | "meeting" 
  | "collaborating_walk" 
  | "collaborating_talk"
  | "idle";

interface AgentData {
  id: string;
  deskX: number;
  deskY: number;
  x: number;
  y: number;
  color: string;
  label: string;
  hair: string;
  roleBadge: string;
  activity: AgentActivity;
  targetX: number;
  targetY: number;
  waitTimer: number;
  message: string | null;
  messageTimer: number;
  isOfficeWorker: boolean;
}

// Points of interest
const WATER_COOLER = { x: 520, y: 90 };
const BOOKSHELF = { x: 90, y: 90 };
const VENDING_MACHINE = { x: 530, y: 490 };
const ROASTER_MACHINE = { x: 860, y: 150 };
const BEAN_SACKS = { x: 740, y: 180 };
const CUPPING_TABLE = { x: 400, y: 280 };

// Meeting spots around the Cupping Table (Radius ~75px)
const MEETING_SPOTS = [
  { x: CUPPING_TABLE.x - 75, y: CUPPING_TABLE.y - 10 },
  { x: CUPPING_TABLE.x + 75, y: CUPPING_TABLE.y - 10 },
  { x: CUPPING_TABLE.x, y: CUPPING_TABLE.y - 65 },
  { x: CUPPING_TABLE.x, y: CUPPING_TABLE.y + 65 },
  { x: CUPPING_TABLE.x - 55, y: CUPPING_TABLE.y - 50 },
  { x: CUPPING_TABLE.x + 55, y: CUPPING_TABLE.y - 50 },
  { x: CUPPING_TABLE.x - 55, y: CUPPING_TABLE.y + 50 },
  { x: CUPPING_TABLE.x + 55, y: CUPPING_TABLE.y + 50 },
  { x: CUPPING_TABLE.x - 85, y: CUPPING_TABLE.y + 25 },
  { x: CUPPING_TABLE.x + 85, y: CUPPING_TABLE.y + 25 },
  { x: CUPPING_TABLE.x, y: CUPPING_TABLE.y + 75 },
];

const INITIAL_AGENTS: AgentData[] = [
  // Office Hub (Left Cluster)
  { id: "Rama (GM)", deskX: 130, deskY: 150, x: 130, y: 150, color: "#3b82f6", label: "Rama", hair: "#1e1e1e", roleBadge: "GM Review", activity: "working", targetX: 130, targetY: 150, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: true },
  { id: "Fina (Finance)", deskX: 130, deskY: 260, x: 130, y: 260, color: "#eab308", label: "Fina", hair: "#451a03", roleBadge: "Rekap Rp 14.2M", activity: "working", targetX: 130, targetY: 260, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: true },
  { id: "Sari (CS)", deskX: 130, deskY: 380, x: 130, y: 380, color: "#ec4899", label: "Sari", hair: "#5c3a21", roleBadge: "Tiket WA #1042", activity: "working", targetX: 130, targetY: 380, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: true },
  { id: "Rian (Web Dev)", deskX: 130, deskY: 490, x: 130, y: 490, color: "#10b981", label: "Rian", hair: "#d97706", roleBadge: "Dev Next.js", activity: "working", targetX: 130, targetY: 490, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: true },

  // Center-Left Marketing & Commercial Pod
  { id: "Bayu (B2B)", deskX: 250, deskY: 150, x: 250, y: 150, color: "#f87171", label: "Bayu", hair: "#292524", roleBadge: "Deal Kafe B2B", activity: "working", targetX: 250, targetY: 150, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: true },
  { id: "Arya (Ads)", deskX: 250, deskY: 260, x: 250, y: 260, color: "#60a5fa", label: "Arya", hair: "#44403c", roleBadge: "Meta ROAS 3.8x", activity: "working", targetX: 250, targetY: 260, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: true },
  { id: "Maya (Content)", deskX: 250, deskY: 380, x: 250, y: 380, color: "#c084fc", label: "Maya", hair: "#991b1b", roleBadge: "Edit Reels TikTok", activity: "working", targetX: 250, targetY: 380, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: true },
  { id: "Kafin (R&D)", deskX: 250, deskY: 490, x: 250, y: 490, color: "#2dd4bf", label: "Kafin", hair: "#0f172a", roleBadge: "Cupping Score 87.5", activity: "working", targetX: 250, targetY: 490, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: true },

  // Roastery Warehouse & Supply Chain (Right Side)
  { id: "Doni (Inventory)", deskX: 780, deskY: 310, x: 780, y: 310, color: "#f97316", label: "Doni", hair: "#1c1917", roleBadge: "QC Biji Sangrai", activity: "working", targetX: 780, targetY: 310, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: false },
  { id: "Gilang (Logistics)", deskX: 890, deskY: 310, x: 890, y: 310, color: "#8b5cf6", label: "Gilang", hair: "#18181b", roleBadge: "Dispatch Kargo", activity: "working", targetX: 890, targetY: 310, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: false },
  { id: "Budi (Sourcing)", deskX: 830, deskY: 460, x: 830, y: 460, color: "#a3e635", label: "Budi", hair: "#3f2b1d", roleBadge: "Direct Trade Petani", activity: "working", targetX: 830, targetY: 460, waitTimer: 0, message: null, messageTimer: 0, isOfficeWorker: false },
];

// Rich peer-to-peer collaboration dialogue sequences
const COLLAB_SCENARIOS = [
  {
    visitorId: "Sari (CS)",
    targetId: "Doni (Inventory)",
    dialogue: [
      { speaker: "Sari", text: "Don, PO Kafe Sudut Temu 20kg siap kirim hari ini?" },
      { speaker: "Doni", text: "Siap Sar! Baru beres di-packing dan di-seal rapi." },
      { speaker: "Sari", text: "Mantap, langsung ku konfirmasi ke admin kafe ya!" }
    ]
  },
  {
    visitorId: "Maya (Content)",
    targetId: "Kafin (R&D)",
    dialogue: [
      { speaker: "Maya", text: "Kafin! Boleh rekam video pour-over batch Bajawa Honey?" },
      { speaker: "Kafin", text: "Boleh May! Notes aroma peach & madunya semerbak banget." },
      { speaker: "Maya", text: "Cakep, gue edit Reels edukasi di CapCut sekarang!" }
    ]
  },
  {
    visitorId: "Rama (GM)",
    targetId: "Fina (Finance)",
    dialogue: [
      { speaker: "Rama", text: "Fin, rekonsiliasi omzet Rp 14.2M hari ini sudah klop?" },
      { speaker: "Fina", text: "Sudah klop Pak Rama, invoice Kafe Sudut Temu sudah lunas." },
      { speaker: "Rama", text: "Bagus, amankan alokasi belanja green beans Takengon." }
    ]
  },
  {
    visitorId: "Gilang (Logistics)",
    targetId: "Sari (CS)",
    dialogue: [
      { speaker: "Gilang", text: "Sar, resi J&T Cargo batch siang sudah terbit ya." },
      { speaker: "Sari", text: "Thank you mas Gilang, langsung ku teruskan ke WhatsApp pembeli!" },
      { speaker: "Gilang", text: "Sip, kurir kargo jalan tepat waktu jam 15:30." }
    ]
  },
  {
    visitorId: "Rian (Web Dev)",
    targetId: "Arya (Ads)",
    dialogue: [
      { speaker: "Rian", text: "Arya, conversion tracking Meta Pixel di web store sudah 100% akurat." },
      { speaker: "Arya", text: "Mantap Rian! Gua naikin budget kampanye 20% ya." },
      { speaker: "Rian", text: "Gas! Server edge kita siap tampung lonjakan trafik." }
    ]
  },
  {
    visitorId: "Bayu (B2B)",
    targetId: "Budi (Sourcing)",
    dialogue: [
      { speaker: "Bayu", text: "Bud, ada coffeeshop Jaksel mau kontrak suplai 100kg/bulan." },
      { speaker: "Budi", text: "Aman Bay! Kontak koperasi di Takengon baru panen raya." },
      { speaker: "Bayu", text: "Keren, gue siapin draft MOU kemitraannya." }
    ]
  },
  {
    visitorId: "Doni (Inventory)",
    targetId: "Kafin (R&D)",
    dialogue: [
      { speaker: "Doni", text: "Kaf, moisture content green beans hari ini stabil di 11.2%." },
      { speaker: "Kafin", text: "Ideal banget Don, gas roasting batch specialty berikutnya." },
      { speaker: "Doni", text: "Mesin Probat drumnya udah pre-heat di 205°C!" }
    ]
  }
];

export default function OfficeCanvas({
  onSelectAgent,
  selectedAgent,
  onMeetingStart,
  isMeetingActive = false,
  meetingSpeaker = null,
  onOfficeEvent
}: OfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<AgentData[]>(JSON.parse(JSON.stringify(INITIAL_AGENTS)));
  const meetingActiveRef = useRef(isMeetingActive);
  const [hoveredAgent, setHoveredAgent] = useState<AgentData | null>(null);

  // Active collaboration state
  const activeCollabRef = useRef<{
    scenarioIndex: number;
    step: number; // 0, 1, 2
    stepTimer: number;
    visitorId: string;
    targetId: string;
  } | null>(null);

  const nextCollabDelayRef = useRef(8); // trigger first collab after 8s

  useEffect(() => {
    meetingActiveRef.current = isMeetingActive;
  }, [isMeetingActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (timeNow: number) => {
      const deltaTime = (timeNow - lastTime) / 1000;
      lastTime = timeNow;
      const timeSec = timeNow / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- 1. Floors (Parquet Office vs Concrete Roastery) ---
      const tileSize = 40;
      for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
          if (x < 660) {
            // Warm Scandinavian parquet flooring
            ctx.fillStyle = ((x / tileSize) + (y / tileSize)) % 2 === 0 ? "#cbd5e1" : "#e2e8f0";
          } else {
            // Industrial Slate Roastery Warehouse floor
            ctx.fillStyle = ((x / tileSize) + (y / tileSize)) % 2 === 0 ? "#475569" : "#334155";
          }
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }

      // Border Walls
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, 36); 
      ctx.fillRect(0, canvas.height - 16, canvas.width, 16); 
      ctx.fillRect(0, 0, 16, canvas.height); 
      ctx.fillRect(canvas.width - 16, 0, 16, canvas.height); 

      // Dividing Wall with Doorway
      ctx.fillRect(660, 0, 16, 230); 
      ctx.fillRect(660, 350, 16, 250); 
      // Yellow Caution Line at Roastery Entrance
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(660, 230, 16, 120);

      // --- Room Signages ---
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "left";
      ctx.fillText("HQ OFFICE & R&D", 28, 26);
      ctx.fillText("WAREHOUSE & ROASTERY", 690, 26);

      const drawPixels = (px: number, py: number, size: number, grid: (string|null)[][]) => {
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            const color = grid[row][col];
            if (color) {
              ctx.fillStyle = color;
              ctx.fillRect(px + col * size, py + row * size, size, size);
            }
          }
        }
      };

      // Draw Office Desk with Laptop & Mug
      const drawDesk = (x: number, y: number, isWorking: boolean) => {
        const W = "#a16207"; const D = "#854d0e"; const G = "#334155"; 
        const S = isWorking ? (Math.sin(timeSec * 8) > 0 ? "#60a5fa" : "#93c5fd") : "#475569"; 
        // Table top
        ctx.fillStyle = W; ctx.fillRect(x - 38, y - 18, 76, 36);
        ctx.fillStyle = D; ctx.fillRect(x - 38, y + 18, 76, 4); 
        // Chair
        ctx.fillStyle = "#0f172a"; ctx.fillRect(x - 6, y - 6, 12, 12);
        // Laptop
        const monitorGrid = [
          [G, G, G, G, G, G, G, G],
          [G, S, S, S, S, S, S, G],
          [G, S, S, S, S, S, S, G],
          [G, S, S, S, S, S, S, G],
          [G, G, G, G, G, G, G, G],
        ];
        drawPixels(x - 16, y - 20, 4, monitorGrid);

        // Coffee Mug on desk
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 22, y - 10, 6, 8);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(x + 23, y - 9, 4, 3);
      };

      // Environmental Objects
      const drawPlant = (x: number, y: number) => {
        const P = "#c2410c"; const L = "#22c55e"; const D = "#16a34a"; const _ = null;
        const sway = Math.sin(timeSec * 2 + x) * 1.5;
        const plantGrid = [
          [_, D, L, L, _, _],
          [L, L, L, D, L, _],
          [_, L, D, L, L, D],
          [_, _, L, L, _, _],
          [_, _, P, P, _, _],
          [_, P, P, P, P, _],
        ];
        drawPixels(x - 12 + sway, y - 24, 4, plantGrid);
      };

      const drawRoasterWithSmoke = (x: number, y: number) => {
        const R = "#b91c1c"; const M = "#94a3b8"; const D = "#475569"; const C = "#fbbf24"; const _ = null;
        const roasterGrid = [
          [_, _, _, M, M, M, _, _, _, _],
          [_, _, _, M, D, M, _, _, _, _],
          [_, _, M, M, D, M, M, _, _, _],
          [_, R, R, R, R, R, R, R, C, C],
          [R, R, D, D, R, R, R, R, C, C],
          [R, R, D, D, R, R, M, M, M, M],
          [R, R, R, R, R, R, M, M, M, M],
          [R, R, R, R, R, R, _, _, _, _],
          [D, D, _, _, D, D, _, _, _, _]
        ];
        drawPixels(x - 20, y - 30, 6, roasterGrid); 

        // Animated Chimney Smoke
        for (let i = 0; i < 3; i++) {
          const smokeY = y - 40 - ((timeSec * 30 + i * 20) % 50);
          const smokeX = x - 5 + Math.sin(timeSec * 3 + i) * 8;
          const smokeRadius = 4 + (50 - (y - 40 - smokeY)) * 0.15;
          ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0, 0.4 - ((y - 40 - smokeY) / 100))})`;
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, Math.max(1, smokeRadius), 0, Math.PI * 2);
          ctx.fill();
        }
      };

      const drawSacks = (x: number, y: number, label: string) => {
        const W = "#92400e"; const B = "#d97742"; const D = "#b45b2b"; const _ = null;
        const sackGrid = [
          [_, B, B, B, B, B, _, _, _, B, B, B, B, B, _],
          [B, B, D, D, B, B, B, B, B, D, D, B, B, B, B],
          [B, B, B, B, B, B, B, B, B, B, B, B, B, B, B],
          [B, B, D, B, B, B, B, B, B, D, B, B, B, B, B],
          [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
          [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
        ];
        drawPixels(x - 30, y - 10, 4, sackGrid);
        ctx.fillStyle = "#451a03";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + 4);
      };

      const drawCuppingTable = (x: number, y: number) => {
        // Table top
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.ellipse(x, y, 85, 48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.ellipse(x, y - 5, 85, 48, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cupping Bowls with Steam
        const bowls = [
          { bx: x - 40, by: y - 15 },
          { bx: x + 40, by: y - 15 },
          { bx: x - 20, by: y + 15 },
          { bx: x + 20, by: y + 15 },
          { bx: x, by: y - 5 }
        ];

        bowls.forEach((b, idx) => {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.arc(b.bx, b.by, 5.5, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#451a03";
          ctx.beginPath(); ctx.arc(b.bx, b.by, 4, 0, Math.PI*2); ctx.fill();

          // Steam
          const sY = b.by - 8 - ((timeSec * 15 + idx * 8) % 18);
          const sX = b.bx + Math.sin(timeSec * 4 + idx) * 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
          ctx.beginPath(); ctx.arc(sX, sY, 2, 0, Math.PI*2); ctx.fill();
        });

        // Sign
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("CUPPING TABLE & LAB", x, y + 36);
      };

      // Draw Environment Assets
      drawPlant(45, 80);
      drawPlant(360, 80);
      drawPlant(45, 540);

      // Bookshelf
      ctx.fillStyle = "#a16207"; ctx.fillRect(BOOKSHELF.x - 30, BOOKSHELF.y - 25, 75, 28);
      ctx.fillStyle = "#3b82f6"; ctx.fillRect(BOOKSHELF.x - 20, BOOKSHELF.y - 20, 10, 18);
      ctx.fillStyle = "#ef4444"; ctx.fillRect(BOOKSHELF.x - 5, BOOKSHELF.y - 20, 14, 18);
      ctx.fillStyle = "#10b981"; ctx.fillRect(BOOKSHELF.x + 15, BOOKSHELF.y - 20, 12, 18);

      // Vending Machine
      ctx.fillStyle = "#dc2626"; ctx.fillRect(VENDING_MACHINE.x - 30, VENDING_MACHINE.y - 30, 36, 48);
      ctx.fillStyle = "#1e293b"; ctx.fillRect(VENDING_MACHINE.x - 26, VENDING_MACHINE.y - 24, 28, 22);
      ctx.fillStyle = "#38bdf8"; ctx.fillRect(VENDING_MACHINE.x - 20, VENDING_MACHINE.y - 20, 16, 14);

      // Water Cooler
      ctx.fillStyle = "#f1f5f9"; ctx.fillRect(WATER_COOLER.x - 20, WATER_COOLER.y - 15, 20, 28);
      ctx.fillStyle = "#38bdf8"; ctx.fillRect(WATER_COOLER.x - 18, WATER_COOLER.y - 32, 16, 18);

      // Warehouse Machinery & Sacks
      drawRoasterWithSmoke(ROASTER_MACHINE.x, ROASTER_MACHINE.y);
      drawSacks(BEAN_SACKS.x, BEAN_SACKS.y, "GAYO 60KG");
      drawSacks(BEAN_SACKS.x, BEAN_SACKS.y + 40, "TORAJA 60KG");
      drawSacks(BEAN_SACKS.x, BEAN_SACKS.y + 80, "BAJAWA 60KG");

      drawCuppingTable(CUPPING_TABLE.x, CUPPING_TABLE.y);

      // Draw Workstations
      INITIAL_AGENTS.forEach((agent) => {
        drawDesk(agent.deskX, agent.deskY - 8, agent.activity === "working");
      });

      // --- 2. Autonomous Peer Collaboration State Machine ---
      if (!meetingActiveRef.current) {
        if (!activeCollabRef.current) {
          nextCollabDelayRef.current -= deltaTime;
          if (nextCollabDelayRef.current <= 0) {
            // Select random scenario
            const scenarioIdx = Math.floor(Math.random() * COLLAB_SCENARIOS.length);
            const scenario = COLLAB_SCENARIOS[scenarioIdx];
            const visitor = agentsRef.current.find(a => a.id === scenario.visitorId);
            const target = agentsRef.current.find(a => a.id === scenario.targetId);

            if (visitor && target && visitor.activity === "working" && target.activity === "working") {
              visitor.activity = "collaborating_walk";
              // Walk near target desk
              visitor.targetX = target.deskX + (target.isOfficeWorker ? 30 : -30);
              visitor.targetY = target.deskY + 10;
              visitor.message = "Mampir ke meja...";
              visitor.messageTimer = 2.5;

              activeCollabRef.current = {
                scenarioIndex: scenarioIdx,
                step: 0,
                stepTimer: 0,
                visitorId: visitor.id,
                targetId: target.id
              };

              nextCollabDelayRef.current = 18 + Math.random() * 8; // next collab after 18-26s
            } else {
              nextCollabDelayRef.current = 5;
            }
          }
        } else {
          // Progress ongoing collaboration
          const collab = activeCollabRef.current;
          const scenario = COLLAB_SCENARIOS[collab.scenarioIndex];
          const visitor = agentsRef.current.find(a => a.id === collab.visitorId);
          const target = agentsRef.current.find(a => a.id === collab.targetId);

          if (visitor && target) {
            if (visitor.activity === "collaborating_walk") {
              const dx = visitor.targetX - visitor.x;
              const dy = visitor.targetY - visitor.y;
              if (Math.sqrt(dx * dx + dy * dy) < 10) {
                // Arrived at target's desk! Begin dialogue
                visitor.activity = "collaborating_talk";
                target.activity = "collaborating_talk";
                collab.step = 0;
                collab.stepTimer = 3.5;

                visitor.message = scenario.dialogue[0].text;
                visitor.messageTimer = 3.5;

                // Log to office event stream
                if (onOfficeEvent) {
                  onOfficeEvent({
                    id: Math.random().toString(),
                    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                    speaker: scenario.dialogue[0].speaker,
                    message: scenario.dialogue[0].text,
                    type: "collab"
                  });
                }
              }
            } else if (visitor.activity === "collaborating_talk") {
              collab.stepTimer -= deltaTime;
              if (collab.stepTimer <= 0) {
                collab.step += 1;
                if (collab.step === 1 && scenario.dialogue[1]) {
                  // Target responds
                  target.message = scenario.dialogue[1].text;
                  target.messageTimer = 3.5;
                  collab.stepTimer = 3.5;

                  if (onOfficeEvent) {
                    onOfficeEvent({
                      id: Math.random().toString(),
                      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                      speaker: scenario.dialogue[1].speaker,
                      message: scenario.dialogue[1].text,
                      type: "collab"
                    });
                  }
                } else if (collab.step === 2 && scenario.dialogue[2]) {
                  // Visitor closing
                  visitor.message = scenario.dialogue[2].text;
                  visitor.messageTimer = 3.0;
                  collab.stepTimer = 3.0;

                  if (onOfficeEvent) {
                    onOfficeEvent({
                      id: Math.random().toString(),
                      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                      speaker: scenario.dialogue[2].speaker,
                      message: scenario.dialogue[2].text,
                      type: "collab"
                    });
                  }
                } else {
                  // Collab finished! Visitor returns to desk
                  visitor.activity = "walking";
                  visitor.targetX = visitor.deskX;
                  visitor.targetY = visitor.deskY;
                  visitor.message = "Kembali ke meja..";
                  visitor.messageTimer = 2.0;

                  target.activity = "working";
                  activeCollabRef.current = null;
                }
              }
            }
          }
        }
      }

      // --- 3. Agent Simulation Loop ---
      agentsRef.current.forEach((agent, i) => {
        const isSelected = selectedAgent === agent.id;

        if (agent.waitTimer > 0) agent.waitTimer -= deltaTime;
        if (agent.messageTimer > 0) {
          agent.messageTimer -= deltaTime;
          if (agent.messageTimer <= 0) agent.message = null;
        }

        // Meeting Synchronization
        if (meetingActiveRef.current) {
          if (agent.activity !== "meeting" && agent.activity !== "walking") {
            agent.activity = "walking";
            agent.targetX = MEETING_SPOTS[i % MEETING_SPOTS.length].x;
            agent.targetY = MEETING_SPOTS[i % MEETING_SPOTS.length].y;
            agent.message = "Menuju Cupping Table..";
            agent.messageTimer = 2.5;
          }

          // If this agent is speaking in MeetingPanel
          if (meetingSpeaker && meetingSpeaker.speaker.toLowerCase().includes(agent.label.toLowerCase())) {
            agent.message = meetingSpeaker.text.length > 50 ? meetingSpeaker.text.slice(0, 48) + "..." : meetingSpeaker.text;
            agent.messageTimer = 4.0;
          }
        } else if (!meetingActiveRef.current && agent.activity === "meeting") {
          agent.activity = "walking";
          agent.targetX = agent.deskX;
          agent.targetY = agent.deskY;
          agent.message = "Rapat selesai, eksekusi!";
          agent.messageTimer = 2.5;
        }

        // Selected Agent Priority
        if (isSelected && !meetingActiveRef.current) {
          agent.activity = "working";
          agent.targetX = agent.deskX;
          agent.targetY = agent.deskY;
          agent.x += (agent.deskX - agent.x) * 0.12;
          agent.y += (agent.deskY - agent.y) * 0.12;
          if (!agent.message) {
            agent.message = "Standby bos";
          }
        }

        // Normal Activity State Machine
        if (agent.activity === "working") {
          // Subtle desk movement
          if (Math.random() < 0.03) {
            agent.y = agent.deskY - Math.random() * 2;
          } else {
            agent.y += (agent.deskY - agent.y) * 0.1;
          }

          // Occasional individual break (water/coffee)
          if (!activeCollabRef.current && agent.waitTimer <= 0 && Math.random() < 0.003) {
            if (agent.isOfficeWorker) {
              agent.targetX = WATER_COOLER.x - 30;
              agent.targetY = WATER_COOLER.y + 15;
              agent.message = "Isi tumbler..";
            } else {
              agent.targetX = ROASTER_MACHINE.x - 35;
              agent.targetY = ROASTER_MACHINE.y + 40;
              agent.message = "Cek drum sangrai";
            }
            agent.activity = "walking";
            agent.messageTimer = 3;
          }
        } 
        else if (agent.activity === "walking" || agent.activity === "collaborating_walk") {
          const dx = agent.targetX - agent.x;
          const dy = agent.targetY - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 6) {
            if (meetingActiveRef.current) {
              agent.activity = "meeting";
            } else if (agent.targetX === agent.deskX && agent.targetY === agent.deskY) {
              agent.activity = "working";
              agent.message = null;
            } else if (agent.activity === "walking") {
              agent.activity = "drinking";
              agent.waitTimer = 3.5;
            }
          } else {
            const speed = 75 * deltaTime;
            agent.x += (dx / dist) * speed;
            agent.y += (dy / dist) * speed;
            agent.y += Math.sin(timeSec * 22) * 1.2;
          }
        }
        else if (agent.activity === "drinking") {
          if (agent.waitTimer <= 0) {
            agent.targetX = agent.deskX;
            agent.targetY = agent.deskY;
            agent.activity = "walking";
            agent.message = "Lanjut kerja";
            agent.messageTimer = 2;
          }
        }
        else if (agent.activity === "meeting") {
          agent.y += Math.sin(timeSec * 2 + agent.x) * 0.15;
        }

        // --- 4. Render Agent Sprite (Stardew Valley Style) ---
        const px = agent.x - 18; 
        const py = agent.y - 24; 
        
        const _ = null;
        const H = agent.hair;
        const S = "#ffc8b4"; 
        const C = agent.color; 
        const P = "#1e293b"; 
        const B = "#3f2b1d"; 
        const E = "#000000"; 
        
        let charGrid = [
          [_, _, H, H, H, H, H, H, H, H, _, _],
          [_, H, H, H, H, H, H, H, H, H, H, _],
          [_, H, H, S, S, S, S, S, S, H, H, _],
          [_, H, S, S, E, S, S, E, S, S, H, _], 
          [_, H, S, S, S, S, S, S, S, S, H, _],
          [_, _, H, S, S, S, S, S, S, H, _, _], 
          [_, _, _, C, C, C, C, C, C, _, _, _], 
          [_, _, S, C, C, C, C, C, C, S, _, _], 
          [_, _, S, C, C, C, C, C, C, S, _, _],
          [_, _, S, C, C, C, C, C, C, S, _, _],
          [_, _, _, C, C, C, C, C, C, _, _, _], 
          [_, _, _, P, P, P, P, P, P, _, _, _], 
          [_, _, _, P, P, _, _, P, P, _, _, _],
          [_, _, _, P, P, _, _, P, P, _, _, _],
          [_, _, _, B, B, _, _, B, B, _, _, _], 
          [_, _, _, B, B, _, _, B, B, _, _, _], 
        ];

        // Walking frame animation
        if (agent.activity === "walking" || agent.activity === "collaborating_walk") {
          const step = Math.floor(timeSec * 8) % 2;
          if (step === 0) {
            charGrid[7]  = [_, _, _, C, C, C, C, C, C, S, _, _]; 
            charGrid[13] = [_, _, _, B, B, _, _, P, P, _, _, _]; 
            charGrid[15] = [_, _, _, _, _, _, _, B, B, _, _, _]; 
          } else {
            charGrid[7]  = [_, _, S, C, C, C, C, C, C, _, _, _]; 
            charGrid[13] = [_, _, _, P, P, _, _, B, B, _, _, _]; 
            charGrid[15] = [_, _, _, B, B, _, _, _, _, _, _, _]; 
          }
        }

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.beginPath();
        ctx.ellipse(agent.x, agent.y + 24, 13, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Selected halo
        if (isSelected) {
          ctx.beginPath();
          ctx.ellipse(agent.x, agent.y + 24, 20 + Math.sin(timeSec * 10) * 2, 7 + Math.sin(timeSec * 10) * 1, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Meeting Speaker Halo (Gold glowing pulse)
        if (meetingActiveRef.current && meetingSpeaker && meetingSpeaker.speaker.toLowerCase().includes(agent.label.toLowerCase())) {
          ctx.beginPath();
          ctx.ellipse(agent.x, agent.y + 24, 22 + Math.sin(timeSec * 12) * 3, 8 + Math.sin(timeSec * 12) * 1.5, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        drawPixels(px, py, 3, charGrid);

        // --- 5. Name & Status Badge ---
        ctx.font = "bold 9px monospace";
        const nameW = ctx.measureText(agent.label).width;
        const tagX = agent.x - nameW / 2 - 5;
        const tagY = py + 52;
        
        // Name pill
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, nameW + 10, 14, 3);
        ctx.fill();
        ctx.strokeStyle = isSelected ? "#3b82f6" : "#cbd5e1";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(agent.label, agent.x, tagY + 7);

        // Role/Task Pill beneath name
        if (agent.activity === "working" || agent.activity === "collaborating_talk") {
          ctx.font = "bold 7.5px monospace";
          const badgeW = ctx.measureText(agent.roleBadge).width;
          const bX = agent.x - badgeW / 2 - 4;
          const bY = tagY + 16;

          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.beginPath();
          ctx.roundRect(bX, bY, badgeW + 8, 12, 3);
          ctx.fill();

          ctx.fillStyle = agent.activity === "collaborating_talk" ? "#38bdf8" : "#86efac";
          ctx.fillText(agent.activity === "collaborating_talk" ? "💬 Collab" : agent.roleBadge, agent.x, bY + 6);
        }

        // --- 6. Dynamic Speech Bubble ---
        if (agent.message) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 1;
          
          ctx.font = "bold 9.5px monospace";
          const msgW = Math.min(ctx.measureText(agent.message).width + 16, 220);
          const bubX = agent.x - msgW / 2;
          const bubY = py - 32;
          
          ctx.beginPath();
          ctx.roundRect(bubX, bubY, msgW, 22, 5);
          ctx.fill();
          ctx.stroke();

          // Tail
          ctx.beginPath();
          ctx.moveTo(agent.x - 5, bubY + 22);
          ctx.lineTo(agent.x, bubY + 28);
          ctx.lineTo(agent.x + 5, bubY + 22);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#0f172a";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(agent.message, agent.x, bubY + 11);
        }
      });

      // --- 7. Interactive Meeting Call Button on Canvas ---
      const btnX = 340; const btnY = 535; const btnW = 120; const btnH = 32;
      ctx.fillStyle = meetingActiveRef.current ? "#ef4444" : "#4f46e5";
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 8);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(meetingActiveRef.current ? "🔴 End Meeting" : "☕ Call Meeting", btnX + btnW/2, btnY + btnH/2);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedAgent, meetingSpeaker]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Meeting Button click (340 to 460, 535 to 567)
    if (x >= 340 && x <= 460 && y >= 535 && y <= 567) {
      meetingActiveRef.current = !meetingActiveRef.current;
      if (onMeetingStart) {
        onMeetingStart();
      }
      return;
    }

    // Agent selection
    let clickedAgent: AgentRole | null = null;
    agentsRef.current.forEach((agent) => {
      const dx = x - agent.x;
      const dy = y - agent.y;
      if (Math.sqrt(dx * dx + dy * dy) < 28) {
        clickedAgent = agent.id as AgentRole;
      }
    });

    onSelectAgent(clickedAgent);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    let found: AgentData | null = null;
    agentsRef.current.forEach(agent => {
      const dx = x - agent.x;
      const dy = y - agent.y;
      if (Math.sqrt(dx * dx + dy * dy) < 28) {
        found = agent;
      }
    });
    setHoveredAgent(found);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#0a0f1d] relative">
      <div className="relative border-[10px] border-[#1e293b] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#0f172a] overflow-hidden">
        {/* Subtle scanline overlay for retro-modern aesthetic */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/20 z-10"></div>
        
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredAgent(null)}
          className="cursor-pointer block image-rendering-pixelated max-w-full"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Hover Agent Info Tooltip */}
        {hoveredAgent && (
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg text-xs font-mono text-white shadow-xl pointer-events-none z-20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm">
              {hoveredAgent.label[0]}
            </div>
            <div>
              <div className="font-bold text-sm text-indigo-300">{hoveredAgent.id}</div>
              <div className="text-slate-400">Tugas: <span className="text-emerald-400">{hoveredAgent.roleBadge}</span></div>
              <div className="text-slate-400">Status: <span className="text-amber-400 capitalize">{hoveredAgent.activity}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
