import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../db.js";
import User from "../models/user.js";
import { jwtSecret, jwtRefreshSecret } from "../config.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

export const signIn: RequestHandler = async (req, res) => {
  const email = (req.body as { email: string }).email;
  const password = (req.body as { password: string }).password;

  const newErrors: {
    email?: string;
    password?: string;
  } = {};

  if (!email || typeof email !== "string") newErrors.email = "Email is required";
  if (!password || typeof password !== "string")
    newErrors.password = "Password is required";
  if (!EMAIL_REGEX.test(email)) newErrors.email = "Invalid email address";
  if (!PASSWORD_REGEX.test(password))
    newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long and contain at least one letter, one number, and one special character`;

  try {
    const usersCollection = db.collection("users");
    const user = (await usersCollection.findOne({ email })) as User;
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, {
      expiresIn: "24h",
    });
    if (!token) {
      throw new Error("Unable to generate JWT token");
    }

    const refreshToken = jwt.sign({ id: user._id, email: user.email }, jwtRefreshSecret, {
      expiresIn: "14d",
    });
    if (!refreshToken) {
      throw new Error("Unable to generate JWT refresh token");
    }

    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(200).json({ token, refreshToken, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const signUp: RequestHandler = async (req, res) => {
  const email = (req.body as { email: string }).email;
  const password = (req.body as { password: string }).password;
  const name = (req.body as { name: string }).name;

  const newErrors: {
    email?: string;
    password?: string;
    name?: string;
  } = {};

  if (!email || typeof email !== "string") newErrors.email = "Email is required";
  if (!password || typeof password !== "string")
    newErrors.password = "Password is required";
  if (!name || typeof name !== "string") newErrors.name = "Name is required";
  if (name.length > 100) newErrors.name = "Name cannot be more than 100 characters";
  if (!EMAIL_REGEX.test(email)) newErrors.email = "Invalid email address";
  if (!PASSWORD_REGEX.test(password))
    newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long and contain at least one letter, one number, and one special character`;

  if (Object.keys(newErrors).length > 0) {
    return res.status(400).json(newErrors);
  }

  try {
    const usersCollection = db.collection("users");
    const existingUser = (await usersCollection.findOne({ email })) as User;
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const resultUser = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
    });

    const token = jwt.sign({ id: resultUser.insertedId, email: email }, jwtSecret, {
      expiresIn: "24h",
    });
    if (!token) {
      throw new Error("Unable to generate JWT token");
    }

    const refreshToken = jwt.sign(
      { id: resultUser.insertedId, email: email },
      jwtRefreshSecret,
      {
        expiresIn: "14d",
      }
    );
    if (!refreshToken) {
      throw new Error("Unable to generate JWT refresh token");
    }

    const userWithoutPassword = {
      _id: resultUser.insertedId,
      name,
      email,
    };

    res.status(201).json({
      message: "User Signed Up",
      token,
      refreshToken,
      user: userWithoutPassword,
      resultUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
