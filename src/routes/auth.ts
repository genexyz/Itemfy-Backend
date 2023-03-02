import express, { Router } from "express";

// import { register, login } from "../controllers/auth";

const router: Router = express.Router();

router.use(express.json());

// router.post("/register", register);

// router.post("/login", login);

export default router;
