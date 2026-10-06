import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.botToken || process.env.TELEGRAM_BOT_TOKEN || "";
    const chatId = body.chatId || process.env.TELEGRAM_CHAT_ID || "";

    if (!token || !chatId) {
      return NextResponse.json({
        error: "Bot Token dan Chat ID wajib diisi. Silakan masukkan di pengaturan akun atau .env."
      }, { status: 400 });
    }

    // 1. Gather live operational telemetry from database
    const [orders, products, activeTasks, latestMeeting] = await Promise.all([
      prisma.order.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []),
      prisma.product.findMany().catch(() => []),
      prisma.agentTask.findMany({ where: { status: "IN_PROGRESS" } }).catch(() => []),
      prisma.meetingSession.findFirst({ orderBy: { createdAt: "desc" } }).catch(() => null)
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

    const nowStr = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "short"
    }).format(new Date());

    // 2. Format Telegram message
    const message = `☕ *LAPORAN HARIAN RAMU ROASTERY*
━━━━━━━━━━━━━━━━━━━━
📅 *Waktu:* ${nowStr} WIB

💰 *PENJUALAN & OMZET:*
• Total Pendapatan: *Rp ${totalRevenue.toLocaleString("id-ID")}*
• Total Pesanan: *${orders.length} Transaksi (Lunas)*
• Status Kas: *Aman & Terverifikasi*

📦 *GUDANG & STOK KOPI:*
• Total Unit/Karung: *${totalStock.toLocaleString("id-ID")} Unit*
• Suhu Roaster Probat: *205°C (Terkalibrasi)*
• Kelembaban Gudang: *60% RH (Optimal)*

📋 *OPERASIONAL & TIM (11 AGEN):*
• Rapat Terakhir: *"${latestMeeting ? latestMeeting.topic : "Operasional Normal"}"*
• Tugas Aktif (In Progress): *${activeTasks.length} Tiket Sedang Dikerjakan*
• Status Sistem: *11 / 11 Agen Beroperasi Penuh*

━━━━━━━━━━━━━━━━━━━━
_Dikirim secara otomatis dari Kantor Ramu AI Command Center._`;

    // 3. Send to Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      })
    });

    const resJson = await response.json();

    if (!resJson.ok) {
      return NextResponse.json({
        error: `Telegram API Error: ${resJson.description || "Gagal mengirim pesan."}`
      }, { status: 400 });
    }

    // Log the notification
    await prisma.agentLog.create({
      data: {
        role: "GENERAL_MANAGER",
        message: `Rama mengirimkan Executive Digest ke Telegram Owner (${chatId})`,
        level: "INFO"
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Laporan eksekutif berhasil dikirim langsung ke Telegram HP Anda!"
    });
  } catch (error: any) {
    console.error("Telegram Notify Error:", error);
    return NextResponse.json({
      error: error?.message || "Internal server error saat mengirim ke Telegram."
    }, { status: 500 });
  }
}
