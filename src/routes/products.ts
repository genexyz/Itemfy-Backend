import express, { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/products.js";

const router: Router = express.Router();

router.use(express.json());

router.get("/", getProducts);

router.get("/:id", getProduct);

router.post("/", isAuthenticated, createProduct);

router.patch("/:id", isAuthenticated, updateProduct);

router.delete("/:id", isAuthenticated, deleteProduct);

export default router;
