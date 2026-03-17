import { Response, NextFunction } from "express";
import { TenantRequest } from "../middlewares/tenant.middleware";
import { prisma } from "../config/prisma";

export const createLead = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.academy) {
      return res.status(400).json({ message: "Academia no resuelta" });
    }

    const {
      name,
      parentName,
      phone,
      email,
      childAge,
      interestProgram
    } = req.body;

    const lead = await prisma.lead.create({
      data: {
        academyId: req.academy.id,
        name,
        parentName,
        phone,
        email,
        childAge,
        interestProgram
      }
    });

    return res.status(201).json(lead);
  } catch (error) {
    return next(error);
  }
};

export const listLeads = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.academy) {
      return res.status(400).json({ message: "Academia no resuelta" });
    }

    const { status } = req.query;

    const leads = await prisma.lead.findMany({
      where: {
        academyId: req.academy.id,
        status: status ? String(status).toUpperCase() : undefined
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(leads);
  } catch (error) {
    return next(error);
  }
};

