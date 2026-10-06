import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const isSet = apiKey && !apiKey.includes("ISI_DENGAN") && apiKey.length > 20;
  return NextResponse.json({
    hasKey: Boolean(isSet),
    maskedKey: isSet ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : null
  });
}

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 400 });
    }

    const cleanKey = apiKey.trim();
    process.env.GEMINI_API_KEY = cleanKey;

    // Update .env file
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, "utf-8");
      if (content.includes("GEMINI_API_KEY=")) {
        content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${cleanKey}"`);
      } else {
        content += `\nGEMINI_API_KEY="${cleanKey}"\n`;
      }
      fs.writeFileSync(envPath, content, "utf-8");
    }

    return NextResponse.json({
      success: true,
      message: "API Key berhasil disimpan dan diaktifkan!",
      maskedKey: `${cleanKey.slice(0, 4)}...${cleanKey.slice(-4)}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update config" }, { status: 500 });
  }
}
