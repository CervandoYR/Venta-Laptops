import { Router } from "express";
import { listStudents, createStudent } from "../controllers/students.controller";

export const studentsRouter = Router();

studentsRouter.get("/", listStudents);
studentsRouter.post("/", createStudent);

