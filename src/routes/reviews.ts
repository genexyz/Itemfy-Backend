import express, { Router } from "express";
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

router.post("/", createReview);

router.patch("/:id", updateReview);

router.delete("/:id", deleteReview);

export default router;
