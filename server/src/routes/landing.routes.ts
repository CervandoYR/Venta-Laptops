import { Router } from "express";
import { getLandingBlocks } from "../controllers/landing.controller";

export const landingRouter = Router();

landingRouter.get("/", getLandingBlocks);

