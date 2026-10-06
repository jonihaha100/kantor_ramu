import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const isSet = apiKey && !apiKey.includes("ISI_DENGAN") && apiKey.length > 20;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const telegramChatId = process.env.TELEGRAM_CHAT_ID || "";
  const ownerPin = process.env.OWNER_PIN || "1234";

  return NextResponse.json({
    hasKey: Boolean(isSet),
    maskedKey: isSet ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : null,
    hasTelegram: Boolean(telegramToken && telegramChatId),
    telegramToken: telegramToken ? `${telegramToken.slice(0, 6)}...${telegramToken.slice(-4)}` : null,
    telegramChatId: telegramChatId || null,
    ownerPin: ownerPin
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, telegramBotToken, telegramChatId, ownerPin } = body;

    const envPath = path.join(process.cwd(), ".env");
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

    if (apiKey && typeof apiKey === "string") {
      const cleanKey = apiKey.trim();
      process.env.GEMINI_API_KEY = cleanKey;
      if (content.includes("GEMINI_API_KEY=")) {
        content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${cleanKey}"`);
      } else {
        content += `\nGEMINI_API_KEY="${cleanKey}"\n`;
      }
    }

    if (telegramBotToken !== undefined) {
      const cleanToken = telegramBotToken.trim();
      process.env.TELEGRAM_BOT_TOKEN = cleanToken;
      if (content.includes("TELEGRAM_BOT_TOKEN=")) {
        content = content.replace(/TELEGRAM_BOT_TOKEN=.*/g, `TELEGRAM_BOT_TOKEN="${cleanToken}"`);
      } else {
        content += `\nTELEGRAM_BOT_TOKEN="${cleanToken}"\n`;
      }
    }

    if (telegramChatId !== undefined) {
      const cleanChatId = telegramChatId.trim();
      process.env.TELEGRAM_CHAT_ID = cleanChatId;
      if (content.includes("TELEGRAM_CHAT_ID=")) {
        content = content.replace(/TELEGRAM_CHAT_ID=.*/g, `TELEGRAM_CHAT_ID="${cleanChatId}"`);
      } else {
        content += `\nTELEGRAM_CHAT_ID="${cleanChatId}"\n`;
      }
    }

    if (ownerPin !== undefined) {
      const cleanPin = ownerPin.trim();
      process.env.OWNER_PIN = cleanPin;
      if (content.includes("OWNER_PIN=")) {
        content = content.replace(/OWNER_PIN=.*/g, `OWNER_PIN="${cleanPin}"`);
      } else {
        content += `\nOWNER_PIN="${cleanPin}"\n`;
      }
    }

    if (fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, content, "utf-8");
    }

    return NextResponse.json({
      success: true,
      message: "Konfigurasi berhasil disimpan dan diperbarui!"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update config" }, { status: 500 });
  }
}
