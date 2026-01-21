import { Router } from "express";
import { createUsersDetails } from "./users.controller.js";


const router = Router();

router.post("/create", createUsersDetails);

export default router;