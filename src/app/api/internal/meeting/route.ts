import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const apiKey = process.env.GEMINI_API_KEY || "";
const hasValidGeminiKey = apiKey && !apiKey.includes("ISI_DENGAN") && apiKey.length > 20;
const genAI = hasValidGeminiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to calculate Indonesian greeting and formatted time based on client or WIB
function getTimeContext(clientTime?: string, timezone?: string) {
  const targetTz = timezone || "Asia/Jakarta";
  const date = clientTime ? new Date(clientTime) : new Date();

  let hour = 12;
  try {
    const hourStr = new Intl.DateTimeFormat("id-ID", {
      timeZone: targetTz,
      hour: "numeric",
      hour12: false
    }).format(date);
    hour = parseInt(hourStr, 10);
  } catch {
    hour = (date.getUTCHours() + 7) % 24; // WIB UTC+7 fallback
  }

  let greeting = "Selamat siang";
  if (hour >= 4 && hour < 11) {
    greeting = "Selamat pagi";
  } else if (hour >= 11 && hour < 15) {
    greeting = "Selamat siang";
  } else if (hour >= 15 && hour < 18) {
    greeting = "Selamat sore";
  } else {
    greeting = "Selamat malam";
  }

  let formattedDate = "";
  try {
    formattedDate = new Intl.DateTimeFormat("id-ID", {
      timeZone: targetTz,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch {
    formattedDate = date.toISOString();
  }

  return { greeting, hour, formattedDate, targetTz };
}

interface AgentProfile {
  name: string;
  fullName: string;
  role: string;
  keywords: string[];
  generateAnswer: (topic: string, greeting: string) => string;
}

const AGENTS_LIST: AgentProfile[] = [
  {
    name: "Mang Encep",
    fullName: "Mang Encep (Sourcing)",
    role: "Green Bean Sourcing & Farmer Relations",
    keywords: ["mang encep", "encep", "budi", "sourcing", "petani", "kebun", "green bean", "green beans", "gabah", "gayo", "takengon", "pangalengan", "bajawa", "panen", "beli biji", "harga biji", "tani", "koperasi"],
    generateAnswer: (topic, greeting) => {
      const t = topic.toLowerCase();
      if (t.includes("harga") || t.includes("nego") || t.includes("tawar") || t.includes("biaya") || t.includes("per kilo") || t.includes("sabaraha")) {
        return `Sampurasun juragan bos! Ngeunaan pangaos green beans Gayo Grade 1, koperasi patani Takengon muka harga Rp 92.000/kg. Aranjeunna kersa dikonci di Rp 86.000/kg pami urang candak minimal 1.5 ton sareng DP 30%. Typica Pangalengan skor 88+ di Rp 105.000/kg. Pasokan urang aman santosa, margin roastery kajaga!`;
      }
      if (t.includes("sampel") || t.includes("sample") || t.includes("uji") || t.includes("coba")) {
        return `Sampurasun juragan bos! Sampel fisik 2kg biji kopi Gayo Anaerobic & Typica Pangalengan parantos dikintun ka lab Kang Tatang kanggo diuji sensorik. Enjing enjing datana parantos siap urang review sasarengan.`;
      }
      if (t.includes("kapan") || t.includes("jadwal") || t.includes("panen") || t.includes("iraha")) {
        return `Sampurasun juragan bos! Di Takengon nuju lebet panen kadua kalayan kualitas petik beureum optimal pisan margi panas panonpoe sae. Flores Bajawa panen sasih Juli-Agustus.`;
      }
      return `Sampurasun juragan bos! Gotong royong direct-trade sareng kelompok tani kopi di Gayo sareng Pangalengan sae pisan. Pasokan green beans di gudang aman dugi 3 sasih ka payun tanpa resiko putus stok.`;
    }
  },
  {
    name: "Kang Tatang",
    fullName: "Kang Tatang (R&D)",
    role: "R&D & Sensory Cupping Lead",
    keywords: ["kang tatang", "tatang", "kafin", "r&d", "rnd", "cupping", "rasa", "skor", "score", "notes", "acidity", "body", "roasting profile", "sangrai", "profil", "dtr", "ror", "v60", "espresso", "formula", "resep"],
    generateAnswer: (topic, greeting) => {
      const t = topic.toLowerCase();
      if (t.includes("skor") || t.includes("score") || t.includes("batch") || t.includes("rasa") || t.includes("cupping")) {
        return `${greeting} juragan bos! Hasil cupping sensorik Batch #14 Gayo Anaerobic kamari kenging skor 87.5 poin (Specialty Grade). Catetan rasa dominan buah peach, gula kawung, sareng melati nu beresih pisan. Profil RoR dikonci dina DTR 14.2% supados crema dina mesin espresso kandel tur kaasamanana saimbang!`;
      }
      if (t.includes("sample") || t.includes("sampel") || t.includes("uji")) {
        return `${greeting} juragan bos! Sampel green beans anyar ti Mang Encep parantos lebet tahap sample roasting dina mesin IKAWA. Parameter kadar cai 11.2% ideal pisan. Enjing urang cupping di meja Cupping Table nya bos!`;
      }
      return `${greeting} juragan bos! Sadaya batch specialty coffee Ramu lolos standar quality control sensorik. Kalibrasi rasa kanggo espresso bar atanapi filter V60 konsisten dina skor 86+ poin!`;
    }
  },
  {
    name: "Mang Dadang",
    fullName: "Mang Dadang (Inventory)",
    role: "Warehouse & Roastery Lead",
    keywords: ["mang dadang", "dadang", "doni", "gudang", "inventory", "stok", "warehouse", "probat", "mesin sangrai", "mesin roasting", "suhu", "packing", "kemasan", "karung", "stok kopi"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} juragan bos! Laporan gudang operasional: Hawa drum mesin Probat UG22 stabil dina 205°C, hawa gudang seger 60% RH. Stok green beans dina palet aman 1.3 ton, sareng stok bungkusan 200g Ramu Blend siap 120 pack dina rak. Siap nyangrai batch salajengna!`;
    }
  },
  {
    name: "Ujang",
    fullName: "Ujang (Web Dev)",
    role: "Full-Stack Web Dev & Infrastructure",
    keywords: ["ujang", "rian", "web", "website", "dev", "server", "store", "midtrans", "qris", "checkout", "bug", "it", "nextjs", "online", "loading"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} juragan bos kasep! Status téknologi wéb store Ramu: Server edge Next.js 15 jalan lemes kalayan latency 9ms sareng uptime 99.98%. Transaksi otomatis QRIS Midtrans lancar pisan tanpa kendala. Siap nampung pesenan balarea!`;
    }
  },
  {
    name: "Ceu Edah",
    fullName: "Ceu Edah (Finance)",
    role: "Financial & Revenue Lead",
    keywords: ["ceu edah", "edah", "fina", "finance", "keuangan", "omzet", "pendapatan", "kas", "cashflow", "uang", "laba", "rugi", "margin", "invoice", "tagihan", "piutang", "budget", "duit"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} juragan bos! Rekapitulasi artos sareng omzet roastery dinten ieu tembus Rp 14.225.000 tina gabungan pesenan wéb store sareng invoice kafe B2B. Margin kauntungan 42%, piutang B2B aman, sareng kas roastery pohara sehatna! Mana atuh bon kuitansina ulah leungit nya bos!`;
    }
  },
  {
    name: "Teh Euis",
    fullName: "Teh Euis (CS)",
    role: "Customer Service & Experience Lead",
    keywords: ["teh euis", "euis", "sari", "cs", "customer service", "pelanggan", "pembeli", "komplain", "chat", "wa", "whatsapp", "tanya", "grind size", "gilingan", "tiket", "closing", "jam", "24 jam", "tutup"],
    generateAnswer: (topic, greeting) => {
      const t = topic.toLowerCase();
      if (t.includes("closing") || t.includes("jam") || t.includes("tutup") || t.includes("24") || t.includes("aktif")) {
        return `Muhun mangga juragan bos! Layanan WhatsApp CS Ramu Roastery beroperasi 24 Jam Non-Stop tanpa jam closing! Bade enjing, siang, atanapi tengah wengi, Teh Euis salawasna standby ngabales chat palanggan dina hitungan detik!`;
      }
      return `Muhun mangga juragan bos! Waktos balesan rata-rata CSAT urang 98.4%. Patarosan pangseueurna ngeunaan ukuran gilingan tubruk sareng rekomendasi beans. Layanan chat urang salawasna aktip tanpa reureuh!`;
    }
  },
  {
    name: "Kang Aceng",
    fullName: "Kang Aceng (Logistics)",
    role: "Logistics & Dispatch Lead",
    keywords: ["kang aceng", "aceng", "gilang", "logistik", "kurir", "ekspedisi", "kargo", "resi", "kirim", "pengiriman", "j&t", "paxel", "jne", "paket", "pickup"],
    generateAnswer: (topic, greeting) => {
      return `Siap gaspol juragan bos! Sadaya paket dinten ieu tos dipaking rapih tur dipickup ku kurir kargo J&T sareng Paxel pas tabuh 15:30 sonten. Nomer resi otomatis kaluar tur diblast kana WA pemesan. Bandung-Jakarta sapoe nepi!`;
    }
  },
  {
    name: "Kang Jajang",
    fullName: "Kang Jajang (B2B)",
    role: "B2B Sales & Commercial Lead",
    keywords: ["kang jajang", "jajang", "bayu", "b2b", "sales", "kafe", "kedai", "kemitraan", "franchise", "horeca", "grosir", "kontrak", "klien"],
    generateAnswer: (topic, greeting) => {
      return `Kabar gumbira ti palanggan kafe bos! Kafe Sudut Temu resmi tanda tangan kontrak suplai 20kg per minggu. Aya oge 2 franchise kafe di Jakarta Selatan minat kontrak 100kg/sasih. Draf kontrak siap diajukeun ka juragan bos!`;
    }
  },
  {
    name: "Kang Deden",
    fullName: "Kang Deden (Ads)",
    role: "Performance Marketing & Ads",
    keywords: ["kang deden", "deden", "arya", "ads", "iklan", "meta ads", "facebook ads", "instagram ads", "roas", "cpc", "budget iklan", "campaign", "marketing"],
    generateAnswer: (topic, greeting) => {
      return `Gurih nyooy juragan bos! Kampanye Meta Ads urang ngahasilkeun ROAS 3.8x dinten ieu kalayan CTR 2.4%. Alokasi budget optimal pisan nyasar penikmat specialty coffee Nusantara. Moal aya nu boncos!`;
    }
  },
  {
    name: "Neng Iteung",
    fullName: "Neng Iteung (Content)",
    role: "Content Creator & Storyteller",
    keywords: ["neng iteung", "iteung", "maya", "konten", "content", "tiktok", "reels", "video", "sosmed", "instagram", "ig", "visual", "edukasi kopi", "branding"],
    generateAnswer: (topic, greeting) => {
      return `Aduh juragan bos kasep! Video Reels & TikTok 'Sensasi Kopi Susu Nikmat Teu Matak Kembung' parantos beres diedit nganggo visual slow-mo estetik pisan. Siap ngadatangkeun jutaan views ka wéb store urang!`;
    }
  },
  {
    name: "Kang Dudung",
    fullName: "Kang Dudung (GM)",
    role: "General Manager & Operations Lead",
    keywords: ["kang dudung", "dudung", "rama", "gm", "general manager", "manajer", "arahan", "kpi", "evaluasi", "strategi", "koordinasi"],
    generateAnswer: (topic, greeting) => {
      return `Sampurasun juragan bos! Sadaya 11 divisi roastery jalan lemes tur tartib sapertos biasa. Sinergi antara kebon patani, lab sangrai, tim wéb dugi logistik kurir satset pisan. Abdi siap ngawal instruksi prioritas salajengna ti bos!`;
    }
  }
];

function detectTargetAgent(topic: string, explicitRecipient?: string): AgentProfile | null {
  if (explicitRecipient && explicitRecipient !== "ALL" && explicitRecipient !== "SEMUA") {
    const found = AGENTS_LIST.find(a => 
      a.fullName.toLowerCase().includes(explicitRecipient.toLowerCase()) ||
      a.name.toLowerCase() === explicitRecipient.toLowerCase()
    );
    if (found) return found;
  }

  const t = topic.toLowerCase();

  // 1. Direct name match in topic text (e.g. "Budi, berapa harga?" or "Tanya Kafin")
  for (const agent of AGENTS_LIST) {
    const nameRegex = new RegExp(`\\b${agent.name.toLowerCase()}\\b`, "i");
    if (nameRegex.test(t)) {
      return agent;
    }
  }

  // 2. Keyword domain matching (only if topic is not an explicit whole-team plenary)
  const isPlenaryMeeting = t.includes("rapat pleno") || t.includes("seluruh tim") || t.includes("semua divisi") || t.includes("kumpul semua") || t.includes("evaluasi bersama");
  if (!isPlenaryMeeting) {
    for (const agent of AGENTS_LIST) {
      for (const kw of agent.keywords) {
        if (kw !== agent.name.toLowerCase() && t.includes(kw)) {
          return agent;
        }
      }
    }
  }

  return null;
}

// Helper to generate dynamic, tailored multi-agent debate based on topic & real-time greeting
function generateTailoredMeetingDiscussion(topic: string, greeting: string = "Selamat siang", explicitRecipient?: string) {
  // RULE: If a specific person is asked or targeted, ONLY THAT PERSON RESPONDS!
  const targetAgent = detectTargetAgent(topic, explicitRecipient);
  if (targetAgent) {
    return [
      {
        speaker: targetAgent.fullName,
        text: targetAgent.generateAnswer(topic, greeting)
      }
    ];
  }

  const t = topic.toLowerCase();

  if (t.includes("marketing") || t.includes("iklan") || t.includes("konten") || t.includes("sosmed") || t.includes("promo") || t.includes("reels")) {
    return [
      { speaker: "Kang Dudung (GM)", text: `${greeting} barudak Ramu Roastery sadayana. Rapat dikawitan. Bahasan urang ayeuna: "${topic}". Kumaha evaluasi strategi promosi sareng alokasi budget iklan urang?` },
      { speaker: "Kang Deden (Ads)", text: "Data kampanye Meta Ads urang kamari kenging ROAS 3.8x gurih. Mung biaya klik mimiti naek. Urang peryogi konten kreatif anyar nu leuwih seger sangkan audiens teu bosenan." },
      { speaker: "Neng Iteung (Content)", text: "Iteung parantos ngarancang video TikTok & Reels 'Sensasi Kopi Susu Nikmat Teu Matak Kembung'. Visual slow-mo pour over sareng audio trending dijamin boost organic reach urang!" },
      { speaker: "Teh Euis (CS)", text: "Pami kontenna tayang sabtu-minggu, wartosan Euis nya Neng. Biasana chat WhatsApp ratusan lebet sakaligus, tim CS kedah standby kuota promo juragan." },
      { speaker: "Ceu Edah (Finance)", text: "Ti sisi cashflow, Ceu Edah satuju alokasi tambahan budget marketing Rp 3.500.000 asal target ROAS kajaga di luhur 3.2x. Duitna ulah dihambur-hambur nya Deden!" },
      { speaker: "Mang Dadang (Inventory)", text: "Stok bungkusan 200g Ramu Blend siap 120 pack dina rak display. Tinggal gas eksekusi!" },
      { speaker: "Kang Dudung (GM)", text: "Alus pisan sadayana. Neng Iteung geura gas produksi video, Kang Deden setel iklanna, sareng Ceu Edah cairkeun danana. Rapat ditutup!" }
    ];
  }

  if (t.includes("roast") || t.includes("kualitas") || t.includes("rasa") || t.includes("cupping") || t.includes("beans") || t.includes("biji") || t.includes("tren") || t.includes("produksi") || t.includes("penjualan") || t.includes("stok")) {
    return [
      { speaker: "Kang Dudung (GM)", text: `${greeting} barudak Ramu Roastery. Langsung kana intina, data penjualan minggu ieu aya pergerakan sae di kopi Nusantara urang. Urang kedah mutuskeun biji mana nu kedah di-up produksina. Kang Tatang, kumaha ti R&D sareng sangrai?` },
      { speaker: "Kang Tatang (R&D)", text: "Hatur nuhun Kang Dudung. Batch #14 Gayo Anaerobic skor na 87.5 poin, tapi profil RoR dina menit ka-8 seukeut teuing. Saena airflow dikirangan supados amis karamelna langkung kaluar." },
      { speaker: "Mang Dadang (Inventory)", text: "Hawa drum roaster Probat stabil di 205°C. Mung kadar cai green beans ti karung anyar rada luhur di 11.8%, janten peryogi drying 45 detik langkung lami." },
      { speaker: "Mang Encep (Sourcing)", text: "Leres Mang Dadang, panen kamari di Takengon sering kahujanan sonten. Nanging prosesor di ditu ngajamin fermentasina beresih teu apek." },
      { speaker: "Kang Jajang (B2B)", text: "Klien kafe urang seueur nu nyuhunkeun profil medium-roast nu aman keur mesin espresso. Kade ulah haseum teuing nya Kang Tatang." },
      { speaker: "Kang Tatang (R&D)", text: "Tenang Kang Jajang, urang konci DTR di 14.2% supados crema kandel tur kaasaman tetep saimbang." },
      { speaker: "Kang Dudung (GM)", text: "Kasapukan kahontal: Tatang atur profil sangrai enjing, Dadang catet log di bor, sareng Encep pantau pasokan kebon. Hatur nuhun sadayana!" }
    ];
  }

  if (t.includes("kirim") || t.includes("ekspedisi") || t.includes("kurir") || t.includes("logistik") || t.includes("pengiriman") || t.includes("resi")) {
    return [
      { speaker: "Kang Dudung (GM)", text: `${greeting} rekan-rekan tim. Agenda rapat mendesak: "${topic}". Kang Aceng sareng Teh Euis, mangga paparkeun evaluasi kiriman barang urang.` },
      { speaker: "Kang Aceng (Logistics)", text: "Sababaraha dinten ieu kargo darat J&T rada padet payuneun akhir sasih. Aya telat 1 dinten keur Jawa Wetan, mung Bandung-Jakarta tetep sapoe nepi aman santosa!" },
      { speaker: "Teh Euis (CS)", text: "Leres Kang, aya 4 palanggan kafe nu naroskeun resi margi stok kopi bar maranehna tosIPis. Peryogi update resi langkung enggal jam 2 siang." },
      { speaker: "Kang Aceng (Logistics)", text: "Solusina urang tiasa aktipkeun Paxel Big & JNE Trucking keur pesenan di luhur 10kg. Pickup jam 13:00 siang tetep satset!" },
      { speaker: "Ceu Edah (Finance)", text: "Selisih ongkos kirim Paxel mung Rp 2.000 per kg, tiasa urang cover tina margin B2B demi kasugeman palanggan." },
      { speaker: "Kang Dudung (GM)", text: "Satuju pisan. Aceng terapkeun Paxel keur prioritas, Euis pasihan notifikasi ka pembeli. Eksekusi ayeuna!" }
    ];
  }

  if (t.includes("b2b") || t.includes("kafe") || t.includes("partnership") || t.includes("sales") || t.includes("klien")) {
    return [
      { speaker: "Kang Dudung (GM)", text: `${greeting} barudak sadayana. Rapat kemitraan B2B dikawitan. Topik urang: "${topic}". Kang Jajang, kumaha status suplai kopi kafe-kafe anyar?` },
      { speaker: "Kang Jajang (B2B)", text: "Kabar sae Kang Dudung! Kafe Sudut Temu resmi teken PO 20kg per minggu. Salian ti eta aya 2 franchise kafe di Jaksel resep pisan kana sampel urang." },
      { speaker: "Ceu Edah (Finance)", text: "Pastikeun TOP mayarna maksimal 14 dinten kerja nya Jajang! Ulah dugi piutang macet ngaganggu kas balanja biji kopi Mang Encep." },
      { speaker: "Mang Dadang (Inventory)", text: "Kapasitas sangrai urang masih tiasa nambih 250kg per minggu. Mesin siap, green beans di gudang melimpah 1.3 ton." },
      { speaker: "Kang Tatang (R&D)", text: "Kanggo kafe anyar, Tatang kirimkeun Sample Kit 3 varietas supados barista maranehna tiasa kalibrasi gilingan mesin espressona." },
      { speaker: "Kang Dudung (GM)", text: "Sampurna! Jajang béréskeun kontrakna sareng klausul Ceu Edah, Tatang siapkeun sampelna. Ieu prioritas luhur urang!" }
    ];
  }

  // General Operational Discussion (Plenary)
  return [
    { speaker: "Kang Dudung (GM)", text: `${greeting} barudak Ramu Roastery sadayana. Rapat koordinasi roastery dibuka. Topik urang dinten ieu: "${topic}". Mangga review ti masing-masing divisi.` },
    { speaker: "Teh Euis (CS)", text: "Ti sisi palanggan, respon sae pisan. Pamenta repeat order produk filter coffee naek 25%." },
    { speaker: "Ujang (Web Dev)", text: "Infrastruktur wéb store stabil pisan, loading 0.8 detik. Integrasi QRIS Midtrans jalan lemes tanpa kendala." },
    { speaker: "Ceu Edah (Finance)", text: "Omzet harian tembus Rp 14.225.000 kalayan margin kandel 42%. Arus kas aman terkendali moal aya kakirangan!" },
    { speaker: "Kang Tatang (R&D)", text: "Riset varietas anyar parantos siap diluncurkeun. Karakter rasa beresih tur konsisten standar specialty internasional." },
    { speaker: "Mang Dadang (Inventory)", text: "Gudang sareng mesin roasting siap nampung lonjakan pesanan. Jadwal sangrai enjing tos tertata rapih." },
    { speaker: "Kang Dudung (GM)", text: "Sadaya tim nunjukkeun pagawéan anu pohara saena! Hayu urang jaga sumanget ieu. Rapat réngsé!" }
  ];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = body.topic || "Evaluasi Operasional Roastery";
    const explicitRecipient = body.targetRecipient || "";
    const { greeting, formattedDate } = getTimeContext(body.clientTime, body.timezone);

    // Check if question targets a single person
    const targetAgent = detectTargetAgent(topic, explicitRecipient);

    // Dynamic API key resolution (header priority or env)
    const headerKey = req.headers.get("x-gemini-key") || "";
    const effectiveKey = headerKey || process.env.GEMINI_API_KEY || "";
    const hasValidKey = effectiveKey && !effectiveKey.includes("ISI_DENGAN") && effectiveKey.length > 20;
    const clientGenAI = hasValidKey ? new GoogleGenerativeAI(effectiveKey) : null;

    let discussion;

    if (clientGenAI && hasValidKey) {
      try {
        let systemInstruction = "";
        let promptText = "";

        if (targetAgent) {
          // STRICT SINGLE-AGENT MODE: Only the queried agent speaks!
          systemInstruction = `Kamu adalah ${targetAgent.fullName} di Ramu Roastery (Spesialis Kopi Nusantara).
WAKTU OPERASIONAL SAAT INI: ${formattedDate} (${greeting}).
ATURAN UTAMA DARI PEMILIK USAHA:
1. Pemilik usaha menanyakan pertanyaan KHUSUS KEPADAMU (${targetAgent.fullName}).
2. DILARANG KERAS SEMUA AGEN IKUT MENJAWAB! HANYA kamu (${targetAgent.fullName}) yang boleh menjawab!
3. Jawab pertanyaan pemilik usaha dengan sangat jelas, lugas, ramah, dan tuntas sesuai peranmu (${targetAgent.role}).
4. Awali jawabanmu dengan sapaan "${greeting} bos!".
5. Format output HARUS JSON murni tanpa markdown: [{"speaker": "${targetAgent.fullName}", "text": "Jawaban lengkap..."}].`;

          promptText = `Pertanyaan dari bos: "${topic}". Jawab langsung HANYA sebagai ${targetAgent.fullName}.`;
        } else {
          // Plenary team meeting
          systemInstruction = `Kamu adalah sistem simulasi rapat meja bundar di Ramu Roastery (Spesialis Kopi Nusantara).
WAKTU OPERASIONAL SAAT INI: ${formattedDate} (${greeting}).
ATURAN RAPAT:
1. Rapat SELALU dibuka oleh Kang Dudung (GM) sebagai pembicara pertama dengan sapaan "${greeting}".
2. Tuliskan naskah dialog rapat yang hidup dan terfokus pada topik.
3. Pilih 3 hingga 5 agen yang relevan dengan topik.
4. Format HARUS JSON murni tanpa markdown pembungkus: [{"speaker": "Nama Agen", "text": "Dialog..."}].`;

          promptText = `Topik rapat pleno: "${topic}". Waktu nyata: ${formattedDate} (${greeting}). Mulai rapat dengan sapaan "${greeting}" oleh Kang Dudung (GM).`;
        }

        const model = clientGenAI.getGenerativeModel({
          model: "gemini-3.5-flash-lite",
          systemInstruction
        });

        const result = await model.generateContent(promptText);
        const rawText = result.response.text();
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        discussion = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
      } catch (geminiError) {
        console.warn("Gemini meeting generation failed, using dynamic local engine:", geminiError);
        discussion = generateTailoredMeetingDiscussion(topic, greeting, explicitRecipient);
      }
    } else {
      discussion = generateTailoredMeetingDiscussion(topic, greeting, explicitRecipient);
    }

    // Post-processing safeguard: ensure greeting matches real-time
    if (Array.isArray(discussion) && discussion.length > 0) {
      const first = discussion[0];
      if (first && (first.speaker.includes("Dudung") || first.speaker.includes("Rama") || first.speaker.includes("GM"))) {
        first.text = first.text.replace(/^(Selamat\s+(pagi|siang|sore|malam))/i, greeting);
      }
    }

    // Save meeting record in database
    try {
      await prisma.meetingSession.create({
        data: {
          topic: topic,
          summary: `Rapat koordinasi (${greeting}, ${formattedDate}) membahas: ${topic}. Melibatkan ${discussion.length} poin pembicaraan.`,
          transcript: JSON.stringify(discussion)
        }
      });
    } catch (dbErr) {
      console.warn("Failed to store meeting transcript:", dbErr);
    }

    // Autonomous task creation from meeting action item
    try {
      await prisma.agentTask.create({
        data: {
          title: `Action Item Meeting: ${topic.slice(0, 40)}`,
          description: `Tindak lanjut dari hasil kesepakatan rapat: ${discussion[discussion.length - 1]?.text || topic}`,
          role: "CROSS_DEPARTMENT",
          status: "IN_PROGRESS"
        }
      });
    } catch (taskErr) {
      console.warn("Failed to create meeting action task:", taskErr);
    }

    return NextResponse.json({ success: true, data: { discussion } });
  } catch (error) {
    console.error("Meeting Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
