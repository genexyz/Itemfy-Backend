import dotenv from "dotenv";

dotenv.config();

export const port = Number(process.env.PORT);

export const db_URL = String(process.env.DB_URL);

export const jwtSecret = String(process.env.JWT_SECRET);
export const jwtRefreshSecret = String(process.env.JWT_REFRESH_SECRET);
