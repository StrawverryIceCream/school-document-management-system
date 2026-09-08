import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ 
  origin: process.env.CLIENT_ORIGIN!, 
  credentials: true 
}));

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server on ${PORT}`));
