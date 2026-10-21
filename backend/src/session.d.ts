import "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    role?: string;
    officeId?: string | null;
  }
}
