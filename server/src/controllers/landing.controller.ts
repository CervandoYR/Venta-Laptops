import { Response, NextFunction } from "express";
import { TenantRequest } from "../middlewares/tenant.middleware";
import { prisma } from "../config/prisma";

export const getLandingBlocks = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.academy) {
      return res.status(404).json({ message: "Academia no encontrada" });
    }

    const [blocks, settings] = await Promise.all([
      prisma.landingBlock.findMany({
        where: { academyId: req.academy.id, isActive: true },
        orderBy: { order: "asc" }
      }),
      prisma.landingSettings.findUnique({
        where: { academyId: req.academy.id }
      })
    ]);

    return res.json({ blocks, settings });
  } catch (error) {
    return next(error);
  }
};

