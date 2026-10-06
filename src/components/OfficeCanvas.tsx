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
  contained?: boolean;
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
  sipTimer?: number;
}

export interface HoveredPropInfo {
  name: string;
  role: string;
  desc: string;
  emoji: string;
}

// Points of interest
const WATER_COOLER = { x: 535, y: 90 };
const BOOKSHELF = { x: 90, y: 90 };
const VENDING_MACHINE = { x: 535, y: 490 };
const ROASTER_MACHINE = { x: 860, y: 140 };
const BEAN_SACKS = { x: 740, y: 180 };
const CUPPING_TABLE = { x: 400, y: 280 };
const ESPRESSO_BAR = { x: 465, y: 80 };
const PALLET_JACK = { x: 730, y: 525 };
const SERVER_RACK = { x: 45, y: 485 };
const PACKING_BENCH = { x: 890, y: 220 };

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
  onOfficeEvent,
  contained = false
}: OfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<AgentData[]>(JSON.parse(JSON.stringify(INITIAL_AGENTS)));
  const meetingActiveRef = useRef(isMeetingActive);
  const [hoveredAgent, setHoveredAgent] = useState<AgentData | null>(null);
  const [hoveredProp, setHoveredProp] = useState<HoveredPropInfo | null>(null);

  // Autonomous Props & Pet states
  const catRef = useRef({
    x: 395,
    y: 350,
    targetX: 395,
    targetY: 350,
    state: "sleeping" as "sleeping" | "walking" | "sitting",
    timer: 6,
    tailAngle: 0,
    message: null as string | null,
    messageTimer: 0,
    hearts: [] as { x: number; y: number; life: number }[]
  });

  const roombaRef = useRef({
    x: 340,
    y: 190,
    vy: 28,
    spin: 0,
    message: null as string | null,
    messageTimer: 0
  });

  const mouseRef = useRef({
    x: 775,
    y: 270,
    message: null as string | null,
    messageTimer: 0
  });

  const propBubblesRef = useRef<{
    roaster: { message: string | null; timer: number };
    bar: { message: string | null; timer: number };
    pallet: { message: string | null; timer: number };
    server: { message: string | null; timer: number };
  }>({
    roaster: { message: null, timer: 0 },
    bar: { message: null, timer: 0 },
    pallet: { message: null, timer: 0 },
    server: { message: null, timer: 0 },
  });

  // Active collaboration state
  const activeCollabRef = useRef<{
    scenarioIndex: number;
    step: number;
    stepTimer: number;
    visitorId: string;
    targetId: string;
  } | null>(null);

  const nextCollabDelayRef = useRef(8);

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
      const deltaTime = Math.min((timeNow - lastTime) / 1000, 0.1);
      lastTime = timeNow;
      const timeSec = timeNow / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- 1. Floors (Parquet Office vs Concrete Roastery) ---
      const tileSize = 40;
      for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
          if (x < 660) {
            // Warm Scandinavian parquet flooring with delicate wood grain lines
            const isLight = ((x / tileSize) + (y / tileSize)) % 2 === 0;
            ctx.fillStyle = isLight ? "#cbd5e1" : "#e2e8f0";
            ctx.fillRect(x, y, tileSize, tileSize);
            // Subtle wood plank texture border
            ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, tileSize, tileSize);
          } else {
            // Industrial Slate Roastery Warehouse floor with expansion cuts
            const isLight = ((x / tileSize) + (y / tileSize)) % 2 === 0;
            ctx.fillStyle = isLight ? "#475569" : "#334155";
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.strokeStyle = "rgba(15, 23, 42, 0.4)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, tileSize, tileSize);
          }
        }
      }

      // Warehouse Safety Yellow Chevron Zone around Roaster & Heavy Sacks
      ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
      ctx.fillRect(700, 100, 270, 180);
      ctx.fillRect(690, 480, 160, 90);

      // Border Walls (Dark Slate Brick)
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, 36); 
      ctx.fillRect(0, canvas.height - 16, canvas.width, 16); 
      ctx.fillRect(0, 0, 16, canvas.height); 
      ctx.fillRect(canvas.width - 16, 0, 16, canvas.height); 

      // Dividing Wall with Doorway
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(660, 0, 16, 230); 
      ctx.fillRect(660, 350, 16, 250); 
      // Yellow / Black Caution Stripes at Roastery Entrance
      for (let sy = 230; sy < 350; sy += 12) {
        ctx.fillStyle = (Math.floor(sy / 12) % 2 === 0) ? "#f59e0b" : "#1e293b";
        ctx.fillRect(660, sy, 16, 12);
      }

      // Overhead Galvanized Ventilation Duct in Warehouse
      ctx.fillStyle = "#64748b";
      ctx.fillRect(680, 12, 300, 12);
      ctx.fillStyle = "#94a3b8";
      for (let vx = 690; vx < 970; vx += 24) {
        ctx.fillRect(vx, 10, 4, 16); // Rivet bands
      }

      // Room Signages
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "left";
      ctx.fillText("🏢 HQ OFFICE & LAB", 28, 26);
      ctx.fillText("🏭 ROASTERY & DISPATCH", 690, 26);

      // Helper pixel renderer
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

      // Helper speech bubble
      const drawSpeechBubble = (x: number, y: number, text: string, bgColor = "#ffffff", textColor = "#0f172a") => {
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.font = "bold 9.5px monospace";
        const msgW = Math.min(ctx.measureText(text).width + 16, 230);
        const bubX = x - msgW / 2;
        const bubY = y - 32;

        ctx.beginPath();
        ctx.roundRect(bubX, bubY, msgW, 22, 5);
        ctx.fill();
        ctx.stroke();

        // Tail
        ctx.beginPath();
        ctx.moveTo(x - 5, bubY + 22);
        ctx.lineTo(x, bubY + 28);
        ctx.lineTo(x + 5, bubY + 22);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, bubY + 11);
      };

      // --- 2. Architectural Decor: Persian Boho Carpet under Cupping Table ---
      const drawPersianCarpet = (cx: number, cy: number, w: number, h: number) => {
        // Base rose/burgundy rug
        ctx.fillStyle = "#881337";
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);

        // Gold outer border
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8);

        // Crimson inner border
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - w / 2 + 10, cy - h / 2 + 10, w - 20, h - 20);

        // Medallion diamond pattern
        ctx.fillStyle = "#9f1239";
        ctx.beginPath();
        ctx.moveTo(cx, cy - h / 2 + 18);
        ctx.lineTo(cx + w / 2 - 24, cy);
        ctx.lineTo(cx, cy + h / 2 - 18);
        ctx.lineTo(cx - w / 2 + 24, cy);
        ctx.closePath();
        ctx.fill();

        // Tassels on left and right fringes
        ctx.fillStyle = "#f8fafc";
        for (let y = cy - h / 2 + 4; y <= cy + h / 2 - 4; y += 6) {
          ctx.fillRect(cx - w / 2 - 4, y, 4, 2);
          ctx.fillRect(cx + w / 2, y, 4, 2);
        }
      };
      drawPersianCarpet(CUPPING_TABLE.x, CUPPING_TABLE.y, 230, 140);

      // Welcome Doormat at office entrance
      ctx.fillStyle = "#78350f";
      ctx.fillRect(630, 275, 26, 40);
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(630, 275, 26, 40);
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 6.5px monospace";
      ctx.textAlign = "center";
      ctx.fillText("RAMU", 643, 292);
      ctx.fillText("☕", 643, 303);

      // --- 3. Live Wall Clock (Real-Time Synchronized) ---
      const drawWallClock = (x: number, y: number) => {
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fef9c3";
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Clock ticks
        const now = new Date();
        const hrs = (now.getHours() % 12) + now.getMinutes() / 60;
        const mins = now.getMinutes() + now.getSeconds() / 60;
        const secs = now.getSeconds() + (now.getMilliseconds() / 1000);

        // Hour hand
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.sin(hrs * Math.PI / 6) * 6, y - Math.cos(hrs * Math.PI / 6) * 6);
        ctx.stroke();

        // Minute hand
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.sin(mins * Math.PI / 30) * 8.5, y - Math.cos(mins * Math.PI / 30) * 8.5);
        ctx.stroke();

        // Red second hand
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.sin(secs * Math.PI / 30) * 9.5, y - Math.cos(secs * Math.PI / 30) * 9.5);
        ctx.stroke();
      };
      drawWallClock(320, 22);

      // --- 4. Wall Whiteboard & Strategy Doodles ---
      const drawWhiteboard = (x: number, y: number) => {
        // Frame
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(x - 55, y - 14, 110, 26);
        // Board surface
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(x - 53, y - 12, 106, 22);

        // Sticky notes (Pink, Yellow, Cyan)
        ctx.fillStyle = "#f472b6"; ctx.fillRect(x - 48, y - 10, 8, 8);
        ctx.fillStyle = "#fef08a"; ctx.fillRect(x - 38, y - 10, 8, 8);
        ctx.fillStyle = "#38bdf8"; ctx.fillRect(x - 28, y - 10, 8, 8);

        // Upward trending arrow & chart
        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 14, y + 4);
        ctx.lineTo(x - 4, y - 2);
        ctx.lineTo(x + 6, y - 8);
        ctx.stroke();

        // Mini text doodle
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 6.5px monospace";
        ctx.textAlign = "left";
        ctx.fillText("ROAS 3.8x 🚀", x + 10, y - 3);
        ctx.fillStyle = "#f97316";
        ctx.fillText("☕ Gayo 87.5", x + 10, y + 5);
      };
      drawWhiteboard(210, 22);

      // --- 5. Indonesian Coffee Map Wall Frame ---
      const drawCoffeeMapArt = (x: number, y: number) => {
        ctx.fillStyle = "#78350f"; ctx.fillRect(x - 32, y - 12, 64, 24);
        ctx.fillStyle = "#fef3c7"; ctx.fillRect(x - 30, y - 10, 60, 20);

        // Island silhouettes
        ctx.fillStyle = "#15803d";
        ctx.fillRect(x - 26, y - 5, 8, 5); // Sumatra
        ctx.fillRect(x - 16, y, 12, 3); // Java
        ctx.fillRect(x - 2, y - 4, 7, 7); // Kalimantan
        ctx.fillRect(x + 7, y - 3, 6, 6); // Sulawesi
        ctx.fillRect(x + 15, y - 1, 10, 4); // Papua

        ctx.fillStyle = "#b45309";
        ctx.font = "bold 5.5px monospace";
        ctx.textAlign = "center";
        ctx.fillText("PETA KOPI NUSANTARA", x, y + 7);
      };
      drawCoffeeMapArt(95, 22);

      // Q-Grader Certification Frame
      ctx.fillStyle = "#854d0e"; ctx.fillRect(590, 10, 42, 24);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(592, 12, 38, 20);
      ctx.fillStyle = "#eab308"; ctx.fillRect(606, 17, 10, 10); // Gold seal
      ctx.fillStyle = "#0f172a"; ctx.font = "bold 5px monospace"; ctx.textAlign = "center";
      ctx.fillText("Q-GRADER", 611, 29);

      // --- 6. Specialty Barista Bar & Commercial Espresso Machine ---
      const drawEspressoBar = (x: number, y: number) => {
        // Dark Oak Bar Counter
        ctx.fillStyle = "#451a03"; ctx.fillRect(x - 45, y - 18, 90, 36);
        ctx.fillStyle = "#78350f"; ctx.fillRect(x - 45, y + 18, 90, 4);

        // Stainless steel commercial espresso machine (2-group)
        ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x - 30, y - 14, 38, 22);
        ctx.fillStyle = "#0f172a"; ctx.fillRect(x - 28, y + 4, 34, 4); // Drip tray
        ctx.fillStyle = "#334155";
        ctx.fillRect(x - 24, y + 1, 8, 5); // Portafilter 1
        ctx.fillRect(x - 10, y + 1, 8, 5); // Portafilter 2

        // Cups warming on top
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 28, y - 18, 5, 4);
        ctx.fillRect(x - 20, y - 18, 5, 4);
        ctx.fillRect(x - 12, y - 18, 5, 4);

        // Steam from espresso machine
        for (let s = 0; s < 2; s++) {
          const stY = y - 18 - ((timeSec * 16 + s * 9) % 24);
          const stX = x - 22 + s * 12 + Math.sin(timeSec * 3 + s) * 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.beginPath();
          ctx.arc(stX, stY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Coffee Grinder with bean hopper
        ctx.fillStyle = "#1e293b"; ctx.fillRect(x + 14, y - 12, 10, 18);
        ctx.fillStyle = "rgba(254, 240, 138, 0.8)"; ctx.fillRect(x + 13, y - 19, 12, 7); // Glass hopper
        ctx.fillStyle = "#78350f"; ctx.fillRect(x + 14, y - 18, 10, 5); // Coffee beans

        // V60 Dripper & Chemex
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.moveTo(x + 28, y - 10);
        ctx.lineTo(x + 38, y - 10);
        ctx.lineTo(x + 33, y - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#92400e"; // Coffee drop
        ctx.fillRect(x + 32, y, 2, 4);

        // Glowing Neon Bar Sign above
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.roundRect(x - 38, y - 36, 76, 14, 4);
        ctx.fill();
        ctx.strokeStyle = Math.sin(timeSec * 5) > 0 ? "#f43f5e" : "#fb7185";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 7.5px monospace";
        ctx.textAlign = "center";
        ctx.fillText("✨ RAMU BAR ☕", x, y - 26);
      };
      drawEspressoBar(ESPRESSO_BAR.x, ESPRESSO_BAR.y);

      // --- 7. Server Rack with Blinking LEDs (Web Store Infra) ---
      const drawServerRack = (x: number, y: number) => {
        ctx.fillStyle = "#0f172a"; ctx.fillRect(x - 16, y - 25, 32, 50);
        ctx.strokeStyle = "#334155"; ctx.strokeRect(x - 16, y - 25, 32, 50);

        // Server blades
        for (let u = 0; u < 4; u++) {
          const sy = y - 20 + u * 11;
          ctx.fillStyle = "#1e293b"; ctx.fillRect(x - 13, sy, 26, 9);
          // Blinking LEDs
          const led1 = Math.sin(timeSec * (12 + u * 3)) > 0 ? "#22c55e" : "#0f172a";
          const led2 = Math.sin(timeSec * (8 + u * 5)) > 0 ? "#38bdf8" : "#0f172a";
          const led3 = Math.sin(timeSec * (15 + u)) > 0.5 ? "#f59e0b" : "#0f172a";
          ctx.fillStyle = led1; ctx.fillRect(x - 10, sy + 3, 3, 3);
          ctx.fillStyle = led2; ctx.fillRect(x - 5, sy + 3, 3, 3);
          ctx.fillStyle = led3; ctx.fillRect(x, sy + 3, 3, 3);
        }
      };
      drawServerRack(SERVER_RACK.x, SERVER_RACK.y);

      // --- 8. Break Lounge Armchair / Sofa ---
      const drawBreakSofa = (x: number, y: number) => {
        // Warm teal velvet sofa
        ctx.fillStyle = "#0f766e"; ctx.fillRect(x - 22, y - 14, 44, 28);
        ctx.fillStyle = "#115e59"; ctx.fillRect(x - 26, y - 16, 6, 32); // Left arm
        ctx.fillStyle = "#115e59"; ctx.fillRect(x + 20, y - 16, 6, 32); // Right arm
        // Throw pillow
        ctx.fillStyle = "#fbbf24"; ctx.fillRect(x - 12, y - 10, 10, 10);
      };
      drawBreakSofa(475, 490);

      // --- 9. Individual Desk Personalization & Props ---
      const drawDesk = (x: number, y: number, isWorking: boolean, agentId: string) => {
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

        // Coffee Mug
        ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 22, y - 10, 6, 8);
        ctx.fillStyle = "#78350f"; ctx.fillRect(x + 23, y - 9, 4, 3);

        // Role-Specific Cute Accessories
        if (agentId.includes("Rama")) {
          // Mini Bonsai + Executive Desk Phone
          ctx.fillStyle = "#15803d"; ctx.beginPath(); ctx.arc(x - 26, y - 8, 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#78350f"; ctx.fillRect(x - 28, y - 4, 4, 4);
        } else if (agentId.includes("Rian")) {
          // Cute Yellow Rubber Ducky + Code Glow
          ctx.fillStyle = "#facc15"; ctx.fillRect(x - 28, y - 10, 6, 5); // Duck body
          ctx.fillStyle = "#ea580c"; ctx.fillRect(x - 29, y - 9, 2, 2); // Duck bill
        } else if (agentId.includes("Fina")) {
          // Calculator + Golden Coin Stack
          ctx.fillStyle = "#475569"; ctx.fillRect(x - 28, y - 10, 6, 8);
          ctx.fillStyle = "#eab308"; ctx.fillRect(x - 28, y + 2, 5, 2); // Coin
        } else if (agentId.includes("Sari")) {
          // Pink Headset + Sticky notes
          ctx.fillStyle = "#ec4899"; ctx.fillRect(x - 28, y - 11, 7, 7);
        } else if (agentId.includes("Maya")) {
          // Ring Light Tripod + Camera
          ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x - 26, y - 9, 4, 0, Math.PI * 2); ctx.stroke();
        } else if (agentId.includes("Kafin")) {
          // Chemistry Erlenmeyer Flask + Cupping Spoon
          ctx.fillStyle = "#38bdf8"; ctx.fillRect(x - 26, y - 9, 5, 6);
          ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x - 28, y - 5, 9, 2); // Spoon
        } else if (agentId.includes("Doni")) {
          // Moisture Tester + Green Bag
          ctx.fillStyle = "#10b981"; ctx.fillRect(x + 12, y - 14, 7, 8);
        } else if (agentId.includes("Gilang")) {
          // Barcode Scanner & Parcel Box
          ctx.fillStyle = "#d97706"; ctx.fillRect(x + 12, y - 14, 8, 8);
        }
      };

      // Environmental Plants
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

      drawPlant(45, 80);
      drawPlant(360, 80);
      drawPlant(45, 545);
      drawPlant(600, 545); // Ficus near vending machine

      // Bookshelf
      ctx.fillStyle = "#a16207"; ctx.fillRect(BOOKSHELF.x - 30, BOOKSHELF.y - 25, 75, 28);
      ctx.fillStyle = "#3b82f6"; ctx.fillRect(BOOKSHELF.x - 20, BOOKSHELF.y - 20, 10, 18);
      ctx.fillStyle = "#ef4444"; ctx.fillRect(BOOKSHELF.x - 5, BOOKSHELF.y - 20, 14, 18);
      ctx.fillStyle = "#10b981"; ctx.fillRect(BOOKSHELF.x + 15, BOOKSHELF.y - 20, 12, 18);

      // Vending Machine with glowing front
      ctx.fillStyle = "#dc2626"; ctx.fillRect(VENDING_MACHINE.x - 28, VENDING_MACHINE.y - 30, 36, 48);
      ctx.fillStyle = "#1e293b"; ctx.fillRect(VENDING_MACHINE.x - 24, VENDING_MACHINE.y - 24, 28, 22);
      ctx.fillStyle = "#38bdf8"; ctx.fillRect(VENDING_MACHINE.x - 18, VENDING_MACHINE.y - 20, 16, 14);

      // Water Cooler with live animated air bubbles
      ctx.fillStyle = "#f1f5f9"; ctx.fillRect(WATER_COOLER.x - 20, WATER_COOLER.y - 15, 20, 28);
      ctx.fillStyle = "#38bdf8"; ctx.fillRect(WATER_COOLER.x - 18, WATER_COOLER.y - 32, 16, 18);
      // Rising bubble
      const bY = WATER_COOLER.y - 18 - ((timeSec * 20) % 12);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(WATER_COOLER.x - 11, bY, 2, 2);

      // --- 10. High-Detail Industrial Roaster (Probat UG22) ---
      const drawRoasterWithSmoke = (x: number, y: number) => {
        // Cast-iron base
        ctx.fillStyle = "#1e293b"; ctx.fillRect(x - 32, y - 10, 64, 40);

        // Ruby Roasting Drum with brass bands
        ctx.fillStyle = "#991b1b"; ctx.fillRect(x - 28, y - 32, 56, 26);
        ctx.fillStyle = "#ca8a04"; ctx.fillRect(x - 28, y - 28, 56, 3);
        ctx.fillStyle = "#ca8a04"; ctx.fillRect(x - 28, y - 14, 56, 3);

        // Roasting Flame Glass Sight Window (Glowing orange/yellow)
        const flameColor = Math.sin(timeSec * 10) > 0 ? "#f97316" : "#fbbf24";
        ctx.fillStyle = flameColor;
        ctx.beginPath();
        ctx.arc(x, y - 20, 7, 0, Math.PI * 2);
        ctx.fill();

        // Top Green Bean Hopper
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.moveTo(x - 14, y - 44);
        ctx.lineTo(x + 14, y - 44);
        ctx.lineTo(x + 6, y - 32);
        ctx.lineTo(x - 6, y - 32);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#84cc16"; ctx.fillRect(x - 8, y - 46, 16, 4); // Green beans

        // Circular Cooling Tray Sieve
        ctx.fillStyle = "#475569";
        ctx.beginPath();
        ctx.ellipse(x, y + 26, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#78350f"; // Roasted beans in tray
        ctx.beginPath();
        ctx.ellipse(x, y + 26, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rotating Agitator Stirring Arms
        const armAngle = timeSec * 3;
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(armAngle) * 18, y + 26 - Math.sin(armAngle) * 7);
        ctx.lineTo(x + Math.cos(armAngle) * 18, y + 26 + Math.sin(armAngle) * 7);
        ctx.stroke();

        // Temperature Gauge & LED "205°C"
        ctx.fillStyle = "#0f172a"; ctx.fillRect(x + 22, y - 24, 22, 10);
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 6.5px monospace"; ctx.textAlign = "center";
        ctx.fillText("205°C", x + 33, y - 16);

        // Roaster Chimney & Billowing Smoke
        ctx.fillStyle = "#475569"; ctx.fillRect(x - 6, y - 60, 12, 20);
        for (let i = 0; i < 4; i++) {
          const smokeY = y - 62 - ((timeSec * 28 + i * 18) % 55);
          const smokeX = x + Math.sin(timeSec * 2.5 + i) * 10;
          const smokeRadius = 4 + (55 - (y - 62 - smokeY)) * 0.16;
          ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0, 0.45 - ((y - 62 - smokeY) / 100))})`;
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, Math.max(1, smokeRadius), 0, Math.PI * 2);
          ctx.fill();
        }
      };
      drawRoasterWithSmoke(ROASTER_MACHINE.x, ROASTER_MACHINE.y);

      // --- 11. Packaging & QC Packing Station ---
      const drawPackingStation = (x: number, y: number) => {
        // Table
        ctx.fillStyle = "#64748b"; ctx.fillRect(x - 35, y - 14, 70, 28);
        ctx.fillStyle = "#94a3b8"; ctx.fillRect(x - 35, y - 16, 70, 4); // Steel trim

        // Digital Scale with glowing green display (200.0g)
        ctx.fillStyle = "#1e293b"; ctx.fillRect(x - 28, y - 12, 18, 12);
        ctx.fillStyle = "#22c55e"; ctx.font = "bold 5px monospace"; ctx.textAlign = "center";
        ctx.fillText("200g", x - 19, y - 4);

        // Heat Sealer
        ctx.fillStyle = "#dc2626"; ctx.fillRect(x - 4, y - 12, 16, 6);
        ctx.fillStyle = "#22c55e"; ctx.fillRect(x + 9, y - 11, 2, 2); // Ready LED

        // Pouch Coffee Bags (Brown Kraft)
        ctx.fillStyle = "#d97706"; ctx.fillRect(x + 16, y - 14, 7, 10);
        ctx.fillStyle = "#b45309"; ctx.fillRect(x + 24, y - 14, 7, 10);

        // Shipping box on floor
        ctx.fillStyle = "#b45309"; ctx.fillRect(x - 30, y + 18, 18, 14);
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(x - 26, y + 21, 6, 4); // Shipping label
      };
      drawPackingStation(PACKING_BENCH.x, PACKING_BENCH.y);

      // --- 12. Burlap Coffee Sacks (Authentic Origin Stamps) ---
      const drawSacks = (x: number, y: number, label: string, stampColor = "#15803d") => {
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

        ctx.fillStyle = stampColor;
        ctx.font = "bold 7.5px monospace";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + 4);
      };
      drawSacks(BEAN_SACKS.x, BEAN_SACKS.y, "GAYO 60KG 🌿", "#15803d");
      drawSacks(BEAN_SACKS.x, BEAN_SACKS.y + 38, "TORAJA 60KG 🏔️", "#0369a1");
      drawSacks(BEAN_SACKS.x, BEAN_SACKS.y + 76, "FLORES 60KG 🍯", "#b45309");

      // Piko the Warehouse Mouse near the sacks
      const drawPikoMouse = (x: number, y: number) => {
        ctx.fillStyle = "#71717a"; ctx.beginPath(); ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); // body
        ctx.fillStyle = "#f472b6"; ctx.beginPath(); ctx.arc(x - 4, y - 3, 2, 0, Math.PI * 2); ctx.fill(); // ear
        ctx.fillStyle = "#78350f"; ctx.beginPath(); ctx.arc(x + 5, y + 1, 2, 0, Math.PI * 2); ctx.fill(); // coffee bean held
      };
      drawPikoMouse(mouseRef.current.x, mouseRef.current.y);

      // --- 13. Hydraulic Hand Pallet Jack (Forklift Truck) ---
      const drawPalletJack = (x: number, y: number) => {
        // Yellow hydraulic forks
        ctx.fillStyle = "#eab308";
        ctx.fillRect(x - 28, y - 8, 48, 16);
        ctx.fillStyle = "#ca8a04";
        ctx.fillRect(x + 20, y - 12, 8, 24); // Front mast

        // T-handle
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x + 24, y);
        ctx.lineTo(x + 36, y - 14);
        ctx.lineTo(x + 42, y - 14);
        ctx.stroke();

        // Wheels
        ctx.fillStyle = "#0f172a";
        ctx.beginPath(); ctx.arc(x - 22, y + 10, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 18, y + 10, 5, 0, Math.PI * 2); ctx.fill();

        // Stacked Wooden Pallet & Dispatch Boxes
        ctx.fillStyle = "#78350f"; ctx.fillRect(x - 24, y - 12, 38, 4); // Pallet
        ctx.fillStyle = "#d97706"; ctx.fillRect(x - 20, y - 26, 16, 14); // Box 1
        ctx.fillStyle = "#b45309"; ctx.fillRect(x - 2, y - 26, 16, 14); // Box 2
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(x - 17, y - 23, 6, 4); // Barcode label
      };
      drawPalletJack(PALLET_JACK.x, PALLET_JACK.y);

      // Safety Props in Warehouse: Fire Extinguisher & First Aid
      ctx.fillStyle = "#ef4444"; ctx.fillRect(680, 45, 8, 16); // Fire extinguisher
      ctx.fillStyle = "#0f172a"; ctx.fillRect(682, 42, 4, 3);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(680, 80, 14, 14); // First aid box
      ctx.fillStyle = "#16a34a"; ctx.fillRect(685, 83, 4, 8); ctx.fillRect(683, 85, 8, 4); // Green cross

      // Heavy duty Industrial Floor Fan with spinning blades
      const fanAngle = timeSec * 15;
      ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.arc(940, 520, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(940 - Math.cos(fanAngle) * 12, 520 - Math.sin(fanAngle) * 12);
      ctx.lineTo(940 + Math.cos(fanAngle) * 12, 520 + Math.sin(fanAngle) * 12);
      ctx.stroke();

      // Cupping Table Assembly with Bowls & Steam
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
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.beginPath(); ctx.arc(sX, sY, 2, 0, Math.PI*2); ctx.fill();
        });

        // Sign
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("CUPPING TABLE & LAB", x, y + 36);
      };
      drawCuppingTable(CUPPING_TABLE.x, CUPPING_TABLE.y);

      // --- 14. Render Agent Desks ---
      INITIAL_AGENTS.forEach((agent) => {
        drawDesk(agent.deskX, agent.deskY - 8, agent.activity === "working", agent.id);
      });

      // --- 15. Autonomous Pets & Mascots ---
      // Mochi the Calico Cat Logic
      const cat = catRef.current;
      cat.tailAngle = Math.sin(timeSec * 4) * 0.4;
      if (cat.timer > 0) {
        cat.timer -= deltaTime;
        if (cat.timer <= 0) {
          cat.state = cat.state === "sleeping" ? "sitting" : "sleeping";
          cat.timer = cat.state === "sleeping" ? 10 : 6;
        }
      }

      // Draw Mochi the Calico Cat
      const cx = cat.x;
      const cy = cat.y;
      if (cat.state === "sleeping") {
        // Curled ball with rhythmic breathing
        const breath = Math.sin(timeSec * 3) * 0.8;
        ctx.fillStyle = "#ea580c"; ctx.beginPath(); ctx.arc(cx, cy + breath, 9, 0, Math.PI * 2); ctx.fill(); // Orange patch
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(cx - 3, cy + breath, 7, 0, Math.PI * 2); ctx.fill(); // White belly
        ctx.fillStyle = "#1c1917"; ctx.beginPath(); ctx.arc(cx + 4, cy - 2 + breath, 5, 0, Math.PI * 2); ctx.fill(); // Black patch
        // Tail tucked
        ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy + breath, 11, Math.PI * 0.2, Math.PI * 0.9); ctx.stroke();

        // Floating "Zzz"
        const zY = cy - 14 - ((timeSec * 12) % 20);
        ctx.fillStyle = "#c084fc";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText("z Z", cx + 8, zY);
      } else {
        // Sitting upright, ears alert, tail wagging
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(cx, cy, 7, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ea580c"; ctx.beginPath(); ctx.arc(cx - 2, cy - 8, 6, 0, Math.PI * 2); ctx.fill(); // Head
        // Ears
        ctx.fillStyle = "#f472b6";
        ctx.beginPath(); ctx.moveTo(cx - 6, cy - 12); ctx.lineTo(cx - 3, cy - 17); ctx.lineTo(cx, cy - 12); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx + 3, cy - 17); ctx.lineTo(cx + 6, cy - 12); ctx.fill();
        // Eyes
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(cx - 4, cy - 9, 2, 2);
        ctx.fillRect(cx + 2, cy - 9, 2, 2);
        // Wagging tail
        ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx + 4, cy + 6);
        ctx.quadraticCurveTo(cx + 12 + Math.sin(timeSec * 6) * 4, cy + 2, cx + 14, cy - 6);
        ctx.stroke();
      }

      // Floating hearts when clicked
      cat.hearts.forEach((h, hIdx) => {
        h.y -= deltaTime * 20;
        h.life -= deltaTime;
        ctx.fillStyle = `rgba(244, 63, 94, ${Math.max(0, h.life)})`;
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("❤️", h.x, h.y);
      });
      cat.hearts = cat.hearts.filter(h => h.life > 0);

      // Speech bubble for Mochi
      if (cat.messageTimer > 0) {
        cat.messageTimer -= deltaTime;
        if (cat.message) drawSpeechBubble(cx, cy, cat.message, "#fdf2f8", "#be185d");
        if (cat.messageTimer <= 0) cat.message = null;
      }

      // RamuBot the Roomba Vacuum Logic
      const rb = roombaRef.current;
      rb.y += rb.vy * deltaTime;
      if (rb.y > 440) { rb.y = 440; rb.vy = -Math.abs(rb.vy); }
      if (rb.y < 140) { rb.y = 140; rb.vy = Math.abs(rb.vy); }

      // Draw RamuBot Roomba
      ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(rb.x, rb.y, 14, 0, Math.PI * 2); ctx.fill(); // Outer bumper
      ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.arc(rb.x, rb.y, 11, 0, Math.PI * 2); ctx.fill(); // Top plate
      // Blinking sensor light
      ctx.fillStyle = Math.sin(timeSec * 8) > 0 ? "#10b981" : "#06b6d4";
      ctx.beginPath(); ctx.arc(rb.x, rb.y - 6, 2.5, 0, Math.PI * 2); ctx.fill();
      // Coffee bean sticker on top
      ctx.fillStyle = "#78350f"; ctx.beginPath(); ctx.arc(rb.x, rb.y + 2, 3, 0, Math.PI * 2); ctx.fill();

      // Clean dust sparkles behind roomba
      if (Math.sin(timeSec * 10) > 0.5) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
        ctx.font = "7px monospace";
        ctx.fillText("✨", rb.x + (Math.random() - 0.5) * 16, rb.y + (Math.random() - 0.5) * 16);
      }

      // Speech bubble for RamuBot
      if (rb.messageTimer > 0) {
        rb.messageTimer -= deltaTime;
        if (rb.message) drawSpeechBubble(rb.x, rb.y, rb.message, "#ecfeff", "#0e7490");
        if (rb.messageTimer <= 0) rb.message = null;
      }

      // Speech bubble for Piko Mouse
      const ms = mouseRef.current;
      if (ms.messageTimer > 0) {
        ms.messageTimer -= deltaTime;
        if (ms.message) drawSpeechBubble(ms.x, ms.y, ms.message, "#fef3c7", "#92400e");
        if (ms.messageTimer <= 0) ms.message = null;
      }

      // Speech bubbles for interactive props
      const pb = propBubblesRef.current;
      if (pb.roaster.timer > 0) {
        pb.roaster.timer -= deltaTime;
        if (pb.roaster.message) drawSpeechBubble(ROASTER_MACHINE.x, ROASTER_MACHINE.y - 10, pb.roaster.message, "#fef2f2", "#b91c1c");
      }
      if (pb.bar.timer > 0) {
        pb.bar.timer -= deltaTime;
        if (pb.bar.message) drawSpeechBubble(ESPRESSO_BAR.x, ESPRESSO_BAR.y - 10, pb.bar.message, "#fffbeb", "#b45309");
      }
      if (pb.pallet.timer > 0) {
        pb.pallet.timer -= deltaTime;
        if (pb.pallet.message) drawSpeechBubble(PALLET_JACK.x, PALLET_JACK.y - 10, pb.pallet.message, "#fefce8", "#a16207");
      }
      if (pb.server.timer > 0) {
        pb.server.timer -= deltaTime;
        if (pb.server.message) drawSpeechBubble(SERVER_RACK.x, SERVER_RACK.y - 10, pb.server.message, "#f0fdf4", "#15803d");
      }

      // --- 16. Autonomous Peer Collaboration State Machine ---
      if (!meetingActiveRef.current && !selectedAgent) {
        if (!activeCollabRef.current) {
          nextCollabDelayRef.current -= deltaTime;
          if (nextCollabDelayRef.current <= 0) {
            const scenarioIdx = Math.floor(Math.random() * COLLAB_SCENARIOS.length);
            const scenario = COLLAB_SCENARIOS[scenarioIdx];
            const visitor = agentsRef.current.find(a => a.id === scenario.visitorId);
            const target = agentsRef.current.find(a => a.id === scenario.targetId);

            if (visitor && target && visitor.activity === "working" && target.activity === "working") {
              visitor.activity = "collaborating_walk";
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

              nextCollabDelayRef.current = 18 + Math.random() * 8;
            } else {
              nextCollabDelayRef.current = 5;
            }
          }
        } else {
          const collab = activeCollabRef.current;
          const scenario = COLLAB_SCENARIOS[collab.scenarioIndex];
          const visitor = agentsRef.current.find(a => a.id === collab.visitorId);
          const target = agentsRef.current.find(a => a.id === collab.targetId);

          if (visitor && target) {
            if (visitor.activity === "collaborating_walk") {
              const dx = visitor.targetX - visitor.x;
              const dy = visitor.targetY - visitor.y;
              if (Math.sqrt(dx * dx + dy * dy) < 10) {
                visitor.activity = "collaborating_talk";
                target.activity = "collaborating_talk";
                collab.step = 0;
                collab.stepTimer = 3.5;

                visitor.message = scenario.dialogue[0].text;
                visitor.messageTimer = 3.5;

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

      // --- 17. Agent Simulation Loop ---
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

          if (meetingSpeaker && meetingSpeaker.speaker.toLowerCase().includes(agent.label.toLowerCase())) {
            agent.message = meetingSpeaker.text.length > 50 ? meetingSpeaker.text.slice(0, 48) + "..." : meetingSpeaker.text;
            agent.messageTimer = 4.0;
          } else if (meetingSpeaker) {
            // STRICT RULE: When someone is speaking, everyone else must stay silent!
            agent.message = null;
            agent.messageTimer = 0;
          }
        } else if (!meetingActiveRef.current && agent.activity === "meeting") {
          agent.activity = "walking";
          agent.targetX = agent.deskX;
          agent.targetY = agent.deskY;
          agent.message = "Rapat selesai, eksekusi!";
          agent.messageTimer = 2.5;
        }

        // Selected Agent Priority - SILENCE ALL OTHER AGENTS!
        if (selectedAgent && !meetingActiveRef.current) {
          if (isSelected) {
            agent.activity = "working";
            agent.targetX = agent.deskX;
            agent.targetY = agent.deskY;
            agent.x += (agent.deskX - agent.x) * 0.12;
            agent.y += (agent.deskY - agent.y) * 0.12;
            if (!agent.message) {
              agent.message = "Standby bos";
            }
          } else {
            // Silence all other agents completely so only the queried person talks
            agent.message = null;
            agent.messageTimer = 0;
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

          // Periodic desk coffee sip (every ~16 seconds for 3.2s)
          if (!agent.sipTimer) agent.sipTimer = 0;
          if (agent.sipTimer > 0) {
            agent.sipTimer -= deltaTime;
          } else if (Math.random() < 0.0035 && !meetingActiveRef.current) {
            agent.sipTimer = 3.2; // Take coffee sip!
          }

          // Occasional individual break
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

        // Check if agent is currently drinking coffee or in discussion
        const isDrinking = agent.activity === "drinking" || (agent.sipTimer !== undefined && agent.sipTimer > 0);
        const isCollaborating = agent.activity === "collaborating_talk" || (meetingActiveRef.current && meetingSpeaker && meetingSpeaker.speaker.toLowerCase().includes(agent.label.toLowerCase()));

        // --- 18. Render Agent Sprite (Stardew Valley Style with Living Eyes & Gestures) ---
        let px = agent.x - 18; 
        let py = agent.y - 24; 

        // Dynamic head bobbing & expressive gestures
        if (isCollaborating) {
          py += Math.sin(timeSec * 7 + i) * 1.5; // Head nods & expressive gesture cadence
        } else if (isDrinking) {
          py -= (Math.sin(timeSec * 6) > 0 ? 1.5 : 0); // Head tilts back when taking sip
        }

        const _ = null;
        const H = agent.hair;
        const S = "#ffc8b4"; 
        const C = agent.color; 
        const P = "#1e293b"; 
        const B = "#3f2b1d"; 
        const E = "#0f172a"; 
        const EYE_SHINE = "#ffffff";
        const MUG = "#ffffff";
        const COF = "#78350f";

        // Living Eyes & Natural Blinking Calculation
        const blinkCycle = (timeSec * 1.8 + i * 1.3) % 4.2;
        const isBlinking = blinkCycle < 0.16;

        // Eye looking direction (toward conversation partner if collaborating)
        let eyeOffset = 0; // -1 = left, 0 = forward, +1 = right
        if (agent.activity === "collaborating_talk" && activeCollabRef.current) {
          const collab = activeCollabRef.current;
          const isVisitor = agent.id === collab.visitorId;
          const otherAgent = agentsRef.current.find(a => a.id === (isVisitor ? collab.targetId : collab.visitorId));
          if (otherAgent) {
            eyeOffset = otherAgent.x > agent.x ? 1 : -1;
          }
        }

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

        // 1. Living Eye States (Blinking, Looking Direction, Happy Eyes)
        if (isDrinking) {
          // Closed smiling crescent eyes ^ ^ while enjoying coffee
          charGrid[2][4] = "#854d0e"; charGrid[2][7] = "#854d0e";
          charGrid[3] = [_, H, S, "#854d0e", S, S, S, "#854d0e", S, S, H, _];
        } else if (isBlinking) {
          // Natural eyelid blink
          charGrid[3] = [_, H, S, S, "#854d0e", S, S, "#854d0e", S, S, H, _];
        } else if (eyeOffset === -1) {
          // Looking left with shiny pupil glint
          charGrid[3] = [_, H, S, E, EYE_SHINE, S, E, EYE_SHINE, S, S, H, _];
        } else if (eyeOffset === 1) {
          // Looking right with shiny pupil glint
          charGrid[3] = [_, H, S, S, EYE_SHINE, E, S, EYE_SHINE, E, S, H, _];
        } else {
          // Looking forward with bright pupil sparkle
          charGrid[3] = [_, H, S, S, E, EYE_SHINE, S, E, EYE_SHINE, S, H, _];
        }

        // 2. Animated Coffee Drinking Gestures (Arms lifted, mug to mouth)
        if (isDrinking) {
          // Mug lifted up in front of chest/mouth
          charGrid[4][4] = MUG; charGrid[4][5] = COF; charGrid[4][6] = COF; charGrid[4][7] = MUG;
          charGrid[5][4] = S; charGrid[5][5] = MUG; charGrid[5][6] = MUG; charGrid[5][7] = S;
          // Arms bent inward holding the cup
          charGrid[6] = [_, _, _, S, C, C, C, C, S, _, _, _];
          charGrid[7] = [_, _, S, S, C, C, C, C, S, S, _, _];
          charGrid[8] = [_, _, _, _, S, S, S, S, _, _, _, _];
        }

        // 3. Discussion Hand Gestures (Dynamic pointing & explaining)
        if (isCollaborating && !isDrinking) {
          const gesturePhase = Math.floor(timeSec * 2.8 + i) % 3;
          if (gesturePhase === 0) {
            // Left hand raised explaining with open palm
            charGrid[5][1] = S; charGrid[5][2] = S;
            charGrid[6][1] = S; charGrid[6][2] = S;
            charGrid[7] = [_, S, S, C, C, C, C, C, C, S, _, _];
          } else if (gesturePhase === 1) {
            // Right hand pointing & emphasizing
            charGrid[5][9] = S; charGrid[5][10] = S;
            charGrid[6][9] = S; charGrid[6][10] = S;
            charGrid[7] = [_, _, S, C, C, C, C, C, C, S, S, _];
          } else {
            // Both hands open gesturing enthusiastically
            charGrid[6][1] = S; charGrid[6][10] = S;
            charGrid[7] = [S, S, S, C, C, C, C, C, C, S, S, S];
          }
        }

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

        // Meeting Speaker Halo
        if (meetingActiveRef.current && meetingSpeaker && meetingSpeaker.speaker.toLowerCase().includes(agent.label.toLowerCase())) {
          ctx.beginPath();
          ctx.ellipse(agent.x, agent.y + 24, 22 + Math.sin(timeSec * 12) * 3, 8 + Math.sin(timeSec * 12) * 1.5, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        drawPixels(px, py, 3, charGrid);

        // Coffee Steam & Slurp Particles when Drinking
        if (isDrinking) {
          for (let s = 0; s < 2; s++) {
            const stY = py + 2 - ((timeSec * 16 + s * 8) % 18);
            const stX = agent.x + Math.sin(timeSec * 4 + s * 2) * 3;
            ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
            ctx.beginPath();
            ctx.arc(stX, stY, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          if (Math.sin(timeSec * 6) > 0.25) {
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 8px monospace";
            ctx.textAlign = "center";
            ctx.fillText("☕ *slurp*", agent.x + 20, py + 6);
          }
        }

        // Discussion Sparkle & Idea Accent when Collaborating
        if (isCollaborating && !isDrinking) {
          if (Math.sin(timeSec * 8 + i) > 0.4) {
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 8px monospace";
            ctx.textAlign = "center";
            ctx.fillText("💡", agent.x + (Math.sin(timeSec * 4) > 0 ? 20 : -20), py + 2);
          }
        }

        // Name & Status Badge
        ctx.font = "bold 9px monospace";
        const nameW = ctx.measureText(agent.label).width;
        const tagX = agent.x - nameW / 2 - 5;
        const tagY = py + 52;
        
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
        if (agent.activity === "working" || agent.activity === "collaborating_talk" || isDrinking) {
          ctx.font = "bold 7.5px monospace";
          const badgeText = isDrinking ? "☕ Coffee Break" : (agent.activity === "collaborating_talk" ? "💬 Collab" : agent.roleBadge);
          const badgeW = ctx.measureText(badgeText).width;
          const bX = agent.x - badgeW / 2 - 4;
          const bY = tagY + 16;

          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.beginPath();
          ctx.roundRect(bX, bY, badgeW + 8, 12, 3);
          ctx.fill();

          ctx.fillStyle = isDrinking ? "#fef08a" : (agent.activity === "collaborating_talk" ? "#38bdf8" : "#86efac");
          ctx.fillText(badgeText, agent.x, bY + 6);
        }

        // Agent Speech Bubble
        if (agent.message) {
          drawSpeechBubble(agent.x, py, agent.message);
        }
      });

      // --- 19. Interactive Canvas Control Buttons ---
      // 1. Coffee Break Button
      const cbX = 205; const cbY = 535; const cbW = 125; const cbH = 32;
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      ctx.roundRect(cbX, cbY, cbW, cbH, 8);
      ctx.fill();
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☕ Coffee Break", cbX + cbW/2, cbY + cbH/2);

      // 2. Call Meeting Button
      const btnX = 345; const btnY = 535; const btnW = 125; const btnH = 32;
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
      ctx.fillText(meetingActiveRef.current ? "🔴 End Meeting" : "📢 Call Meeting", btnX + btnW/2, btnY + btnH/2);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedAgent, meetingSpeaker, onOfficeEvent]);

  // Click handler: supports agents and cute interactive props
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // 1. Coffee Break Button click (205 to 330, 535 to 567)
    if (x >= 205 && x <= 330 && y >= 535 && y <= 567) {
      const coffeeQuotes = [
        "Espresso double shot biar fokus! ☕",
        "Americano panas pas buat rekap margin! ☕",
        "Caramel latte dingin pelepas penat chat CS ☕",
        "Kopi hitam tubruk teman ngoding Next.js 💻",
        "Cupping Bajawa Honey 87.5 poin! 🍯",
        "Es kopi susu buat ide konten viral TikTok! ✨",
        "Cold brew nitro penambah energi scale-up ads! 🚀",
        "Filter V60 buat meeting deal kafe B2B! ☕",
        "Fresh roasted langsung dari drum Probat! 🔥",
        "Kopi seduh botolan teman kurir kargo! 📦",
        "Kopi petik merah asli Takengon Gayo! 🌿"
      ];
      if (selectedAgent) {
        // If an agent is selected, ONLY the selected agent drinks and says coffee quote!
        const target = agentsRef.current.find(a => a.id === selectedAgent);
        if (target) {
          target.activity = "drinking";
          target.waitTimer = 5.5;
          target.sipTimer = 5.5;
          target.message = "Ngopi dulu sebentar ya bos! ☕";
          target.messageTimer = 4.5;
        }
      } else {
        agentsRef.current.forEach((a, idx) => {
          a.activity = "drinking";
          a.waitTimer = 5.5;
          a.sipTimer = 5.5;
          a.message = coffeeQuotes[idx % coffeeQuotes.length];
          a.messageTimer = 4.5;
        });
      }

      if (onOfficeEvent) {
        onOfficeEvent({
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          speaker: selectedAgent ? (selectedAgent.split(" ")[0] + " ☕") : "Ramu HQ ☕",
          message: selectedAgent ? "Rehat ngopi specialty sejenak." : "Coffee break serentak! Seluruh 11 agen menikmati seduhan kopi Nusantara bersama.",
          type: "system"
        });
      }
      return;
    }

    // 2. Meeting Button click (345 to 470, 535 to 567)
    if (x >= 345 && x <= 470 && y >= 535 && y <= 567) {
      meetingActiveRef.current = !meetingActiveRef.current;
      if (onMeetingStart) {
        onMeetingStart();
      }
      return;
    }

    // 3. Interactive Mochi the Cat click
    const cat = catRef.current;
    const catDist = Math.sqrt((x - cat.x) ** 2 + (y - cat.y) ** 2);
    if (catDist < 24) {
      const catQuotes = [
        "Ngeong! 🐾 *purrr* Mochi suka aroma Gayo Anaerobic!",
        "Meow! ❤️ Mengelus Mochi nambah hoki penjualan roastery!",
        "Zzz... 🐱 Jangan berisik ya, Mochi lagi tidur siang.",
        "Ngeong! ☕ Teman setia roaster Ramu sejak 2024!"
      ];
      cat.message = catQuotes[Math.floor(Math.random() * catQuotes.length)];
      cat.messageTimer = 3.5;
      cat.hearts.push(
        { x: cat.x - 6, y: cat.y - 12, life: 1.5 },
        { x: cat.x + 8, y: cat.y - 16, life: 1.8 }
      );
      if (onOfficeEvent) {
        onOfficeEvent({
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          speaker: "Mochi (Cat 🐱)",
          message: "Ngeong! *purrr* Mochi mendengkur senang dielus.",
          type: "system"
        });
      }
      return;
    }

    // 4. Interactive RamuBot the Roomba click
    const rb = roombaRef.current;
    const rbDist = Math.sqrt((x - rb.x) ** 2 + (y - rb.y) ** 2);
    if (rbDist < 24) {
      const rbQuotes = [
        "BEEP BOOP! 🤖 Menyedot 24 butir remah kopi... Lantai mengkilap! ✨",
        "BEEP! 🧹 Sensor debu 0%. Roastery higienis standar specialty!",
        "Vroom~ 🤖 Mau kopi juga gak bos? *puter-puter*"
      ];
      rb.message = rbQuotes[Math.floor(Math.random() * rbQuotes.length)];
      rb.messageTimer = 3.5;
      if (onOfficeEvent) {
        onOfficeEvent({
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          speaker: "RamuBot 🤖",
          message: "BEEP BOOP! Ruang kantor bersih 100%.",
          type: "system"
        });
      }
      return;
    }

    // 5. Interactive Piko the Mouse click
    const ms = mouseRef.current;
    const msDist = Math.sqrt((x - ms.x) ** 2 + (y - ms.y) ** 2);
    if (msDist < 20) {
      ms.message = "Cicit! 🐭 Kopi Flores Bajawa Honey ini aromanya paling manis!";
      ms.messageTimer = 3.5;
      return;
    }

    // 6. Interactive Roaster Machine click
    if (Math.abs(x - ROASTER_MACHINE.x) < 40 && Math.abs(y - ROASTER_MACHINE.y) < 40) {
      propBubblesRef.current.roaster = {
        message: "♨️ Drum Probat di 205°C! Batch #15 siap first crack!",
        timer: 3.5
      };
      return;
    }

    // 7. Interactive Espresso Bar click
    if (Math.abs(x - ESPRESSO_BAR.x) < 45 && Math.abs(y - ESPRESSO_BAR.y) < 30) {
      propBubblesRef.current.bar = {
        message: "☕ *Ssshh* Ekstraksi espresso 9 bar sempurna! Crema tebal keemasan.",
        timer: 3.5
      };
      return;
    }

    // 8. Interactive Pallet Jack click
    if (Math.abs(x - PALLET_JACK.x) < 35 && Math.abs(y - PALLET_JACK.y) < 25) {
      propBubblesRef.current.pallet = {
        message: "🚜 180kg biji sangrai siap dikirim ke mitra kafe Jabodetabek!",
        timer: 3.5
      };
      return;
    }

    // 9. Interactive Server Rack click
    if (Math.abs(x - SERVER_RACK.x) < 25 && Math.abs(y - SERVER_RACK.y) < 30) {
      propBubblesRef.current.server = {
        message: "🟢 Server Ramu Store online! Uptime 99.98%, load average 0.08.",
        timer: 3.5
      };
      return;
    }

    // 10. Agent selection with interactive coffee sip & living greeting
    let clickedAgent: AgentRole | null = null;
    agentsRef.current.forEach((agent) => {
      const dx = x - agent.x;
      const dy = y - agent.y;
      if (Math.sqrt(dx * dx + dy * dy) < 28) {
        clickedAgent = agent.id as AgentRole;
        // Trigger live coffee sip, happy eyes & greetings ONLY for this agent
        agent.sipTimer = 3.8;
        const agentGreetings = [
          "Halo bos! Mau ngopi atau ada task baru? ☕",
          "Standby bos! Sambil seruput kopi fresh. ☕",
          "Kopi Ramu emang paling nikmat nemenin kerja! ☕",
          "Siap laksanakan arahan! Ngopi dulu sebentar. ☕"
        ];
        agent.message = agentGreetings[Math.floor(Math.random() * agentGreetings.length)];
        agent.messageTimer = 3.5;
      } else {
        // Clear speech message on all other agents
        agent.message = null;
        agent.messageTimer = 0;
      }
    });

    onSelectAgent(clickedAgent);
  };

  // Hover detection for agents and interactive props
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Agent check
    let foundAgent: AgentData | null = null;
    agentsRef.current.forEach(agent => {
      const dx = x - agent.x;
      const dy = y - agent.y;
      if (Math.sqrt(dx * dx + dy * dy) < 28) {
        foundAgent = agent;
      }
    });
    setHoveredAgent(foundAgent);

    // Prop check
    if (!foundAgent) {
      const cat = catRef.current;
      if (Math.sqrt((x - cat.x) ** 2 + (y - cat.y) ** 2) < 24) {
        setHoveredProp({ name: "Mochi", role: "Maskot Kucing Kantor", desc: "Kucing belang penyemangat tim Ramu.", emoji: "🐱" });
        return;
      }
      const rb = roombaRef.current;
      if (Math.sqrt((x - rb.x) ** 2 + (y - rb.y) ** 2) < 24) {
        setHoveredProp({ name: "RamuBot", role: "Pembersih Otomatis", desc: "Robot vacuum penyedot debu & ampas kopi.", emoji: "🤖" });
        return;
      }
      if (Math.abs(x - ROASTER_MACHINE.x) < 40 && Math.abs(y - ROASTER_MACHINE.y) < 40) {
        setHoveredProp({ name: "Probat UG22", role: "Mesin Roasting 12kg", desc: "Drum pemanggang specialty kopi berstandar internasional.", emoji: "🔥" });
        return;
      }
      if (Math.abs(x - ESPRESSO_BAR.x) < 45 && Math.abs(y - ESPRESSO_BAR.y) < 30) {
        setHoveredProp({ name: "Ramu Specialty Bar", role: "Espresso & Brew Bar", desc: "Barista station untuk kalibrasi rasa & rehat kopi.", emoji: "☕" });
        return;
      }
      if (Math.abs(x - PALLET_JACK.x) < 35 && Math.abs(y - PALLET_JACK.y) < 25) {
        setHoveredProp({ name: "Hand Pallet Jack", role: "Alat Angkut Kargo", desc: "Memindahkan box kopi ke truk ekspedisi logistik.", emoji: "🚜" });
        return;
      }
      if (Math.abs(x - SERVER_RACK.x) < 25 && Math.abs(y - SERVER_RACK.y) < 30) {
        setHoveredProp({ name: "Edge Server Rack", role: "Infrastruktur Web Store", desc: "Server cloud untuk katalog e-commerce dan Midtrans.", emoji: "🖥️" });
        return;
      }
      if (Math.abs(x - mouseRef.current.x) < 20 && Math.abs(y - mouseRef.current.y) < 20) {
        setHoveredProp({ name: "Piko", role: "Teman Gudang", desc: "Tikus lucu yang hobi mengendus kopi Toraja.", emoji: "🐭" });
        return;
      }
      setHoveredProp(null);
    } else {
      setHoveredProp(null);
    }
  };

  if (contained) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#0d1322] flex items-center justify-center select-none">
        {/* Subtle scanline overlay for retro CRT monitor aesthetic */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/30 z-10"></div>

        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredAgent(null); setHoveredProp(null); }}
          className="cursor-pointer block image-rendering-pixelated w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Hover Agent Info Tooltip */}
        {hoveredAgent && (
          <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-2.5 rounded-lg text-xs font-mono text-white shadow-xl pointer-events-none z-20 flex items-center gap-2.5 animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
              {hoveredAgent.label[0]}
            </div>
            <div>
              <div className="font-bold text-xs text-indigo-300">{hoveredAgent.id}</div>
              <div className="text-[11px] text-slate-400">Tugas: <span className="text-emerald-400">{hoveredAgent.roleBadge}</span></div>
              <div className="text-[11px] text-slate-400">Status: <span className="text-amber-400 capitalize">{hoveredAgent.activity}</span></div>
            </div>
          </div>
        )}

        {/* Hover Prop Info Tooltip */}
        {hoveredProp && !hoveredAgent && (
          <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-md border border-indigo-500/40 p-2.5 rounded-lg text-xs font-mono text-white shadow-2xl pointer-events-none z-20 flex items-center gap-2.5 animate-in fade-in duration-150">
            <div className="text-xl p-1 bg-slate-800 rounded-lg border border-slate-700">
              {hoveredProp.emoji}
            </div>
            <div>
              <div className="font-bold text-xs text-indigo-300">{hoveredProp.name} <span className="text-[10px] text-slate-400 font-normal">({hoveredProp.role})</span></div>
              <div className="text-slate-300 text-[10px]">{hoveredProp.desc}</div>
              <div className="text-emerald-400 text-[9px] mt-0.5 font-semibold">💡 Klik objek ini untuk berinteraksi!</div>
            </div>
          </div>
        )}
      </div>
    );
  }

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
          onMouseLeave={() => { setHoveredAgent(null); setHoveredProp(null); }}
          className="cursor-pointer block image-rendering-pixelated max-w-full"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Hover Agent Info Tooltip */}
        {hoveredAgent && (
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg text-xs font-mono text-white shadow-xl pointer-events-none z-20 flex items-center gap-3 animate-in fade-in duration-150">
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

        {/* Hover Prop Info Tooltip */}
        {hoveredProp && !hoveredAgent && (
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-indigo-500/40 p-3 rounded-lg text-xs font-mono text-white shadow-2xl pointer-events-none z-20 flex items-center gap-3 animate-in fade-in duration-150">
            <div className="text-2xl p-1 bg-slate-800 rounded-lg border border-slate-700">
              {hoveredProp.emoji}
            </div>
            <div>
              <div className="font-bold text-sm text-indigo-300">{hoveredProp.name} <span className="text-[11px] text-slate-400 font-normal">({hoveredProp.role})</span></div>
              <div className="text-slate-300 text-[11px]">{hoveredProp.desc}</div>
              <div className="text-emerald-400 text-[10px] mt-0.5 font-semibold">💡 Klik objek ini untuk berinteraksi!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
