import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { json } from "body-parser";
import { port } from "./config";
import morgan from "morgan";

// import authRoutes from "./routes/auth";

const app: Express = express();

app.use(json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
  res.send("ProductsAPP Server is running");
});

// app.use("/auth", authRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
