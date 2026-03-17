import { Response, NextFunction } from "express";
import { TenantRequest } from "../middlewares/tenant.middleware";
import { StudentService } from "../services/student.service";

const service = new StudentService();

export const listStudents = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.academy) {
      return res.status(400).json({ message: "Academia no resuelta" });
    }

    const { page = 1, limit = 20, search, status } = req.query;

    const data = await service.list(
      req.academy.id,
      {
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined
      },
      {
        offset: (Number(page) - 1) * Number(limit),
        limit: Number(limit)
      }
    );

    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

export const createStudent = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.academy) {
      return res.status(400).json({ message: "Academia no resuelta" });
    }

    const student = await service.create(req.academy.id, req.body);
    return res.status(201).json(student);
  } catch (error) {
    return next(error);
  }
};

