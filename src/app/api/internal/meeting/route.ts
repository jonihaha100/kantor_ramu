import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const apiKey = process.env.GEMINI_API_KEY || "";
const hasValidGeminiKey = apiKey && !apiKey.includes("ISI_DENGAN") && apiKey.length > 20;
const genAI = hasValidGeminiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to generate dynamic, tailored multi-agent debate based on topic
function generateTailoredMeetingDiscussion(topic: string) {
  const t = topic.toLowerCase();

  if (t.includes("marketing") || t.includes("iklan") || t.includes("konten") || t.includes("sosmed") || t.includes("promo") || t.includes("reels")) {
    return [
      { speaker: "Rama (GM)", text: `Rapat dimulai. Fokus bahasan kita adalah: "${topic}". Bagaimana evaluasi strategi promosi dan alokasi budget kita?` },
      { speaker: "Arya (Ads)", text: "Data kampanye Meta Ads kita kemarin menghasilkan ROAS 3.8x. Tapi cost-per-click mulai naik. Kita butuh creative content yang lebih segar agar audience tidak jenuh." },
      { speaker: "Maya (Content)", text: "Gue udah rancang video TikTok & Reels 'Sensasi Tasting Notes Kopi Susu vs Manual Brew'. Visual slow-mo pour over dan audio trending bakal boost organic reach kita." },
      { speaker: "Sari (CS)", text: "Kalau kontennya tayang akhir pekan, tolong koordinasikan tanggalnya ya May. Biasanya chat WhatsApp dan DM masuk ratusan, tim CS harus standby kuota promo." },
      { speaker: "Fina (Finance)", text: "Dari sisi cashflow, saya setuju alokasi tambahan budget marketing Rp 3.500.000 selama target blended ROAS tetap di atas 3.2x." },
      { speaker: "Doni (Inventory)", text: "Stok kemasan 200g Ramu Blend siap 120 pack di rak display. Tinggal gas eksekusi!" },
      { speaker: "Rama (GM)", text: "Bagus sekali. Maya jalankan produksi video hari ini, Arya siapkan ad set lookalike, dan Fina release budget-nya. Meeting ditutup!" }
    ];
  }

  if (t.includes("roast") || t.includes("kualitas") || t.includes("rasa") || t.includes("cupping") || t.includes("beans") || t.includes("biji")) {
    return [
      { speaker: "Rama (GM)", text: `Selamat siang rekan-rekan. Kita kumpul di cupping table untuk membahas: "${topic}". Kafin, silakan buka evaluasi sensorik.` },
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
      { speaker: "Rama (GM)", text: `Agenda rapat mendesak: "${topic}". Gilang dan Sari, silakan paparkan evaluasi pengiriman barang kita.` },
      { speaker: "Gilang (Logistics)", text: "Beberapa hari ini kargo darat J&T agak padat menjelang akhir bulan, ada keterlambatan 1 hari untuk rute Jawa Timur. Untuk Jakarta & Bandung masih aman 1 hari sampai." },
      { speaker: "Sari (CS)", text: "Betul pak, ada 4 pelanggan kafe yang tanya nomor resi karena stok kopi bar mereka mulai menipis. Saya butuh update resi lebih cepat setiap jam 2 siang." },
      { speaker: "Gilang (Logistics)", text: "Solusinya kita bisa aktifkan alternatif Paxel Big & JNE Trucking untuk pesanan di atas 10kg. Pickup jam 13:00 siang tetap." },
      { speaker: "Fina (Finance)", text: "Selisih ongkos kirim Paxel hanya Rp 2.000 per kg lebih tinggi, tapi bisa kita cover dari margin B2B demi menjaga kepuasan klien." },
      { speaker: "Rama (GM)", text: "Keputusan disetujui. Gilang terapkan Paxel sebagai opsi priority kargo, Sari berikan notifikasi proaktif ke pelanggan. Eksekusi sekarang." }
    ];
  }

  if (t.includes("b2b") || t.includes("kafe") || t.includes("partnership") || t.includes("sales") || t.includes("klien")) {
    return [
      { speaker: "Rama (GM)", text: `Rapat kemitraan B2B dimulai. Topik kita: "${topic}". Bayu, bagaimana status ekspansi suplai kopi kita?` },
      { speaker: "Bayu (B2B)", text: "Kabar baik, Pak Rama! Kafe Sudut Temu resmi teken PO 20kg per minggu. Selain itu ada 2 cafe franchise di Jakarta Selatan tertarik kontrak 100kg/bulan." },
      { speaker: "Fina (Finance)", text: "Tolong pastikan terms of payment (TOP) maksimal 14 hari kerja ya mas Bayu, jangan sampai piutang macet mengganggu cashflow belanja green beans." },
      { speaker: "Doni (Inventory)", text: "Kapasitas roasting kita masih sanggup nambah 250kg per minggu. Mesin siap, green beans di gudang aman 1.3 ton." },
      { speaker: "Kafin (R&D)", text: "Untuk kafe baru, saya sarankan kirim 'Cupping Sample Kit' 3 varietas dulu supaya barista mereka bisa kalibrasi grind size mesin espresso-nya." },
      { speaker: "Rama (GM)", text: "Sempurna. Bayu finalisasi kontrak dengan klausul pembayaran Fina, Kafin siapkan sample kit. Prospek bisnis ini prioritas tinggi!" }
    ];
  }

  // General Operational Discussion
  return [
    { speaker: "Rama (GM)", text: `Rapat koordinasi roastery dibuka. Topik yang kita diskusikan: "${topic}". Mari kita review dari masing-masing departemen.` },
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

    let discussion;

    if (genAI && hasValidGeminiKey) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-3.5-flash-lite",
          systemInstruction: "Kamu adalah sistem simulasi rapat meja bundar di Ramu Roastery (Spesialis Kopi Nusantara). Tuliskan naskah dialog rapat yang sangat hidup, realistis, dan saling bersahutan antara agen: Rama (GM), Sari (CS), Rian (Web Dev), Fina (Finance), Doni (Inventory), Gilang (Logistics), Bayu (B2B), Kafin (R&D), Arya (Ads), Maya (Content), Budi (Sourcing). Pilih 4 hingga 6 agen yang relevan dengan topik. Format HARUS JSON murni: [{\"speaker\": \"Nama Agen\", \"text\": \"Dialog...\"}]."
        });

        const result = await model.generateContent(`Topik rapat hari ini: ${topic}`);
        const rawText = result.response.text();
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        discussion = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
      } catch (geminiError) {
        console.warn("Gemini meeting generation failed, using dynamic local engine:", geminiError);
        discussion = generateTailoredMeetingDiscussion(topic);
      }
    } else {
      discussion = generateTailoredMeetingDiscussion(topic);
    }

    // Save meeting record in SQLite database
    try {
      await prisma.meetingSession.create({
        data: {
          topic: topic,
          summary: `Rapat koordinasi membahas: ${topic}. Melibatkan ${discussion.length} poin pembicaraan.`,
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
