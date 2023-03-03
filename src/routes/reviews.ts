import express, { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviews.js";

const router: Router = express.Router();

router.use(express.json());

router.get("/", getReviews);

router.get("/:id", getReview);

router.post("/", isAuthenticated, createReview);

router.patch("/:id", isAuthenticated, updateReview);

router.delete("/:id", isAuthenticated, deleteReview);

export default router;
