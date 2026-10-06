import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Ramu Roastery database...");

  // 1. Clean existing records
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.agentLog.deleteMany();
  await prisma.agentTask.deleteMany();
  await prisma.meetingSession.deleteMany();

  // 2. Seed Products
  const products = [
    { name: "Aceh Gayo Anaerobic Natural (200g)", description: "Notes of blackcurrant, dried figs, winey acidity", price: 115000, stock: 85 },
    { name: "Flores Bajawa Honey (200g)", description: "Notes of sweet chocolate, hazelnut, hints of floral orange", price: 95000, stock: 120 },
    { name: "Java Preanger Washed (200g)", description: "Clean cup, bright citrus, brown sugar finish", price: 85000, stock: 64 },
    { name: "Ramu House Blend Espresso (1kg)", description: "Blend 70% Arabica Gayo & 30% Robusta Dampit for rich crema", price: 240000, stock: 42 },
    { name: "Toraja Sapan Full Washed (200g)", description: "Herbal aroma, cedar, dark chocolate, heavy body", price: 110000, stock: 50 },
    { name: "Bali Kintamani Carbonic (200g)", description: "Fruity strawberry, passion fruit, sparkling acidity", price: 135000, stock: 38 },
    { name: "Green Beans: Aceh Gayo Grade 1 (60kg)", description: "Raw unroasted green coffee beans from Central Aceh", price: 8400000, stock: 14 },
    { name: "Green Beans: Toraja White Honey (60kg)", description: "Specialty green beans direct trade from Sapan farmers", price: 9200000, stock: 9 },
  ];

  const createdProducts = [];
  for (const p of products) {
    const item = await prisma.product.create({ data: p });
    createdProducts.push(item);
  }

  // 3. Seed Orders (Today's realistic sales)
  const orders = [
    {
      customerName: "Kafe Sudut Temu (B2B Bandung)",
      customerEmail: "order@suduttemu.id",
      totalAmount: 4800000,
      status: "PAID",
      items: [
        { productId: createdProducts[3].id, quantity: 20, price: 240000 }
      ]
    },
    {
      customerName: "Kopi Senja Collective (B2B Jakarta)",
      customerEmail: "manager@senjacollective.com",
      totalAmount: 3600000,
      status: "PAID",
      items: [
        { productId: createdProducts[3].id, quantity: 15, price: 240000 }
      ]
    },
    {
      customerName: "Bramantyo Kusumo",
      customerEmail: "bramantyo.k@gmail.com",
      totalAmount: 345000,
      status: "SHIPPED",
      items: [
        { productId: createdProducts[0].id, quantity: 3, price: 115000 }
      ]
    },
    {
      customerName: "Dian Sastrowardoyo",
      customerEmail: "dian.s@agency.co.id",
      totalAmount: 480000,
      status: "SHIPPED",
      items: [
        { productId: createdProducts[3].id, quantity: 2, price: 240000 }
      ]
    },
    {
      customerName: "Kawasan Kreatif Workspace",
      customerEmail: "procurement@kawasankreatif.id",
      totalAmount: 5000000,
      status: "PAID",
      items: [
        { productId: createdProducts[1].id, quantity: 20, price: 95000 },
        { productId: createdProducts[4].id, quantity: 28, price: 110000 }
      ]
    }
  ];

  for (const o of orders) {
    const createdOrder = await prisma.order.create({
      data: {
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        totalAmount: o.totalAmount,
        status: o.status,
      }
    });

    for (const item of o.items) {
      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }
      });
    }
  }

  // 4. Seed Realistic Agent Tasks across departments
  const tasks = [
    {
      role: "R&D / QUALITY",
      title: "Kalibrasi Profil Roasting Gayo Honey Batch #14",
      description: "Menyesuaikan RoR (Rate of Rise) pada fase first crack agar acidity buah tetap juicy tanpa roast defect baked.",
      status: "IN_PROGRESS"
    },
    {
      role: "B2B SALES",
      title: "Follow Up PO 120kg Biji Kopi Kafe Sudut Temu",
      description: "Konfirmasi draft invoice dan terms of payment 14 hari dengan purchasing manager.",
      status: "PENDING"
    },
    {
      role: "WEB & TECH",
      title: "Optimasi Checkout Flow & Integrasi Payment Midtrans",
      description: "Menurunkan abandoned cart rate dengan one-click QRIS checkout pada web store Ramu.",
      status: "IN_PROGRESS"
    },
    {
      role: "CREATIVE & MARKETING",
      title: "Produksi Reels Edukasi 'Grind Size untuk V60'",
      description: "Video visual aesthetic proses blooming kopi dengan target reach 50k views organik.",
      status: "IN_PROGRESS"
    },
    {
      role: "LOGISTICS",
      title: "Dispatch Kurir Cargo Pengiriman Jakarta & Bali",
      description: "Serah terima 8 koli karton biji kopi ke J&T Cargo sebelum cut-off jam 16:00.",
      status: "PENDING"
    },
    {
      role: "FINANCE",
      title: "Rekap Pembukuan Harian & Faktur Pajak PPN",
      description: "Validasi rekonsiliasi mutasi bank BCA & Mandiri untuk transaksi masuk hari ini.",
      status: "PENDING"
    },
    {
      role: "SOURCING",
      title: "Direct Trade Green Beans Petani Pangalengan",
      description: "Kontrak 2 ton varietas Sigarar Utang fermentasi anaerobik 72 jam berhasil diteken.",
      status: "COMPLETED"
    },
    {
      role: "ADS SPECIALIST",
      title: "Evaluasi ROAS Meta Ads Ramu Discovery Pack",
      description: "Kampanye mencapai ROAS 3.8x dengan CTR 2.4% melampaui KPI target 2.5x.",
      status: "COMPLETED"
    },
    {
      role: "CUSTOMER SERVICE",
      title: "Resolusi Tiket CS Gilingan Fine Espresso",
      description: "Pelanggan sudah diberikan panduan kalibrasi grinder Timemore C2 dan menyatakan puas bintang 5.",
      status: "COMPLETED"
    }
  ];

  for (const t of tasks) {
    await prisma.agentTask.create({ data: t });
  }

  // 5. Seed Activity Logs
  const logs = [
    { role: "GENERAL_MANAGER", message: "Morning briefing selesai: target omzet roastery minggu ini Rp 85.000.000.", level: "INFO" },
    { role: "ROASTER_EXPERT", message: "Suhu drum roaster Probat mencapai 205°C, batch pertama Gayo Anaerobic dimulai.", level: "INFO" },
    { role: "CUSTOMER_SUPPORT", message: "Tiket #1042 terselesaikan dalam waktu respons 2 menit.", level: "INFO" },
    { role: "WEB_DEVELOPER", message: "Ping server stabil di 9ms, performa Next.js Core Web Vitals 99/100.", level: "INFO" },
    { role: "FINANCIAL_ANALYST", message: "Omzet harian tercatat Rp 14.225.000 dari 5 transaksi masuk.", level: "INFO" },
  ];

  for (const l of logs) {
    await prisma.agentLog.create({ data: l });
  }

  console.log("Database successfully seeded with realistic Ramu Roastery operations!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
