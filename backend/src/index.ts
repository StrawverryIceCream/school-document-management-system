import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/auth.routes.js"
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN!,
    credentials: true,
  }),
);

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});
app.use(express.json());

app.get("/",(req, res) => res.send("hello") )

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));
