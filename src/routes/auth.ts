import express, { Router } from "express";
import { signIn, signUp } from "../controllers/auth.js";

const router: Router = express.Router();

router.use(express.json());

router.post("/signin", signIn);

router.post("/signup", signUp);

export default router;
