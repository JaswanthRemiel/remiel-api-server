import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import router from "./router.js";

dotenv.config();
const app = express();

const allowedOriginRegex = /^https:\/\/remiel\.work$/;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOriginRegex.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Unified backend running on port ${PORT}`);
});
