import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { port } from "./config.js";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import reviewsRoutes from "./routes/reviews.js";

const app: Express = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
  res.send("ProductsAPP Server is running");
});

app.use("/auth", authRoutes);
app.use("/products", productsRoutes);
app.use("/reviews", reviewsRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running`);
});

export default app;
