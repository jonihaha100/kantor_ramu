import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tasks = await prisma.agentTask.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const task = await prisma.agentTask.create({
      data: {
        title: body.title,
        description: body.description || "",
        role: body.role || "GENERAL_MANAGER",
        status: body.status || "PENDING"
      }
    });
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }
    const updated = await prisma.agentTask.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
