import { Router, type Response, type Request } from "express";

const router = Router();

interface SignupBody {
  email: string;
  password: string;
  name: string;
}

router.post(
  "/signup",
  async (req: Request<{}, {}, SignupBody>, res: Response) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    }
    res.json({ email, name });
  },
);

export default router;
