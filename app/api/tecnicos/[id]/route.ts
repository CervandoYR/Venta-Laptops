import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tecnico = await prisma.technician.findUnique({
      where: { id: params.id },
    });

    if (!tecnico) return new NextResponse("Técnico no encontrado", { status: 404 });

    return NextResponse.json(tecnico);
  } catch (error) {
    console.error("Error fetching technician:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, phone, email, whatsapp } = body;

    const tecnico = await prisma.technician.update({
      where: { id: params.id },
      data: { name, phone, email, whatsapp },
    });

    return NextResponse.json(tecnico);
  } catch (error) {
    console.error("Error updating technician:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.technician.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting technician:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
