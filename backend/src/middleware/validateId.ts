import type { Request, Response, NextFunction } from "express";

function validateId(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  next();
}

export default validateId;
