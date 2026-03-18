import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true, document: true } },
        technician: true,
      },
    });

    if (!ticket) return new NextResponse("Servicio no encontrado", { status: 404 });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    
    // Solo extraemos los campos que queremos permitir actualizar (evitar inyección)
    const updateData: any = {
      clientId: body.clientId || undefined,
      technicianId: body.technicianId || null,
      deviceType: body.deviceType,
      deviceBrand: body.deviceBrand,
      deviceModel: body.deviceModel,
      deviceProcessor: body.deviceProcessor,
      deviceRam: body.deviceRam,
      deviceGpu: body.deviceGpu,
      deviceDisks: body.deviceDisks,
      devicePowerSupply: body.devicePowerSupply,
      deviceHasCharger: body.deviceHasCharger,
      physicalCondition: body.physicalCondition ?? undefined,
      accessories: body.accessories ?? undefined,
      issueReported: body.issueReported,
      issueNotes: body.issueNotes,
      status: body.status,
      totalAmount: body.totalAmount ? Number(body.totalAmount) : undefined,
      paidAmount: body.paidAmount !== undefined ? Number(body.paidAmount) : undefined,
      paymentStatus: body.paymentStatus,
      ...(body.invoiced !== undefined && { invoiced: Boolean(body.invoiced) }),
      ...(body.notifiedClient !== undefined && { notifiedClient: Boolean(body.notifiedClient) }),
    };

    // Filtramos campos undefined o nulos (excepto los que sí permitimos borrar como technicianId)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const ticket = await prisma.ticket.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
        technician: true
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.ticket.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
