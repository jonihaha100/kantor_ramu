import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

// In-memory store for recent WhatsApp conversations to display on dashboard
export interface WhatsAppMessage {
  id: string;
  senderPhone: string;
  senderName: string;
  customerMessage: string;
  sariReply: string;
  timestamp: string;
  intent: "GRIND_SIZE" | "RECOMMENDATION" | "ORDER_STATUS" | "ROAST_DATE" | "GENERAL";
}

export const recentWhatsAppChats: WhatsAppMessage[] = [
  {
    id: "wa-init-1",
    senderPhone: "6281298765432",
    senderName: "Kak Dian (Home Brewer)",
    customerMessage: "Halo kak, rekomendasi kopi yang gak terlalu asam buat dibikin es kopi susu apa ya?",
    sariReply: "Halo Kak Dian! Salam kenal, saya Sari dari Ramu Roastery. ☕\n\nUntuk es kopi susu yang gurih, manis tebal, dan ramah di lambung, Sari sangat sarankan 'Ramu House Blend Espresso' (racikan 70% Gayo Arabica & 30% Dampit Robusta) atau varian Single Origin 'Flores Bajawa Honey'. Acidity-nya sangat lembut dengan tasting notes cokelat karamel manis yang klop banget dengan susu segar dingin.\n\nKakak seduhnya pakai alat apa di rumah? Moka Pot, French Press, atau mesin espresso rumahan agar Sari sesuaikan gilingannya?",
    timestamp: "2026-10-06T14:20:00Z",
    intent: "RECOMMENDATION"
  },
  {
    id: "wa-init-2",
    senderPhone: "6285712349876",
    senderName: "Budi Santoso",
    customerMessage: "Mau tanya ukuran gilingan untuk alat V60 dan French Press bedanya gimana ya?",
    sariReply: "Halo Mas Budi! Terima kasih sudah menghubungi Ramu Roastery. 😊\n\nPerbedaannya terletak pada waktu ekstraksi:\n1. V60 (Filter): Butuh gilingan Medium-Fine (seperti butiran pasir laut) agar air mengalir stabil dalam waktu seduh 2.5 - 3 menit.\n2. French Press (Immersion): Butuh gilingan Coarse / Kasar (seperti garam laut kasar) agar ampas kopi tidak lolos dari saringan jaring dan seduhan tetap bersih.\n\nSaat checkout di Ramu, Mas Budi tinggal pilih opsi 'Giling Medium' untuk V60 atau 'Giling Kasar' untuk French Press. Semuanya gratis tanpa biaya tambahan!",
    timestamp: "2026-10-06T15:45:00Z",
    intent: "GRIND_SIZE"
  }
];

// Helper to determine intent and generate Sari's intelligent barista answer
export function generateSariResponse(name: string, message: string): { reply: string; intent: WhatsAppMessage["intent"] } {
  const msg = message.toLowerCase();
  const callerName = name ? `Kak ${name}` : "Kakak";

  if (msg.includes("giling") || msg.includes("grind") || msg.includes("halus") || msg.includes("kasar") || msg.includes("ukuran")) {
    return {
      intent: "GRIND_SIZE",
      reply: `Halo ${callerName}! Salam hangat dari Sari, Customer Service Ramu Roastery. ☕\n\nUntuk panduan ukuran gilingan (Grind Size) di Ramu Roastery:\n• Halus (Fine): Sangat cocok untuk Mesin Espresso komersial/rumahan, Moka Pot, dan Kopi Tubruk.\n• Sedang (Medium / Medium-Fine): Pilihan terbaik untuk V60, Kalita Wave, Aeropress, dan Clever Dripper.\n• Kasar (Coarse): Khusus untuk French Press dan seduhan Cold Brew dingin agar seduhan jernih tanpa ampas.\n\nKakak tinggal beri catatan saat pesan kopi kami, tim roastery mas Doni akan menggilingnya dengan grinder profesional EK43 sebelum dikemas valve hermetis!`
    };
  }

  if (msg.includes("asam") || msg.includes("susu") || msg.includes("rekomendasi") || msg.includes("paling enak") || msg.includes("menu") || msg.includes("blend")) {
    return {
      intent: "RECOMMENDATION",
      reply: `Halo ${callerName}! Terima kasih sudah mampir ke Ramu Roastery. ✨\n\nIni 2 rekomendasi terbaik dari Sari:\n1. Mau Kopi Susu Mantap & Gak Asam: Pilih 'Ramu House Blend Espresso' (Crema tebal, dark chocolate & brown sugar caramel). Dijamin balance pas kena susu/oatmilk!\n2. Mau Manual Brew Filter Harum & Fruity: Coba 'Aceh Gayo Anaerobic Natural' (Skor SCA 87.5 poin! Ada aroma peach manis, melati segar, dan madu liar).\n\nKira-kira ${callerName} lebih suka tipe seduhan hitam segar atau kopi susu manis gurih? Biar Sari bantu pilihkan yang paling cocok!`
    };
  }

  if (msg.includes("roast") || msg.includes("sangrai") || msg.includes("kapan") || msg.includes("fresh") || msg.includes("tanggal")) {
    return {
      intent: "ROAST_DATE",
      reply: `Halo ${callerName}! 🌿\n\nSeluruh biji kopi di Ramu Roastery memiliki Garansi Fresh Roast! Kami menyangrai kopi rutin 2-3 kali seminggu menggunakan mesin Probat UG22. Biji kopi yang dikirim ke pelanggan berumur maksimal 3 sampai 7 hari pasca sangrai (fase resting degassing ideal untuk aroma puncak).\n\nTanggal sangrai selalu kami cantumkan jelas di segel kemasan bagian belakang!`
    };
  }

  if (msg.includes("status") || msg.includes("resi") || msg.includes("paket") || msg.includes("kirim") || msg.includes("ongkir") || msg.includes("lacak")) {
    return {
      intent: "ORDER_STATUS",
      reply: `Halo ${callerName}! 📦\n\nUntuk pengiriman ritel pesanan sebelum jam 15:00 WIB, paket langsung di-dispatch di hari yang sama (Same-Day Dispatch) via kurir logistik mas Gilang (J&T Cargo & Paxel).\n\nBoleh sebutkan nomor pesanan atau nama lengkap ${callerName}? Sari bantu lacak langsung di sistem pergudangan sekarang.`
    };
  }

  // General friendly barista answer
  return {
    intent: "GENERAL",
    reply: `Halo ${callerName}! Terima kasih sudah menghubungi WhatsApp Ramu Roastery. Saya Sari, siap membantu kebutuhan kopi berkualitas Nusantara untuk kakak. ☕\n\nAda yang bisa Sari bantu seputar pilihan biji kopi specialty, rekomendasi seduh, konsultasi ukuran gilingan, atau pesanan grosir B2B untuk kafe kakak?`
  };
}

// 1. GET: Webhook Verification for Meta / Fonnte / Wablas
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  // Meta Cloud API Verification
  if (mode === "subscribe" && token) {
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "ramu_roastery_wa_secret";
    if (token === expectedToken) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // General Ping / Health check
  return NextResponse.json({
    status: "active",
    gateway: "Ramu Roastery WhatsApp Webhook Gateway",
    agent: "Sari (Customer Service Lead)",
    supportedProviders: ["Fonnte", "Wablas", "Meta Cloud API", "WAHA", "Whapi"],
    verificationUrl: url.toString()
  });
}

// 2. POST: Handle Incoming Customer Messages
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Normalize payload across popular WhatsApp providers:
    // • Fonnte: { sender: "628...", name: "...", message: "..." }
    // • Wablas: { phone: "628...", pushName: "...", message: "..." }
    // • Meta Cloud API: { entry: [ { changes: [ { value: { messages: [...] } } ] } ] }
    // • Custom/WAHA: { from: "...", body: "...", pushName: "..." }

    let senderPhone = body.sender || body.phone || body.from || "";
    let senderName = body.name || body.pushName || body.senderName || "";
    let messageText = body.message || body.body || body.text || "";

    // Meta Cloud API format extraction
    if (!messageText && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const msgObj = body.entry[0].changes[0].value.messages[0];
      const contactObj = body.entry[0].changes[0].value.contacts?.[0];
      senderPhone = msgObj.from || "";
      senderName = contactObj?.profile?.name || "";
      messageText = msgObj.text?.body || "";
    }

    // Default fallback if payload is a raw test
    if (!messageText && body.testMessage) {
      messageText = body.testMessage;
      senderName = body.testName || "Pelanggan Ramu";
      senderPhone = body.testPhone || "6281200001111";
    }

    if (!messageText) {
      return NextResponse.json({
        error: "Message text not found in payload"
      }, { status: 400 });
    }

    // Generate Sari's Response
    let replyText = "";
    let intent: WhatsAppMessage["intent"] = "GENERAL";

    // Attempt Gemini dynamic generation if key exists
    const apiKey = process.env.GEMINI_API_KEY || "";
    const hasValidKey = apiKey && !apiKey.includes("ISI_DENGAN") && apiKey.length > 20;

    if (hasValidKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-3.5-flash-lite",
          systemInstruction: `Kamu adalah Sari, Customer Service Lead Ramu Roastery (Specialty Coffee Roastery Nusantara).
Gaya bicaramu sangat ramah, hangat, sopan, menguasai ilmu seduh kopi, ukuran gilingan (fine, medium, coarse), dan profil rasa beans Nusantara (Gayo, Flores, Dampit, House Blend).
Gunakan sapaan "Kak [Nama]" atau "Kakak". Berikan solusi seduh yang solutif dan tawarkan panduan gilingan yang tepat. Jangan terlalu kaku, gunakan sedikit emoji kopi yang manis.`
        });
        const prompt = `Pesan masuk dari pelanggan WhatsApp (${senderName || "Pelanggan"}, No: ${senderPhone || "WA"}):
"${messageText}"

Jawab pesan ini sebagai Sari CS Ramu Roastery:`;
        const res = await model.generateContent(prompt);
        replyText = res.response.text();
        intent = "RECOMMENDATION";
      } catch {
        const fallback = generateSariResponse(senderName, messageText);
        replyText = fallback.reply;
        intent = fallback.intent;
      }
    } else {
      const fallback = generateSariResponse(senderName, messageText);
      replyText = fallback.reply;
      intent = fallback.intent;
    }

    // Create Chat Record
    const newChat: WhatsAppMessage = {
      id: `wa-${Date.now()}`,
      senderPhone: senderPhone || "62812XXXXXX",
      senderName: senderName || "Pelanggan Ramu",
      customerMessage: messageText,
      sariReply: replyText,
      timestamp: new Date().toISOString(),
      intent
    };

    recentWhatsAppChats.unshift(newChat);
    if (recentWhatsAppChats.length > 50) recentWhatsAppChats.pop();

    // Log to Database AgentLog
    await prisma.agentLog.create({
      data: {
        role: "CUSTOMER_SERVICE",
        message: `[WHATSAPP LIVE] Sari membalas pesan dari ${senderName} (${senderPhone}): "${messageText.substring(0, 60)}..."`,
        level: "INFO"
      }
    }).catch(() => {});

    // If Fonnte / Wablas API Token is present in environment, trigger physical reply
    const fonnteToken = process.env.FONNTE_TOKEN;
    if (fonnteToken && senderPhone) {
      try {
        await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            Authorization: fonnteToken,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            target: senderPhone,
            message: replyText
          })
        });
      } catch (err) {
        console.warn("Fonnte outbound send failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp incoming message processed successfully by Sari",
      data: newChat
    });

  } catch (error: any) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to process WhatsApp webhook"
    }, { status: 500 });
  }
}
