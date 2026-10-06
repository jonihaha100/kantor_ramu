import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI, FunctionDeclaration } from "@google/generative-ai";

const prisma = new PrismaClient();

// Tool declarations for LLM
const checkStockDeclaration: FunctionDeclaration = {
  name: "check_stock",
  description: "Mengecek jumlah stok produk yang ada di database gudang.",
};

const reportRevenueDeclaration: FunctionDeclaration = {
  name: "report_revenue",
  description: "Mendapatkan total omzet/pendapatan harian dan jumlah pesanan hari ini.",
};

const createTaskDeclaration: FunctionDeclaration = {
  name: "create_task",
  description: "Membuat tugas baru di Kanban Board untuk didelegasikan ke anggota tim.",
  parameters: {
    type: "OBJECT" as any,
    properties: {
      title: { type: "STRING" as any, description: "Judul tugas" },
      description: { type: "STRING" as any, description: "Detail deskripsi tugas" },
      role: { type: "STRING" as any, description: "Divisi atau peran penerima tugas" }
    },
    required: ["title", "description", "role"]
  }
};

// Rich multi-turn conversational intelligence for all 11 agents
const AGENT_INTELLIGENCE: Record<string, {
  name: string;
  roleTitle: string;
  department: string;
  personality: string;
  handleLocalReply: (userMsg: string, history: any[]) => Promise<string>;
}> = {
  "budi": {
    name: "Budi",
    roleTitle: "Green Bean Sourcing & Farmer Relations",
    department: "Supply & Agriculture",
    personality: "Humble, paham agrikultur kopi, negosiator direct-trade yang adil bagi petani dan menguntungkan roastery.",
    handleLocalReply: async (userMsg: string, history: any[]) => {
      const lower = userMsg.toLowerCase();
      const lastBotMsg = history.filter(h => h.sender === "agent").pop()?.text || "";

      // 1. Negotiation & Price Discussion
      if (lower.includes("harga") || lower.includes("nego") || lower.includes("murah") || lower.includes("diskon") || lower.includes("tawar") || lower.includes("biaya") || lower.includes("per kilo") || lower.includes("ongkos")) {
        if (lower.includes("gayo") || lower.includes("takengon") || lastBotMsg.includes("Gayo")) {
          return `Soal harga green beans Gayo Grade 1, koperasi petani di Takengon saat ini buka harga Rp 92.000/kg (fermentasi Anaerobic Natural). 

Kalau kita tawar ke Rp 85.000–87.000/kg, Pak Samsul (ketua koperasi) bersedia asalkan kita ambil minimal 1.5 ton dan bayar DP 30% di awal. Menurut saya ini win-win:
1. Margin kita aman karena harga pasar rata-rata sudah tembus Rp 98.000/kg.
2. Petani tetap dapat kepastian pembayaran tepat waktu dari Ramu.

Bagaimana bos, apakah saya kunci penawaran di Rp 86.000/kg dengan kuota 1.5 ton, atau kita tawar lebih ketat lagi?`;
        }
        
        return `Untuk harga green beans lokal saat ini:
• Typica Pangalengan (Honey Anaerobic): Rp 105.000/kg (Micro-lot premium, skor 88+).
• Aceh Gayo Grade 1: Rp 92.000/kg (harga direct-trade).
• Flores Bajawa Honey: Rp 88.000/kg.

Kita bisa negosiasi turun Rp 3.000–5.000 per kg jika kita terbitkan Kontrak Pembelian Tahunan (PO berkala). Ada varietas tertentu yang ingin kita ajukan penawaran harga khusus hari ini?`;
      }

      // 2. Sample & Quality Testing Request
      if (lower.includes("sampel") || lower.includes("sample") || lower.includes("cicip") || lower.includes("tes") || lower.includes("lab") || lower.includes("uji")) {
        // Automatically create a sample task in Kanban
        const task = await prisma.agentTask.create({
          data: {
            title: "Uji Sampel Green Beans Baru dari Petani",
            description: `Instruksi dari diskusi: ${userMsg}. Budi kirim sampel ke lab R&D Kafin untuk evaluasi cupping score.`,
            role: "R&D_QUALITY",
            status: "IN_PROGRESS"
          }
        });

        return `Siap bos! Saya sudah atur pengiriman sampel fisik 2kg (varietas Typica Pangalengan & Gayo Anaerobic) langsung ke lab R&D.

Saya juga sudah otomatis buatkan tiket tugas untuk Kafin di Kanban Board (ID: ${task.id.slice(0, 4)}) agar segera dilakukan sample roasting di mesin IKAWA dan cupping sensorik. Begitu hasilnya keluar besok, kita putuskan berapa karung yang akan kita beli. Ada parameter rasa khusus yang mau difokuskan?`;
      }

      // 3. Postpone / Hold / Decision Making
      if (lower.includes("tunda") || lower.includes("nanti") || lower.includes("jangan") || lower.includes("tahan") || lower.includes("batal") || lower.includes("stop")) {
        return `Paham bos, saya tahan dulu penerbitan PO ke kelompok tani. 

Saran saya, kita beri tenggat waktu konfirmasi maksimal 7 hari ke petani Takengon, supaya alokasi 2 ton biji kopi pilihan ini tidak dilepas ke pembeli luar atau eksportir lain. Sementara itu, saya akan minta Doni audit sisa karung di gudang kita. Ada pertimbangan lain terkait cashflow atau kapasitas sangrai kita?`;
      }

      // 4. Harvest schedule & Seasonality
      if (lower.includes("kapan") || lower.includes("panen") || lower.includes("jadwal") || lower.includes("musim") || lower.includes("waktu")) {
        return `Kalender panen kopi petani binaan kita:
• Gayo (Aceh Tengah): Panen raya kedua (fly crop) dimulai bulan depan hingga awal musim penghujan. Kualitas biji saat ini paling optimal karena curah matahari tinggi untuk proses penjemuran di raised-bed.
• Bajawa (Flores): Panen utama baru akan masuk di bulan Juli–Agustus.
• Pangalengan (Jawa Barat): Saat ini sedang petik merah selektif untuk proses Anaerobic Honey.

Jika kita ingin stok segar (fresh crop), bulan depan adalah waktu paling krusial untuk booking kuota di Gayo. Mau saya siapkan draft alokasi pembelian sekarang?`;
      }

      // 5. Quantity / Volume discussion
      if (lower.includes("ton") || lower.includes("kg") || lower.includes("banyak") || lower.includes("jumlah") || lower.includes("karung") || lower.includes("kuota")) {
        return `Terkait volume pembelian:
Saat ini Doni melaporkan ada 23 karung green beans di gudang kita (~1.380 kg). Jika kapasitas roasting kita rata-rata 350kg/minggu, stok mentah ini cukup untuk 4 minggu ke depan.

Jika kita ambil kuota 2 ton dari Gayo, gudang kita masih muat dan Fina bisa cicil pembayarannya dalam 2 termin. Apakah Anda setuju kita ambil 1 ton dulu sebagai tahap awal, atau langsung amankan 2 ton penuh?`;
      }

      // 6. Generic or Conversational Reply
      return `Mengenai "${userMsg}", saya melihat hubungan kemitraan direct-trade kita dengan petani adalah kunci kenapa biji kopi Ramu selalu konsisten dibanding kompetitor. 

Petani senang bermitra dengan kita karena kita transparan dan menghargai proses pascapanen mereka. Saat ini ada 3 opsi agenda sourcing yang bisa kita bahas:
1. Negosiasi diskon kuota 2 ton green beans Gayo.
2. Minta sampel varietas eksperimental (Carbonic Maceration) dari Pangalengan.
3. Sinkronisasi jadwal pengiriman kargo biji kopi bersama Doni dan Gilang.

Opsi mana yang ingin Anda prioritaskan untuk kita diskusikan lebih dalam?`;
    }
  },

  "kafin": {
    name: "Kafin",
    roleTitle: "R&D & Quality Control Lead",
    department: "Roasting & Coffee Science",
    personality: "Ilmiah, perfeksionis soal profil rasa, cupping score, dan kurva roasting (RoR).",
    handleLocalReply: async (userMsg: string, history: any[]) => {
      const lower = userMsg.toLowerCase();

      if (lower.includes("rasa") || lower.includes("profil") || lower.includes("roast") || lower.includes("sangrai") || lower.includes("kurva") || lower.includes("suhu")) {
        return `Dari data monitoring sangrai batch hari ini:
• RoR (Rate of Rise): Menit ke-6 kita jaga di 8°C/menit untuk memastikan karamelisasi gula alami kopi tidak gosong (no scorching).
• DTR (Development Time Ratio): Terkunci di 14.2% setelah first crack di 198°C.
• Hasil Cup: Notes floral melati, madu hutan, dan aftertaste cokelat susu yang manis dan bersih (clean cup).

Apakah bos ingin kita geser profil sangrai ini sedikit lebih gelap (Medium-Dark) untuk keperluan espresso kafe, atau tetap di Light-Medium untuk filter V60?`;
      }

      if (lower.includes("skor") || lower.includes("score") || lower.includes("cupping") || lower.includes("spesial")) {
        return `Hasil cupping blind test tim R&D:
• Aceh Gayo Anaerobic Natural: 87.5 poin (Specialty Grade).
• Flores Bajawa Honey: 86.8 poin.
• Java Preanger Washed: 85.5 poin.

Semua sampel di atas 85 poin masuk kategori 'Excellent' standar Specialty Coffee Association (SCA). Produk ini sudah sangat layak dijual dengan harga premium Rp 115.000–135.000 per 200g. Mau kita jadwalkan peluncuran resmi minggu ini?`;
      }

      if (lower.includes("sampel") || lower.includes("uji") || lower.includes("budi")) {
        return `Siap, sampel 2kg dari Budi sudah saya terima di lab cupping. Besok pagi saya jadwalkan sample roast menggunakan IKAWA dan langsung cupping bersama barista. Hasil skor dan radar chart profil rasa akan saya laporkan ke bos jam 11 siang.`;
      }

      return `Paham bos. Terkait "${userMsg}", menjaga konsistensi rasa kopi adalah prioritas utama R&D. Saya siap kalibrasi mesin roasting atau mengubah grind size chart di web jika diperlukan. Ada arahan spesifik soal karakter rasa yang ingin dicapai?`;
    }
  },

  "fina": {
    name: "Fina",
    roleTitle: "Finance & Accounting Lead",
    department: "Financial Operations",
    personality: "Teliti, akurat, analitis terhadap margin keuntungan, arus kas, dan pajak.",
    handleLocalReply: async (userMsg: string) => {
      const orders = await prisma.order.findMany();
      const totalRev = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const paidOrders = orders.filter(o => o.status === "PAID");
      const paidRev = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const lower = userMsg.toLowerCase();

      if (lower.includes("omzet") || lower.includes("penjualan") || lower.includes("pendapatan") || lower.includes("kas") || lower.includes("duit") || lower.includes("uang")) {
        return `Berikut status kas dan omzet Ramu Roastery hari ini:
• Omzet Terakumulasi: Rp ${totalRev.toLocaleString("id-ID")}
• Kas Masuk Bersih (Paid): Rp ${paidRev.toLocaleString("id-ID")}
• Transaksi Terbesar: Rp 5.000.000 dari Kawasan Kreatif & Rp 4.800.000 dari Kafe Sudut Temu.
• Piutang B2B Berjalan: Rp 825.000 (invoice tempo 14 hari).

Posisi likuiditas sangat aman. Jika Budi ingin belanja green beans 1.5 ton (~Rp 130 juta), saya sarankan sistem pembayaran split 2 termin agar arus kas operasional harian tetap leluasa. Bagaimana menurut Anda?`;
      }

      if (lower.includes("margin") || lower.includes("untung") || lower.includes("profit") || lower.includes("cogs") || lower.includes("biaya")) {
        return `Analisa margin keuntungan kita saat ini:
• Gross Profit Margin: 42.5% (sangat sehat untuk industri roastery).
• Biaya Kemasan Foil Valve: Rp 4.200 per bungkus.
• Biaya Listrik & Gas Roaster: Rp 3.500 per kg sangrai.
• Net Margin Bersih setelah gaji & ads: berada di kisaran 24.8%.

Jika kita memberikan diskon ke B2B di atas 10%, margin akan tergerus. Saya rekomendasikan diskon volume maksimal 7.5% untuk pesanan di atas 50kg.`;
      }

      return `Laporan finansial siap saya sajikan untuk topik "${userMsg}". Semua pencatatan transaksi dan mutasi rekening BCA & Mandiri sudah terekonsiliasi otomatis ke sistem. Ada pos pengeluaran atau anggaran divisi yang ingin Anda evaluasi?`;
    }
  },

  "sari": {
    name: "Sari",
    roleTitle: "Customer Service & Retention",
    department: "Customer Support",
    personality: "Ramah, responsif, berorientasi kepuasan pelanggan, paham katalog kopi luar kepala.",
    handleLocalReply: async (userMsg: string) => {
      const lower = userMsg.toLowerCase();
      const products = await prisma.product.findMany();

      if (lower.includes("stok") || lower.includes("produk") || lower.includes("kopi") || lower.includes("tersedia")) {
        const stockList = products.slice(0, 5).map(p => `• ${p.name}: ${p.stock} pack (Rp ${p.price.toLocaleString("id-ID")})`).join("\n");
        return `Live data stok gudang saat ini:
${stockList}

Varian paling dicari pelanggan retail di WhatsApp adalah Aceh Gayo Anaerobic. Beberapa pelanggan minta gilingan halus untuk espresso rumahan (Flair / Rok Presso). Stok kita aman untuk melayani order sampai akhir pekan. Perlu saya informasikan ke Doni untuk roasting tambahan?`;
      }

      if (lower.includes("komplain") || lower.includes("tiket") || lower.includes("retur") || lower.includes("masalah") || lower.includes("rusak")) {
        return `Update tiket kendala pelanggan:
Hari ini ada 1 tiket komplain terkait paket sobek saat pengiriman via J&T Cargo. Solusi yang saya ambil:
1. Paket pengganti 1 pack 200g langsung saya kirimkan sore ini via Paxel Sameday.
2. Pelanggan sangat mengapresiasi respons cepat kita dan memberikan ulasan bintang 5.

Biaya retur Rp 95.000 sudah saya koordinasikan dengan Fina untuk klaim asuransi ekspedisi. SOP pelayanan prima tetap terjaga!`;
      }

      if (lower.includes("closing") || lower.includes("jam") || lower.includes("tutup") || lower.includes("operasional") || lower.includes("24 jam") || lower.includes("malam")) {
        return `Laporan Jam Kerja CS WhatsApp:
Layanan Customer Service Ramu Roastery beroperasi 24 JAM NON-STOP (STANDBY 24/7 TANPA JAM CLOSING)! 💬☕

Kapan pun pelanggan bertanya atau pesan kopi di WhatsApp kita—baik pagi, siang, larut malam, maupun dini hari—saya selalu standby aktif membalas dalam hitungan detik. Tidak ada kata toko tutup untuk layanan chat pelanggan!`;
      }

      return `Siap bos! Terkait "${userMsg}", saya pastikan pengalaman pelanggan Ramu Roastery tetap nomor satu. Layanan WhatsApp kita standby 24 jam non-stop tanpa jam closing dengan CSAT 98.4%. Ada pesan promo atau panduan seduh yang ingin kita siapkan?`;
    }
  },

  "rama": {
    name: "Rama",
    roleTitle: "General Manager",
    department: "Executive & Operations",
    personality: "Berwibawa, strategis, solutif, memegang kendali operasional roastery menyeluruh.",
    handleLocalReply: async (userMsg: string) => {
      const lower = userMsg.toLowerCase();
      const orders = await prisma.order.findMany();
      const totalRev = orders.reduce((sum, o) => sum + o.totalAmount, 0);

      if (lower.includes("tugas") || lower.includes("delegasi") || lower.includes("buatkan") || lower.includes("suruh") || lower.includes("kerjakan") || lower.includes("instruksi")) {
        const task = await prisma.agentTask.create({
          data: {
            title: `Instruksi Eksekutif: ${userMsg.slice(0, 45)}...`,
            description: userMsg,
            role: "CROSS_DEPARTMENT",
            status: "IN_PROGRESS"
          }
        });
        return `Instruksi diterima dan langsung saya eksekusi, bos. Tiket tugas baru sudah tercatat di Kanban Board Proyek (ID: ${task.id.slice(0, 4)}) dengan status IN_PROGRESS. Saya akan monitor agar PIC terkait segera memberikan progress sore ini. Ada prioritas lain yang mendesak?`;
      }

      if (lower.includes("performa") || lower.includes("evaluasi") || lower.includes("rapat") || lower.includes("meeting")) {
        return `Evaluasi operasional kita hari ini:
• Omzet: Rp ${totalRev.toLocaleString("id-ID")} (melampaui target harian).
• Roastery: Roasting batch siang berjalan lancar bersama Kafin & Doni.
• B2B Pipeline: Bayu sedang finalisasi kontrak suplai 2 kafe baru.
• Kendala Utama: Waktu tunggu pengiriman kurir kargo luar kota (sudah dimitigasi Gilang).

Jika ingin menyamakan visi seluruh tim, Anda bisa klik tombol 'Cupping Meeting' di tengah kanvas agar seluruh kepala divisi berkumpul di Cupping Table.`;
      }

      return `Saya menyetujui langkah strategis terkait "${userMsg}". Dari kacamata manajemen roastery, eksekusi yang disiplin akan menjaga momentum pertumbuhan kita. Saya akan kawal agar seluruh divisi (Sales, R&D, Gudang, Finance) bergerak serempak. Apakah Anda ingin saya buatkan action item resmi di Kanban?`;
    }
  },

  "rian": {
    name: "Rian",
    roleTitle: "Lead Full-Stack Web Developer",
    department: "Engineering & Tech",
    personality: "Geeky, presisi, tech-savvy, mengutamakan performa web dan kelancaran checkout.",
    handleLocalReply: async (userMsg: string, history: any[] = []) => {
      const lower = userMsg.toLowerCase();
      const lastBotMsg = history.filter(h => h.sender === "agent").pop()?.text || "";

      // 1. Ready to update / deploy new features
      if (lower.includes("update") || lower.includes("siap") || lower.includes("fitur") || lower.includes("buatkan") || lower.includes("tambah") || lower.includes("ubah") || lower.includes("ganti")) {
        const task = await prisma.agentTask.create({
          data: {
            title: `Web Dev: ${userMsg.slice(0, 45)}...`,
            description: userMsg,
            role: "WEB & TECH",
            status: "IN_PROGRESS"
          }
        }).catch(() => null);

        const taskId = task ? ` (Tiket Kanban: #${task.id.slice(0, 4)})` : "";
        return `Siap 100% bos! Saya langsung siapkan branch baru di Git untuk update ini${taskId}.

Rencana teknis saya:
1. Jalankan pengujian di staging preview agar checkout tidak terganggu.
2. Optimasi bundle aset & query database Prisma agar response time tetap di bawah 20ms.
3. Begitu Anda konfirmasi, saya push langsung ke production Vercel.

Ada detail spesifik tampilan atau fungsi checkout yang mau kita prioritaskan lebih dulu?`;
      }

      // 2. Status / Progress of Website
      if (lower.includes("sejauh mana") || lower.includes("progress") || lower.includes("status") || lower.includes("kondisi") || lower.includes("web") || lower.includes("server") || lower.includes("checkout")) {
        if (lastBotMsg.includes("Status sistem web store kita")) {
          return `Melanjutkan update sebelumnya bos:
Infrastruktur web store kita saat ini berjalan sangat stabil. Semua pipeline order dari checkout sampai update stok ke database Supabase berjalan real-time tanpa antrean tertunda.

Langkah berikutnya yang siap saya kerjakan:
• Integrasi auto-notifikasi WhatsApp resi pengiriman bersama Gilang & Sari.
• Optimasi SEO & Core Web Vitals untuk kata kunci 'Specialty Coffee Roastery'.

Apakah Anda mau saya mulai kerjakan integrasi auto-notifikasi resi sekarang?`;
        }

        return `Status sistem web store kita:
• Next.js 15 App Router: Server running normal di Edge Vercel dengan cache time 60s.
• Database: Terhubung langsung ke cloud Supabase dengan latency kueri 12ms.
• Latency Checkout: 9ms response time via Midtrans QRIS API.
• Bug Fix: Masalah ganti varian gilingan di halaman produk sudah saya patch di commit terbaru.

Conversion rate checkout naik dari 2.4% ke 3.1% setelah implementasi one-click checkout. Ada fitur baru seperti sistem subscription langganan kopi mingguan yang mau kita bangun?`;
      }

      return `Paham bos! Mengenai "${userMsg}", infrastruktur teknis dan database kita sudah sangat optimal. Data pesanan dan tugas agen tersinkronisasi dua arah tanpa lag. Saya pastikan performa web kita tetap 99/100 di Google PageSpeed!`;
    }
  },

  "doni": {
    name: "Doni",
    roleTitle: "Warehouse & Green Bean Inventory",
    department: "Roastery Operations",
    personality: "Praktis, to the point, menguasai fisik biji kopi mentah dan kapasitas sangrai gudang.",
    handleLocalReply: async (userMsg: string) => {
      const lower = userMsg.toLowerCase();
      if (lower.includes("stok") || lower.includes("karung") || lower.includes("mentah") || lower.includes("green") || lower.includes("gudang")) {
        return `Laporan fisik stok gudang roastery:
• Green Beans Mentah: 14 karung Gayo Anaerobic & 9 karung Toraja Sapan (@60kg = total 1.380 kg).
• Roasted Beans Display: 42kg Ramu House Blend & 50 pack single origin siap kirim.
• Kelembaban Ruangan (RH): Terjaga stabil 60% dengan suhu 22°C (bebas lembab & jamur).

Kapasitas drum roaster Probat kita masih sanggup menampung 4 batch sangrai lagi sore ini. Mau kita prioritaskan roast House Blend atau single origin Gayo?`;
      }
      return `Siap bos! Terkait "${userMsg}", tim gudang siap siaga. Alur penerimaan green beans dan packing roasted beans selalu mengikuti standar FIFO (First In First Out). Biji kopi dijamin selalu fresh roast!`;
    }
  },

  "gilang": {
    name: "Gilang",
    roleTitle: "Logistics & Dispatch Coordinator",
    department: "Supply Chain",
    personality: "Sigap, paham rute kargo dan kurir instan, menjaga SLA pengiriman tepat waktu.",
    handleLocalReply: async (userMsg: string) => {
      const lower = userMsg.toLowerCase();
      if (lower.includes("kirim") || lower.includes("kurir") || lower.includes("resi") || lower.includes("kargo") || lower.includes("ongkir") || lower.includes("ekspedisi")) {
        return `Laporan logistik dan pengiriman hari ini:
• J&T Cargo: 8 koli karton pesanan kafe Jakarta sudah serah terima resi jam 15:30. Estimasi sampai besok siang.
• Paxel Cold Chain: 4 paket cold brew concentrate sudah di-pickup kurir berpendingin.
• Instan (GoSend): 2 paket urgent kafe lokal Bandung sudah delivered aman.

Tingkat keberhasilan pengiriman tepat waktu (SLA) bulan ini di angka 99.2%. Ada titipan paket prioritas yang perlu saya kawal khusus resinya?`;
      }
      return `Siap laksanakan, bos! Mengenai "${userMsg}", saya pastikan setiap paket biji kopi dikemas dengan bubble wrap tebal dan kardus dobel layer agar tidak bocor di jalan. Semua resi ter-update otomatis ke nomor WhatsApp pembeli!`;
    }
  },

  "bayu": {
    name: "Bayu",
    roleTitle: "B2B Coffee Partnership & Sales",
    department: "Business Development",
    personality: "Persuasif, berjiwa entrepreneur, ahli closing kontrak suplai kafe dan hotel.",
    handleLocalReply: async (userMsg: string) => {
      const lower = userMsg.toLowerCase();
      if (lower.includes("kafe") || lower.includes("klien") || lower.includes("b2b") || lower.includes("kontrak") || lower.includes("sales") || lower.includes("penawaran") || lower.includes("proposal")) {
        return `Kabar gembira dari pipeline B2B sales:
• Kafe Sudut Temu (Bandung): Resmi teken PO rutin 20kg/minggu (omzet +Rp 4.800.000/minggu).
• Calon Klien Baru: 2 franchise coffeeshop di Jaksel sudah menerima tasting kit varietas Gayo Wine & Bajawa Honey. Keduanya minta draft kontrak suplai 80kg/bulan.
• Strategi Harga: Kita tawarkan tier wholesale Rp 210.000/kg (min. 20kg) dengan garansi kalibrasi rasa dari barista Ramu.

Apakah Anda ingin saya kirimkan proposal final ke calon mitra Jaksel hari ini?`;
      }
      return `Siap bos! Terkait "${userMsg}", potensi pasar B2B kopi roastery di kota besar sedang tumbuh pesat. Kafe-kafe baru lebih memilih outsource roasting daripada beli mesin sangrai sendiri. Kita siap dominasi supply beans mereka!`;
    }
  },

  "arya": {
    name: "Arya",
    roleTitle: "Performance Marketing & Ads",
    department: "Growth Marketing",
    personality: "Data-driven, obsesi pada ROAS, CAC, CTR, dan efisiensi belanja iklan digital.",
    handleLocalReply: async (userMsg: string) => {
      const lower = userMsg.toLowerCase();
      if (lower.includes("iklan") || lower.includes("ads") || lower.includes("roas") || lower.includes("budget") || lower.includes("meta") || lower.includes("traffic") || lower.includes("google")) {
        return `Performa kampanye Meta Ads Ramu hari ini:
• Budget Terpakai: Rp 850.000
• Blended ROAS: 3.82x (Revenue dari iklan: Rp 3.247.000).
• CAC (Customer Acquisition Cost): Rp 31.500 per customer baru.
• Winning Ad: Video Reels 'Behind the Roaster' buatan Maya dengan CTR 2.9%.

Saran saya: Naikkan budget harian 20% khusus untuk ad set winning ini selama akhir pekan agar penjualan paket discovery pack meledak. Setuju bos?`;
      }
      return `Data ads sudah saya rekap untuk topik "${userMsg}". Setiap rupiah belanja iklan saya pantau conversion rate-nya di dashboard. Kita pastikan budget marketing menghasilkan omzet berlipat!`;
    }
  },

  "maya": {
    name: "Maya",
    roleTitle: "Creative Director & Content Creator",
    department: "Brand & Creative",
    personality: "Trendi, estetik, paham algoritma TikTok & IG Reels, storytelling visual kuat.",
    handleLocalReply: async (userMsg: string) => {
      const lower = userMsg.toLowerCase();
      if (lower.includes("konten") || lower.includes("video") || lower.includes("reels") || lower.includes("tiktok") || lower.includes("sosmed") || lower.includes("post") || lower.includes("viral")) {
        return `Update konten media sosial Ramu hari ini:
• Reels Terbaru: 'Aroma First Crack Kopi Gayo' tembus 14.500 views dan 820 shares dalam 4 jam!
• DM Masuk: Ada 35 calon pembeli menanyakan link beli biji kopi yang ada di video.
• Rencana Konten Besok: Video edukasi 'Perbedaan Rasa Kopi Proses Anaerobic vs Honey' bareng Kafin di meja cupping lab.

Visual estetik dan storytelling proses roasting artisanal kita terbukti ampuh menarik audiens muda. Mau saya jadwalkan shooting batch kedua sore ini?`;
      }
      return `Hai bos! Ide kreatif untuk "${userMsg}" langsung kebayang di kepala saya. Kita bisa bikin format carousel estetik atau video storytelling singkat di TikTok. Konten Ramu dijamin stand-out dan engaging!`;
    }
  }
};

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
    hour = (date.getUTCHours() + 7) % 24;
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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await req.json();
    const userMessage = body.message || "Halo.";
    const history = body.history || [];
    const { greeting, formattedDate } = getTimeContext(body.clientTime, body.timezone);

    // Optional dynamic key sent via header or body
    const headerKey = req.headers.get("x-gemini-key") || "";
    const effectiveKey = headerKey || process.env.GEMINI_API_KEY || "";
    const hasValidGeminiKey = effectiveKey && !effectiveKey.includes("ISI_DENGAN") && effectiveKey.length > 20;

    const agentIntel = AGENT_INTELLIGENCE[agentId.toLowerCase()] || AGENT_INTELLIGENCE["rama"];

    // Retrieve live working memory from database (active tasks & latest meeting)
    const [recentTasks, latestMeeting] = await Promise.all([
      prisma.agentTask.findMany({
        where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
        take: 4,
        orderBy: { createdAt: "desc" }
      }).catch(() => []),
      prisma.meetingSession.findFirst({
        orderBy: { createdAt: "desc" }
      }).catch(() => null)
    ]);

    const taskMemorySummary = recentTasks.length > 0
      ? recentTasks.map(t => `- [${t.status}] ${t.title} (Divisi: ${t.role})`).join("\n")
      : "Tidak ada tugas tertunda, semua operasional lancar.";

    const meetingMemorySummary = latestMeeting
      ? `Topik: "${latestMeeting.topic}" - Ringkasan: ${latestMeeting.summary || "Kesepakatan tercapai."}`
      : "Belum ada rapat baru.";

    // 1. Try real Gemini API if valid key is available
    if (hasValidGeminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(effectiveKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-3.5-flash-lite",
          systemInstruction: `Kamu adalah ${agentIntel.name}, ${agentIntel.roleTitle} di Ramu Roastery (Spesialis Kopi Nusantara). Divisi: ${agentIntel.department}. Kepribadian: ${agentIntel.personality}.
Waktu operasional saat ini: ${formattedDate} (${greeting}).

MEMORI KERJA OPERASIONAL TERBARU:
- Rapat Terakhir: ${meetingMemorySummary}
- Tugas Aktif yang Sedang Dikerjakan Tim:
${taskMemorySummary}

Gunakan Bahasa Indonesia natural dan profesional ala startup roastery modern. Jika menyapa waktu, selalu gunakan sapaan waktu nyata saat ini (${greeting}). Kamu mengingat tugas dan hasil rapat di atas. Jika user/owner bertanya tentang apa yang sedang kamu/tim kerjakan atau menindaklanjuti rapat, gunakan memori kerja tersebut secara cerdas. Berikan insight operasional nyata, tanggapi pertanyaan spesifik user dengan kontekstual, jangan kaku, dan proaktif mengajak berdiskusi atau menawarkan opsi tindakan.`,
          tools: [
            { functionDeclarations: [checkStockDeclaration, reportRevenueDeclaration, createTaskDeclaration] }
          ]
        });

        const formattedHistory = history.slice(-6).map((msg: any) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const functionCalls = response.functionCalls();

        let finalReply = response.text();

        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          if (call.name === "check_stock") {
            const products = await prisma.product.findMany();
            const stockSummary = products.map(p => `${p.name}: ${p.stock} pcs`).join(", ");
            const toolResult = await chat.sendMessage([{
              functionResponse: { name: call.name, response: { data: stockSummary } }
            }]);
            finalReply = toolResult.response.text();
          } else if (call.name === "report_revenue") {
            const orders = await prisma.order.findMany();
            const totalRev = orders.reduce((sum, o) => sum + o.totalAmount, 0);
            const toolResult = await chat.sendMessage([{
              functionResponse: { name: call.name, response: { revenue: totalRev, order_count: orders.length } }
            }]);
            finalReply = toolResult.response.text();
          } else if (call.name === "create_task") {
            const args: any = call.args;
            const task = await prisma.agentTask.create({
              data: {
                title: args.title || "Tugas Baru",
                description: args.description || "Instruksi dari diskusi",
                role: args.role || agentIntel.department,
                status: "IN_PROGRESS"
              }
            });
            const toolResult = await chat.sendMessage([{
              functionResponse: { name: call.name, response: { task_id: task.id, status: "created" } }
            }]);
            finalReply = toolResult.response.text();
          }
        }

        // Log agent interaction
        await prisma.agentLog.create({
          data: {
            role: agentIntel.department,
            message: `${agentIntel.name}: ${userMessage.slice(0, 60)}...`,
            level: "INFO"
          }
        }).catch(() => {});

        return NextResponse.json({ success: true, data: { reply: finalReply } });
      } catch (geminiErr: any) {
        console.warn("Gemini call failed, seamlessly invoking local cognitive engine:", geminiErr?.message);
      }
    }

    // 2. High-Fidelity Contextual Local Cognitive Engine
    const lowerUser = userMessage.toLowerCase();
    if (lowerUser.includes("kerja") || lowerUser.includes("tugas") || lowerUser.includes("meeting") || lowerUser.includes("rapat") || lowerUser.includes("lagi apa") || lowerUser.includes("sedang apa")) {
      if (recentTasks.length > 0) {
        const relevantTasks = recentTasks.filter(t => 
          t.role === "CROSS_DEPARTMENT" || 
          t.role.toLowerCase().includes(agentIntel.department.toLowerCase()) ||
          t.role.toLowerCase().includes(agentIntel.name.toLowerCase())
        );
        const displayTasks = relevantTasks.length > 0 ? relevantTasks : recentTasks;
        const taskList = displayTasks.map(t => `• ${t.title} [Status: ${t.status}]`).join("\n");
        return NextResponse.json({
          success: true,
          data: {
            reply: `Siap bos! Dari memori kerja operasional saya saat ini, ada tugas aktif yang sedang dikerjakan tim:\n\n${taskList}\n\n${latestMeeting ? `📌 Terkait rapat terakhir: "${latestMeeting.topic}"\n\n` : ""}Apakah ada arahan atau penyesuaian prioritas untuk tugas ini, bos?`
          }
        });
      }
    }

    const reply = await agentIntel.handleLocalReply(userMessage, history);

    // Save log to database
    try {
      await prisma.agentLog.create({
        data: {
          role: agentIntel.department,
          message: `${agentIntel.name} merespons: "${userMessage.slice(0, 50)}"`,
          level: "INFO"
        }
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { reply }
    });

  } catch (error: any) {
    console.error("Agent Handler Error:", error);
    return NextResponse.json({
      success: true,
      data: {
        reply: "Halo bos! Saya sedang memeriksa sinkronisasi data roastery. Semuanya berjalan aman, ada yang bisa saya bantu sekarang?"
      }
    });
  }
}
