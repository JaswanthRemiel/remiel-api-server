import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import roasthubRoute from './routes/roasthub.js';

dotenv.config();
const app = express();

const allowedOriginRegex = /^https:\/\/remiel\.fyi$/;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOriginRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use('/roasthub', roasthubRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Unified backend running on port ${PORT}`);
});
