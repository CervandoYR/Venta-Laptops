import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const tickets = await prisma.ticket.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        client: { select: { id: true, name: true, phone: true, email: true, document: true } },
        technician: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ── Resolve client: use existing or auto-create a new one ──
    let resolvedClientId: string | null = body.clientId || null;

    if (!resolvedClientId && body.clientName?.trim()) {
      const newClient = await prisma.client.create({
        data: {
          name: body.clientName.trim(),
          phone: body.clientPhone?.trim() || null,
          email: body.clientEmail?.trim() || null,
          document: body.clientDocument?.trim() || null,
        },
      });
      resolvedClientId = newClient.id;
    }

    if (!resolvedClientId) {
      return new NextResponse("Se requiere un cliente para crear la orden.", { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        clientId: resolvedClientId,
        technicianId: body.technicianId || null,
        deviceType: body.deviceType,
        deviceBrand: body.deviceBrand,
        deviceModel: body.deviceModel,
        deviceProcessor: body.deviceProcessor,
        deviceRam: body.deviceRam,
        deviceGpu: body.deviceGpu,
        deviceDisks: body.deviceDisks,
        devicePowerSupply: body.devicePowerSupply,
        deviceHasCharger: !!body.deviceHasCharger,
        physicalCondition: body.physicalCondition ?? {},
        accessories: body.accessories ?? {},
        issueReported: body.issueReported,
        issueNotes: body.issueNotes,
        status: body.status || "PENDING",
        totalAmount: Number(body.totalAmount) || 0,
        paidAmount: Number(body.paidAmount) || 0,
        paymentStatus: body.paymentStatus || "PENDING",
      },
      include: {
        client: true,
        technician: true,
      },
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return new NextResponse(error.message || "Internal server error", { status: 500 });
  }
}
