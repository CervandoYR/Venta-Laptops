import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export interface TenantRequest extends Request {
  academy?: { id: string; slug: string; name: string };
}

export const tenantResolver = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const host = req.hostname;
    const headerSlug = req.header("x-academy-slug");

    let slug = headerSlug || null;

    if (!slug && host && host.includes(".")) {
      const [sub] = host.split(".");
      if (sub && sub !== "www" && sub !== "app" && sub !== "localhost") {
        slug = sub;
      }
    }

    if (!slug) {
      return next();
    }

    const academy = await prisma.academy.findUnique({
      where: { slug }
    });

    if (!academy) {
      return res.status(404).json({ message: "Academia no encontrada" });
    }

    req.academy = {
      id: academy.id,
      slug: academy.slug,
      name: academy.name
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

