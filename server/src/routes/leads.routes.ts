import { Router } from "express";
import { createLead, listLeads } from "../controllers/leads.controller";

export const leadsRouter = Router();

// público (crear lead desde landing)
leadsRouter.post("/", createLead);

// privado (admin): en el futuro se protegerá con auth middleware
leadsRouter.get("/", listLeads);

