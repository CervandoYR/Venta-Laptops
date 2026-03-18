import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { document: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, document } = body;

    // Check if email already exists (only if provided)
    if (email) {
      // NOTE: emails are not unique in standard setup for pos clients, but let's just make sure there isn't a strict conflict if the schema demands it.
      // In our schema, the Client email is not marked as @unique, so we can skip this check or keep it as a soft warning.
    }

    const client = await prisma.client.create({
      data: {
        name: name || "Cliente " + Date.now().toString().slice(-4),
        email: email || null,
        phone: phone || "000000000",
        document: document || null,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
