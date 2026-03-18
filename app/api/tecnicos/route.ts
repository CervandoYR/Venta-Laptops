import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tecnicos = await prisma.technician.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tecnicos);
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, whatsapp } = body;

    if (!name) {
      return new NextResponse("El nombre es requerido", { status: 400 });
    }

    const tecnico = await prisma.technician.create({
      data: {
        name,
        phone,
        email,
        whatsapp
      },
    });

    return NextResponse.json(tecnico);
  } catch (error) {
    console.error("Error creating technician:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
