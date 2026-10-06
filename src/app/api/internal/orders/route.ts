import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const paidOrders = orders.filter(o => o.status === "PAID" || o.status === "SHIPPED");
    const paidRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        summary: {
          totalRevenue,
          paidRevenue,
          orderCount: orders.length,
          paidCount: paidOrders.length
        }
      }
    });
  } catch (error: any) {
    console.error("Orders GET Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, totalAmount, status, items } = body;

    if (!customerName || totalAmount === undefined) {
      return NextResponse.json({ error: "Nama pelanggan dan total nominal wajib diisi." }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail: customerEmail || null,
        totalAmount: parseFloat(totalAmount),
        status: status || "PAID"
      }
    });

    // If items are provided, insert them and optionally deduct product stock
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (item.productId && item.quantity) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: parseInt(item.quantity, 10),
              price: parseFloat(item.price || 0)
            }
          });

          // Deduct stock from product table
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: parseInt(item.quantity, 10)
              }
            }
          }).catch((err) => {
            console.warn("Could not decrement product stock:", err);
          });
        }
      }
    }

    // Record an agent log from Fina
    await prisma.agentLog.create({
      data: {
        role: "FINANCE",
        message: `Fina mencatat transaksi baru: "${customerName}" senilai Rp ${parseFloat(totalAmount).toLocaleString("id-ID")}`,
        level: "INFO"
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error("Orders POST Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to record order" }, { status: 500 });
  }
}
