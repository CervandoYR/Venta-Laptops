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
    const {
      clientId,
      technicianId,
      deviceType,
      deviceBrand,
      deviceModel,
      deviceProcessor,
      deviceRam,
      deviceGpu,
      deviceDisks,
      devicePowerSupply,
      deviceHasCharger,
      issueReported,
      issueNotes,
      status,
      totalAmount,
      paidAmount,
      paymentStatus,
    } = body;

    const ticket = await prisma.ticket.create({
      data: {
        clientId,
        technicianId: technicianId || null,
        deviceType,
        deviceBrand,
        deviceModel,
        deviceProcessor,
        deviceRam,
        deviceGpu,
        deviceDisks,
        devicePowerSupply,
        deviceHasCharger: !!deviceHasCharger,
        issueReported,
        issueNotes,
        status: status || "PENDING",
        totalAmount: Number(totalAmount) || 0,
        paidAmount: Number(paidAmount) || 0,
        paymentStatus: paymentStatus || "PENDING",
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
