import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateRoast } from "./projects/roasthub/roasthub.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow all origins
app.use(cors());
app.use(express.json());
app.post("/roasthub/generate", generateRoast);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Local development server running on http://localhost:${PORT}`);
});
