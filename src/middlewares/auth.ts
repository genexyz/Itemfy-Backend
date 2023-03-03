import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtSecret } from "../config.js";

export interface CustomRequest extends Request {
  user?: JwtPayload;
}

export const isAuthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded === "string") {
      throw new Error("Token is not valid");
    }

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).send("Unauthorized");
  }
};
