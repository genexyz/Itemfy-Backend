import express, { Router } from "express";
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

router.post("/", createProduct);

router.patch("/:id", updateProduct);

router.delete("/:id", deleteProduct);

export default router;
