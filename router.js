import express from "express";
import { generateRoast } from "./projects/roasthub/roasthub.js";

const router = express.Router();

//roasthub route
router.post("/roasthub/generate", generateRoast);

export default router;
