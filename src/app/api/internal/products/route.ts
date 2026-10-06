import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Products GET Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, stock } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({ error: "Nama, harga, dan stok wajib diisi." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "Specialty coffee product Ramu Roastery",
        price: parseFloat(price),
        stock: parseInt(stock, 10)
      }
    });

    // Log the action
    await prisma.agentLog.create({
      data: {
        role: "ROASTERY_INVENTORY",
        message: `Doni mencatat produk baru: "${product.name}" (${product.stock} pcs, Rp ${product.price.toLocaleString("id-ID")})`,
        level: "INFO"
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Products POST Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, stockDelta, setStock, setPrice, name, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let newStock = existing.stock;
    if (stockDelta !== undefined) {
      newStock = Math.max(0, existing.stock + parseInt(stockDelta, 10));
    } else if (setStock !== undefined) {
      newStock = Math.max(0, parseInt(setStock, 10));
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
        price: setPrice !== undefined ? parseFloat(setPrice) : existing.price,
        name: name || existing.name,
        description: description !== undefined ? description : existing.description
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Products PATCH Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Produk berhasil dihapus." });
  } catch (error: any) {
    console.error("Products DELETE Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete product" }, { status: 500 });
  }
}
