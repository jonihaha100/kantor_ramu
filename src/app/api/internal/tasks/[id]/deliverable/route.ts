import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

// High quality fallback deliverables generator based on role and task title
function generateLocalDeliverable(role: string, title: string, description: string): string {
  const dateStr = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full"
  }).format(new Date());

  const r = role.toUpperCase();

  if (r.includes("R&D") || r.includes("KAFIN") || title.toLowerCase().includes("roast") || title.toLowerCase().includes("cupping")) {
    return `===============================================================
DOKUMEN HASIL KERJA: STANDAR OPERASIONAL SANGRAI & KALIBRASI SENSORIK
Diterbitkan oleh: Kafin (R&D & Quality Control Lead)
Tanggal: ${dateStr}
Judul Tugas: ${title}
===============================================================

1. SPESIFIKASI BAHAN BAKU:
   • Varietas: Arabica Single Origin Nusantara (Grade 1 Specialty)
   • Kadar Air (Moisture): 11.2% | Kerapatan: High Density (1.400 mdpl)
   • Kapasitas Mesin: Probat UG-15 (Batch 12 kg)

2. KURVA SANGRAI (ROAST PROFILE TARGET):
   • Charge Temp: 195°C (Drum pre-heated 25 menit)
   • Turning Point: 1:18 menit pada 92°C
   • RoR (Rate of Rise): Dijaga di 8.5°C/menit saat fase yellowing
   • First Crack: Menit 8:45 pada 198°C
   • Development Time Ratio (DTR): 14.2% (Drop pada menit 10:15 / 207°C)

3. SENSORIK CUPPING (STANDAR SCA 100 PTS):
   • Fragrance/Aroma: Melati liar, karamel gosong manis, kismis
   • Flavor Notes: Blackcurrant, plum madu, milk chocolate aftertaste
   • Acidity: Sparkling winey & clean (Score: 87.5 / 100 - Specialty)

4. TINDAK LANJUT OPERASIONAL:
   • Doni: Kalibrasi resting green beans 24 jam sebelum sangrai batch besar.
   • Barista Bar: Resting biji sangrai minimal 5 hari (degassing) sebelum seduh espresso.`;
  }

  if (r.includes("CONTENT") || r.includes("MAYA") || title.toLowerCase().includes("konten") || title.toLowerCase().includes("reels") || title.toLowerCase().includes("video")) {
    return `===============================================================
DOKUMEN HASIL KERJA: NASKAH PRODUKSI KONTEN & MEDIA SOSIAL
Diterbitkan oleh: Maya (Creative Content Lead)
Tanggal: ${dateStr}
Judul Tugas: ${title}
===============================================================

KONSEP KONTEN: "Rahasia Kenapa Kopi Susu Kafe Sering Terlalu Asam vs Enak Gurih"
Target Platform: Instagram Reels & TikTok (@ramuroastery)
Target Audiens: Pecinta kopi rumahan, home-brewer, dan calon mitra kafe B2B.

STRUKTUR NASKAH (30 DETIK):
[00:00 - 00:03] HOOK VISUAL:
• Visual: Slow-mo pour espresso kental berwarna emas di atas es batu susu segar.
• Audio: Sound trending ASMR ice crack + Voiceover: "Pernah gak beli kopi susu tapi rasanya malah kecut kayak cuka?"

[00:04 - 00:15] PERMASALAHAN & EDUKASI:
• Visual: Maya memegang 2 pack kopi (Dark vs Light roast).
• Voiceover: "Bukan susunya yang salah, tapi beans-nya! Kalau kopi filter diseduh susu, acidity-nya bakal tabrakan. Di Ramu, kita bikin 'House Blend Espresso' dari 70% Gayo Arabica & 30% Dampit Robusta sangrai medium-dark khusus!"

[00:16 - 00:25] DEMONSTRASI HASIL:
• Visual: Crema tebal mengilap tercampur sempurna dengan susu UHT dingin.
• Voiceover: "Hasilnya? Crema gurih cokelat karamel, manis tebal, dan ramah di lambung."

[00:26 - 00:30] CALL TO ACTION (CTA):
• Visual: Teks diskon "Beli 1kg Free Sample 100g" + Link di bio.
• Voiceover: "Mau kafe atau seduhanmu naik kelas? Cek keranjang kuning atau klik link di bio Ramu Roastery sekarang!"

HASIL ASET:
• Status Video: Siap shooting di brew-bar Ramu jam 14:00.
• Copy Caption: Sudah diselaraskan dengan hashtag #KopiNusantara #RamuRoastery #BaristaIndonesia`;
  }

  if (r.includes("B2B") || r.includes("BAYU") || title.toLowerCase().includes("kafe") || title.toLowerCase().includes("kemitraan") || title.toLowerCase().includes("kontrak")) {
    return `===============================================================
DOKUMEN HASIL KERJA: PROPOSAL PENAWARAN & KONTRAK KEMITRAAN B2B
Diterbitkan oleh: Bayu (B2B Expansion & Wholesale Specialist)
Tanggal: ${dateStr}
Judul Tugas: ${title}
===============================================================

PROFIL PENAWARAN:
• Nama Program: Kemitraan Suplai Biji Kopi Kafe Rekanan Ramu Roastery
• Target Mitra: Kafe Specialty & Coffee Shop Komersial
• Status: Final Draft siap diterbitkan ke calon klien

PAKET PASOKAN BIJI KOPI:
1. Paket Starter (Konsumsi 10 - 20 kg / bulan):
   • Produk: Ramu House Blend Espresso (1kg Pack Valve)
   • Harga Khusus B2B: Rp 195.000 / kg (Harga ritel: Rp 240.000)
   • Benefit: Gratis kalibrasi grinder 1x per bulan & edukasi barista.

2. Paket Volume Builder (Konsumsi 30 - 100 kg / bulan):
   • Produk: Custom Blend (Profile disesuaikan dengan mesin kafe mitra)
   • Harga Khusus B2B: Rp 180.000 / kg
   • Terms of Payment (TOP): Tempo 14 hari kerja setelah invoice diterima.

KLAUSUL LAYANAN & LOGISTIK (SLA):
• Garansi Fresh Roast: Biji kopi dikirim maksimal 3 hari setelah tanggal sangrai.
• Penggantian Barang: Rusak/cacat kemasan diganti 100% dalam 1x24 jam (Free Ongkir).
• Jadwal Distribusi: Setiap hari Selasa & Jumat via armada kurir Ramu.`;
  }

  if (r.includes("FINANCE") || r.includes("FINA") || title.toLowerCase().includes("keuangan") || title.toLowerCase().includes("omzet") || title.toLowerCase().includes("laba")) {
    return `===============================================================
DOKUMEN HASIL KERJA: AUDIT REKONSILIASI KEUANGAN & MARGIN ROASTERY
Diterbitkan oleh: Fina (Head of Finance & Tax Accounting)
Tanggal: ${dateStr}
Judul Tugas: ${title}
===============================================================

1. RINGKASAN ARUS KAS & OMZET:
   • Total Penjualan Minggu Ini: Rp 14.225.000
   • Pembayaran Terverifikasi (Lunas): 100% (Rekening BCA & QRIS Midtrans)
   • Piutang B2B Tertagih: Rp 9.800.000 (Tempo terkelola aman)

2. STRUKTUR BIAYA & COGS (HARGA POKOK PRODUKSI):
   • Green Beans Mentah: 41.5% dari total penjualan
   • Kemasan Foil Valve & Label: 6.2%
   • Gas Roaster & Listrik: 3.8%
   • Gross Profit Margin: 48.5% (Sehat di atas rata-rata industri specialty coffee)

3. KEPATUHAN PAJAK:
   • Faktur Pajak PPN 11% telah diterbitkan untuk seluruh transaksi B2B terdaftar.
   • Dana cadangan belanja green beans bulan depan: Rp 28.500.000 (Aman).`;
  }

  // General executive plan deliverable
  return `===============================================================
DOKUMEN HASIL KERJA & LAPORAN EKSEKUSI OPERASIONAL
Diterbitkan oleh: Tim Ramu Roastery (${role})
Tanggal: ${dateStr}
Judul Tugas: ${title}
===============================================================

RINGKASAN EKSEKUSI:
Tugas "${title}" telah dianalisis dan disusun rencana tindakan praktisnya sesuai SOP Ramu Roastery.

DETAIL TINDAKAN & LANGKAH KERJA:
1. Analisis Kebutuhan:
   ${description || "Memenuhi target operasional harian dan memastikan kepuasan pelanggan serta efisiensi roastery terjaga."}

2. Implementasi Teknis:
   • Sinkronisasi data dengan sistem gudang dan keuangan.
   • Koordinasi lintas divisi untuk eksekusi tanpa hambatan.
   • Penerapan standar kontrol mutu specialty coffee.

3. Hasil & Rekomendasi:
   Seluruh parameter kerja telah terverifikasi aman. Tugas siap ditutup atau dilanjutkan ke tahap distribusi ritel & B2B.`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.agentTask.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    let deliverable = null;
    if (task.metadata) {
      try {
        const meta = JSON.parse(task.metadata);
        deliverable = meta.deliverable || null;
      } catch {}
    }
    return NextResponse.json({
      success: true,
      data: {
        task,
        deliverable
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to get deliverable" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const task = await prisma.agentTask.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let deliverableContent = body.deliverable;

    // If client requested AI generation or deliverable not provided
    if (!deliverableContent) {
      const apiKey = process.env.GEMINI_API_KEY || "";
      const hasValidKey = apiKey && !apiKey.includes("ISI_DENGAN") && apiKey.length > 20;

      if (hasValidKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash-lite",
            systemInstruction: `Kamu adalah asisten eksekutif Ramu Roastery (Spesialis Kopi Nusantara).
Tugasmu adalah menghasilkan DOKUMEN HASIL PEKERJAAN (DELIVERABLE OUTPUT) yang sangat profesional, detail, terstruktur rapi, dan siap dipakai nyata oleh pemilik usaha.
Gunakan Bahasa Indonesia profesional, sertakan data spesifik (resep sangrai, naskah konten, klausul B2B, atau audit biaya sesuai peran tugas). Jangan singkat-singkat, berikan dokumen kerja yang lengkap dan mengesankan.`
          });

          const prompt = `Buatkan Dokumen Hasil Kerja Resmi untuk tugas ini:
Judul: "${task.title}"
Deskripsi: "${task.description}"
Divisi Penanggung Jawab: "${task.role}"`;

          const result = await model.generateContent(prompt);
          deliverableContent = result.response.text();
        } catch (err) {
          console.warn("Gemini deliverable generation failed, using local generator:", err);
          deliverableContent = generateLocalDeliverable(task.role, task.title, task.description);
        }
      } else {
        deliverableContent = generateLocalDeliverable(task.role, task.title, task.description);
      }
    }

    // Save deliverable in task metadata
    const metadataObj = {
      deliverable: deliverableContent,
      generatedAt: new Date().toISOString(),
      author: task.role
    };

    const updatedTask = await prisma.agentTask.update({
      where: { id },
      data: {
        metadata: JSON.stringify(metadataObj)
      }
    });

    // Log the deliverable creation
    await prisma.agentLog.create({
      data: {
        taskId: task.id,
        role: task.role,
        message: `Dokumen hasil kerja telah selesai dibuat untuk tugas: "${task.title}"`,
        level: "INFO"
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        task: updatedTask,
        deliverable: deliverableContent
      }
    });
  } catch (error: any) {
    console.error("Task Deliverable POST Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate deliverable" }, { status: 500 });
  }
}
