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
    name: "Budi",
    fullName: "Budi (Sourcing)",
    role: "Green Bean Sourcing & Farmer Relations",
    keywords: ["budi", "sourcing", "petani", "kebun", "green bean", "green beans", "gabah", "gayo", "takengon", "pangalengan", "bajawa", "panen", "beli biji", "harga biji", "tani", "koperasi"],
    generateAnswer: (topic, greeting) => {
      const t = topic.toLowerCase();
      if (t.includes("harga") || t.includes("nego") || t.includes("tawar") || t.includes("biaya") || t.includes("per kilo")) {
        return `${greeting} bos! Mengenai harga green beans Gayo Grade 1, koperasi petani Takengon buka harga Rp 92.000/kg. Mereka bersedia kita kunci di Rp 86.000/kg asalkan ambil minimal 1.5 ton dengan DP 30%. Typica Pangalengan skor 88+ di Rp 105.000/kg. Pasokan kita aman dan margin roastery tetap terlindungi.`;
      }
      if (t.includes("sampel") || t.includes("sample") || t.includes("uji")) {
        return `${greeting} bos! Sampel fisik 2kg biji kopi Gayo Anaerobic & Typica Pangalengan sudah saya kirimkan ke lab R&D Kafin untuk uji sensorik. Besok pagi datanya siap kita review bersama.`;
      }
      if (t.includes("kapan") || t.includes("jadwal") || t.includes("panen")) {
        return `${greeting} bos! Di Takengon saat ini sedang masuk fly crop kedua dengan kualitas petik merah sangat optimal karena curah matahari ideal. Flores Bajawa panen berikutnya sekitar bulan Juli-Agustus.`;
      }
      return `${greeting} bos! Hubungan kemitraan direct-trade dengan kelompok tani kopi di Gayo dan Pangalengan berjalan sangat solid. Pasokan green beans di gudang aman untuk kebutuhan 3 bulan ke depan tanpa risiko putus stok.`;
    }
  },
  {
    name: "Kafin",
    fullName: "Kafin (R&D)",
    role: "R&D & Sensory Cupping Lead",
    keywords: ["kafin", "r&d", "rnd", "cupping", "rasa", "skor", "score", "notes", "acidity", "body", "roasting profile", "sangrai", "profil", "dtr", "ror", "v60", "espresso", "formula", "resep"],
    generateAnswer: (topic, greeting) => {
      const t = topic.toLowerCase();
      if (t.includes("skor") || t.includes("score") || t.includes("batch") || t.includes("rasa") || t.includes("cupping")) {
        return `${greeting} bos! Hasil cupping sensorik Batch #14 Gayo Anaerobic kemarin meraih skor 87.5 poin (Specialty Grade). Tasting notes dominan peach, brown sugar, dan lingering jasmine yang sangat clean. Profil RoR saya kunci di DTR 14.2% agar crema di mesin espresso tebal dan acidity-nya balance.`;
      }
      if (t.includes("sample") || t.includes("sampel") || t.includes("uji")) {
        return `${greeting} bos! Sampel green beans baru dari mas Budi sudah masuk tahap sample roasting di mesin IKAWA. Parameter moisture 11.2% sangat ideal. Besok pagi saya jadwalkan sesi cupping internal di meja Cupping Table.`;
      }
      return `${greeting} bos! Seluruh batch specialty coffee Ramu lolos standar quality control sensorik. Kalibrasi rasa untuk racikan espresso bar maupun filter V60 terjaga konsisten di skor 86+ poin.`;
    }
  },
  {
    name: "Doni",
    fullName: "Doni (Inventory)",
    role: "Warehouse & Roastery Lead",
    keywords: ["doni", "gudang", "inventory", "stok", "warehouse", "probat", "mesin sangrai", "mesin roasting", "suhu", "packing", "kemasan", "karung", "stok kopi"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} bos! Laporan gudang operasional: Suhu drum mesin Probat UG22 stabil di 205°C, kelembapan gudang 60% RH beroperasi normal. Stok green beans di pallet aman 1.3 ton, dan stok kemasan 200g Ramu Blend siap 120 pack di rak display. Siap sangrai batch berikutnya!`;
    }
  },
  {
    name: "Rian",
    fullName: "Rian (Web Dev)",
    role: "Full-Stack Web Dev & Infrastructure",
    keywords: ["rian", "web", "website", "dev", "server", "store", "midtrans", "qris", "checkout", "bug", "it", "nextjs", "online", "loading"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} bos! Status teknologi web store Ramu: Server edge Next.js 15 berjalan stabil dengan latency 9ms dan uptime 99.98%. Transaksi pembayaran otomatis QRIS Midtrans lancar tanpa kendala. Katalog belanja siap menampung lonjakan pesanan pelanggan kapan saja.`;
    }
  },
  {
    name: "Fina",
    fullName: "Fina (Finance)",
    role: "Financial & Revenue Lead",
    keywords: ["fina", "finance", "keuangan", "omzet", "pendapatan", "kas", "cashflow", "uang", "laba", "rugi", "margin", "invoice", "tagihan", "piutang", "budget"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} bos! Rekapitulasi keuangan harian: Total omzet hari ini tembus Rp 14.225.000 dari kombinasi pesanan online web store dan invoice suplai kafe B2B. Margin laba kotor terjaga di 42%, piutang B2B term of payment aman maksimal 14 hari, dan arus kas roastery dalam kondisi sangat sehat.`;
    }
  },
  {
    name: "Sari",
    fullName: "Sari (CS)",
    role: "Customer Service & Experience Lead",
    keywords: ["sari", "cs", "customer service", "pelanggan", "pembeli", "komplain", "chat", "wa", "whatsapp", "tanya", "grind size", "gilingan", "tiket", "closing", "jam", "24 jam", "tutup"],
    generateAnswer: (topic, greeting) => {
      const t = topic.toLowerCase();
      if (t.includes("closing") || t.includes("jam") || t.includes("tutup") || t.includes("24") || t.includes("aktif")) {
        return `${greeting} bos! Layanan WhatsApp CS Ramu Roastery beroperasi 24 Jam Non-Stop tanpa jam closing. Mau pagi, siang, atau tengah malam sekalipun, saya selalu standby aktif merespons setiap pertanyaan pelanggan di WhatsApp dalam hitungan detik!`;
      }
      return `${greeting} bos! Update customer service WhatsApp (Standby 24/7 Tanpa Jam Closing): Waktu respon rata-rata 1.2 menit dengan CSAT 98.4%. Pertanyaan terbanyak seputar panduan grind size seduh manual dan rekomendasi beans specialty. Layanan chat kita selalu aktif melayani pelanggan tanpa henti!`;
    }
  },
  {
    name: "Gilang",
    fullName: "Gilang (Logistics)",
    role: "Logistics & Dispatch Lead",
    keywords: ["gilang", "logistik", "kurir", "ekspedisi", "kargo", "resi", "kirim", "pengiriman", "j&t", "paxel", "jne", "paket", "pickup"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} bos! Update logistik pengiriman: Seluruh paket pesanan hari ini sudah di-packing rapi dan di-pickup oleh kurir kargo J&T dan Paxel tepat jam 15:30 sore. Nomor resi otomatis terbit dan langsung di-blast ke WhatsApp pemesan. Rute Jakarta dan Jawa Barat estimasi 1 hari sampai.`;
    }
  },
  {
    name: "Bayu",
    fullName: "Bayu (B2B)",
    role: "B2B Sales & Commercial Lead",
    keywords: ["bayu", "b2b", "sales", "kafe", "kedai", "kemitraan", "franchise", "horeca", "grosir", "kontrak", "klien"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} bos! Perkembangan kemitraan B2B: Kafe Sudut Temu resmi tanda tangan kontrak suplai 20kg per minggu. Selain itu ada 2 prospek franchise kafe di Jakarta Selatan berminat kontrak 100kg/bulan. Profil rasa yang diminta medium-roast seimbang. Draft kontrak siap diajukan untuk bos tandatangani.`;
    }
  },
  {
    name: "Arya",
    fullName: "Arya (Ads)",
    role: "Performance Marketing & Ads",
    keywords: ["arya", "ads", "iklan", "meta ads", "facebook ads", "instagram ads", "roas", "cpc", "budget iklan", "campaign", "marketing"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} bos! Laporan performa iklan digital: Kampanye Meta Ads kita menghasilkan ROAS 3.8x hari ini dengan CTR 2.4%. Alokasi budget optimal menyasar pecinta specialty coffee Nusantara di wilayah Jabodetabek dan kota-kota besar. Biaya per akuisisi pelanggan (CPA) sangat efisien.`;
    }
  },
  {
    name: "Maya",
    fullName: "Maya (Content)",
    role: "Content Creator & Storyteller",
    keywords: ["maya", "konten", "content", "tiktok", "reels", "video", "sosmed", "instagram", "ig", "visual", "edukasi kopi", "branding"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} bos! Kabar dari tim kreatif: Video Reels & TikTok 'Sensasi Tasting Notes Kopi Susu vs Manual Brew' sudah selesai tahap editing dengan hook visual pour over estetik. Konten ini diproyeksikan menggaet ribuan views organik dan mengarahkan calon pembeli langsung ke web store Ramu.`;
    }
  },
  {
    name: "Rama",
    fullName: "Rama (GM)",
    role: "General Manager & Operations Lead",
    keywords: ["rama", "gm", "general manager", "manajer", "arahan", "kpi", "evaluasi", "strategi", "koordinasi"],
    generateAnswer: (topic, greeting) => {
      return `${greeting} bos! Seluruh 11 divisi roastery beroperasi penuh sesuai standar mutu Ramu. Sinergi antara tim sourcing petani, lab sangrai, tim e-commerce, hingga pengiriman berjalan sangat rapi. Saya siap mengawal eksekusi instruksi dan target prioritas berikutnya dari bos.`;
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
      { speaker: "Rama (GM)", text: `${greeting} rekan-rekan Ramu Roastery. Rapat dimulai. Fokus bahasan kita adalah: "${topic}". Bagaimana evaluasi strategi promosi dan alokasi budget kita?` },
      { speaker: "Arya (Ads)", text: "Data kampanye Meta Ads kita kemarin menghasilkan ROAS 3.8x. Tapi cost-per-click mulai naik. Kita butuh creative content yang lebih segar agar audience tidak jenuh." },
      { speaker: "Maya (Content)", text: "Gue udah rancang video TikTok & Reels 'Sensasi Tasting Notes Kopi Susu vs Manual Brew'. Visual slow-mo pour over dan audio trending bakal boost organic reach kita." },
      { speaker: "Sari (CS)", text: "Kalau kontennya tayang akhir pekan, tolong koordinasikan tanggalnya ya May. Biasanya chat WhatsApp dan DM masuk ratusan, tim CS harus standby kuota promo." },
      { speaker: "Fina (Finance)", text: "Dari sisi cashflow, saya setuju alokasi tambahan budget marketing Rp 3.500.000 selama target blended ROAS tetap di atas 3.2x." },
      { speaker: "Doni (Inventory)", text: "Stok kemasan 200g Ramu Blend siap 120 pack di rak display. Tinggal gas eksekusi!" },
      { speaker: "Rama (GM)", text: "Bagus sekali. Maya jalankan produksi video hari ini, Arya siapkan ad set lookalike, dan Fina release budget-nya. Meeting ditutup!" }
    ];
  }

  if (t.includes("roast") || t.includes("kualitas") || t.includes("rasa") || t.includes("cupping") || t.includes("beans") || t.includes("biji") || t.includes("tren") || t.includes("produksi") || t.includes("penjualan") || t.includes("stok")) {
    return [
      { speaker: "Rama (GM)", text: `${greeting} rekan-rekan Ramu Roastery. Langsung saja ke intinya, data penjualan minggu ini menunjukkan ada beberapa pergerakan menarik di kopi Nusantara kita. Kita harus segera putuskan stok biji kopi mana yang harus kita up produksinya minggu ini. Kafin, dari R&D dan roasting, bagaimana pantauan tren saat ini?` },
      { speaker: "Kafin (R&D)", text: "Terima kasih pak Rama. Batch #14 Gayo Anaerobic skornya 87.5 poin, tapi profil RoR pada menit ke-8 terlalu tajam. Saya sarankan kurangi airflow di fase yellowing agar rasa manis buahnya lebih karamel." },
      { speaker: "Doni (Inventory)", text: "Suhu drum roaster Probat kita stabil di 205°C. Tapi kadar air green beans dari karung batch baru agak tinggi, di angka 11.8%. Jadi butuh waktu drying 45 detik lebih lama." },
      { speaker: "Budi (Sourcing)", text: "Benar Don, panen kemarin di Takengon sering kena hujan sore. Tapi prosesor di sana jamin fermentasinya bersih tanpa tumpukan apek." },
      { speaker: "Bayu (B2B)", text: "Klien kafe kita banyak minta profil medium-roast yang aman untuk mesin espresso komersial. Jangan sampai terlalu asam (sour) ya mas Kafin." },
      { speaker: "Kafin (R&D)", text: "Tenang mas Bayu, kita kunci DTR di 14.2% supaya crema tebal dan acidity tetap balance." },
      { speaker: "Rama (GM)", text: "Kesepakatan tercapai: Kafin sesuaikan profile sangrai besok pagi, Doni catat log roasting di papan, dan Budi monitor pasokan. Terima kasih semuanya." }
    ];
  }

  if (t.includes("kirim") || t.includes("ekspedisi") || t.includes("kurir") || t.includes("logistik") || t.includes("pengiriman") || t.includes("resi")) {
    return [
      { speaker: "Rama (GM)", text: `${greeting} rekan-rekan Ramu Roastery. Agenda rapat mendesak: "${topic}". Gilang dan Sari, silakan paparkan evaluasi pengiriman barang kita.` },
      { speaker: "Gilang (Logistics)", text: "Beberapa hari ini kargo darat J&T agak padat menjelang akhir bulan, ada keterlambatan 1 hari untuk rute Jawa Timur. Untuk Jakarta & Bandung masih aman 1 hari sampai." },
      { speaker: "Sari (CS)", text: "Betul pak, ada 4 pelanggan kafe yang tanya nomor resi karena stok kopi bar mereka mulai menipis. Saya butuh update resi lebih cepat setiap jam 2 siang." },
      { speaker: "Gilang (Logistics)", text: "Solusinya kita bisa aktifkan alternatif Paxel Big & JNE Trucking untuk pesanan di atas 10kg. Pickup jam 13:00 siang tetap." },
      { speaker: "Fina (Finance)", text: "Selisih ongkos kirim Paxel hanya Rp 2.000 per kg lebih tinggi, tapi bisa kita cover dari margin B2B demi menjaga kepuasan klien." },
      { speaker: "Rama (GM)", text: "Keputusan disetujui. Gilang terapkan Paxel sebagai opsi priority kargo, Sari berikan notifikasi proaktif ke pelanggan. Eksekusi sekarang." }
    ];
  }

  if (t.includes("b2b") || t.includes("kafe") || t.includes("partnership") || t.includes("sales") || t.includes("klien")) {
    return [
      { speaker: "Rama (GM)", text: `${greeting} rekan-rekan Ramu Roastery. Rapat kemitraan B2B dimulai. Topik kita: "${topic}". Bayu, bagaimana status ekspansi suplai kopi kita?` },
      { speaker: "Bayu (B2B)", text: "Kabar baik, Pak Rama! Kafe Sudut Temu resmi teken PO 20kg per minggu. Selain itu ada 2 cafe franchise di Jakarta Selatan tertarik kontrak 100kg/bulan." },
      { speaker: "Fina (Finance)", text: "Tolong pastikan terms of payment (TOP) maksimal 14 hari kerja ya mas Bayu, jangan sampai piutang macet mengganggu cashflow belanja green beans." },
      { speaker: "Doni (Inventory)", text: "Kapasitas roasting kita masih sanggup nambah 250kg per minggu. Mesin siap, green beans di gudang aman 1.3 ton." },
      { speaker: "Kafin (R&D)", text: "Untuk kafe baru, saya sarankan kirim 'Cupping Sample Kit' 3 varietas dulu supaya barista mereka bisa kalibrasi grind size mesin espresso-nya." },
      { speaker: "Rama (GM)", text: "Sempurna. Bayu finalisasi kontrak dengan klausul pembayaran Fina, Kafin siapkan sample kit. Prospek bisnis ini prioritas tinggi!" }
    ];
  }

  // General Operational Discussion (Plenary)
  return [
    { speaker: "Rama (GM)", text: `${greeting} rekan-rekan Ramu Roastery. Rapat koordinasi roastery dibuka. Topik yang kita diskusikan: "${topic}". Mari kita review dari masing-masing departemen.` },
    { speaker: "Sari (CS)", text: "Dari sisi pelanggan, sentimen sangat positif hari ini. Permintaan repeat order produk filter coffee meningkat 25%." },
    { speaker: "Rian (Web Dev)", text: "Infrastruktur web store stabil, loading time 0.8 detik. Integrasi QRIS Midtrans berjalan mulus tanpa kendala pembayaran." },
    { speaker: "Fina (Finance)", text: "Omzet harian kita tembus target di Rp 14.225.000 dengan margin laba kotor terjaga di 42%. Arus kas aman terkendali." },
    { speaker: "Kafin (R&D)", text: "Riset varietas kopi terbaru sudah siap diluncurkan. Karakter rasa bersih dan konsisten dengan standar specialty coffee." },
    { speaker: "Doni (Inventory)", text: "Gudang dan mesin roasting siap menopang lonjakan permintaan. Jadwal sangrai besok sudah tertata rapi." },
    { speaker: "Rama (GM)", text: "Semua tim menunjukkan performa prima. Mari kita jaga sinergi dan eksekusi rencana kerja minggu ini dengan disiplin. Rapat selesai!" }
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
1. Rapat SELALU dibuka oleh Rama (GM) sebagai pembicara pertama dengan sapaan "${greeting}".
2. Tuliskan naskah dialog rapat yang hidup dan terfokus pada topik.
3. Pilih 3 hingga 5 agen yang relevan dengan topik.
4. Format HARUS JSON murni tanpa markdown pembungkus: [{"speaker": "Nama Agen", "text": "Dialog..."}].`;

          promptText = `Topik rapat pleno: "${topic}". Waktu nyata: ${formattedDate} (${greeting}). Mulai rapat dengan sapaan "${greeting}" oleh Rama (GM).`;
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
      if (first && (first.speaker.includes("Rama") || first.speaker.includes("GM"))) {
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
