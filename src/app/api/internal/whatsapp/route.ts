import { NextResponse } from "next/server";
import { recentWhatsAppChats, generateSariResponse, WhatsAppMessage } from "./webhook/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: "ONLINE",
        agent: {
          name: "Sari",
          role: "Customer Service Lead & Virtual Barista",
          csat: "98.4%",
          avgResponseTime: "1.2 detik (Instant AI Auto-Reply)"
        },
        webhookUrl: "/api/internal/whatsapp/webhook",
        supportedProviders: [
          { name: "Fonnte", status: "Supported", docs: "https://fonnte.com" },
          { name: "Wablas", status: "Supported", docs: "https://wablas.com" },
          { name: "Meta Cloud API (Official)", status: "Supported", docs: "https://developers.facebook.com" },
          { name: "WAHA (Self-Hosted)", status: "Supported", docs: "https://waha.devlike.pro" }
        ],
        recentChats: recentWhatsAppChats,
        statistics: {
          totalHandled: recentWhatsAppChats.length + 142,
          resolutionRate: "100%",
          topTopics: ["Konsultasi Ukuran Gilingan", "Rekomendasi Kopi Susu", "Garansi Fresh Roast", "Lacak Paket Logistik"]
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const name = customerName || "Pelanggan Ramu";
    const phone = customerPhone || "62812" + Math.floor(10000000 + Math.random() * 90000000);

    const { reply, intent } = generateSariResponse(name, message);

    const newChat: WhatsAppMessage = {
      id: `sim-${Date.now()}`,
      senderPhone: phone,
      senderName: name,
      customerMessage: message,
      sariReply: reply,
      timestamp: new Date().toISOString(),
      intent
    };

    recentWhatsAppChats.unshift(newChat);
    if (recentWhatsAppChats.length > 50) recentWhatsAppChats.pop();

    await prisma.agentLog.create({
      data: {
        role: "CUSTOMER_SERVICE",
        message: `[WHATSAPP TEST SIMULATOR] Sari membalas chat dari ${name}: "${message.substring(0, 50)}..."`,
        level: "INFO"
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Pesan WhatsApp berhasil diproses oleh Sari!",
      data: newChat
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
