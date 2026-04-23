import { JwtPayload } from "../domain/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
