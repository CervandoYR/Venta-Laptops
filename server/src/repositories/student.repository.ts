import { prisma } from "../config/prisma";

export class StudentRepository {
  async listByAcademy(
    academyId: string,
    filters: { search?: string; status?: string },
    pagination: { offset: number; limit: number }
  ) {
    const where: any = {
      academyId
    };

    if (filters.status) {
      where.status = filters.status.toUpperCase();
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { parentName: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.student.count({ where })
    ]);

    return { items, total };
  }

  async create(academyId: string, data: any) {
    return prisma.student.create({
      data: {
        ...data,
        academyId
      }
    });
  }
}

