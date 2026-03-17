import { Router } from "express";
import { landingRouter } from "./landing.routes";
import { leadsRouter } from "./leads.routes";
import { studentsRouter } from "./students.routes";

export const routes = Router();

routes.use("/landing", landingRouter);
routes.use("/leads", leadsRouter);
routes.use("/students", studentsRouter);

