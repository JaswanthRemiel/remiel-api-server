import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import roasthubRoute from './routes/roasthub.js';

dotenv.config();
const app = express();

app.use(cors({ origin: ['https://roasthub.vercel.app'] }));
app.use(express.json());

app.use('/roasthub', roasthubRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Unified backend running on port ${PORT}`);
});
