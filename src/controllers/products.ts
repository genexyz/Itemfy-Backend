import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import db from "../db.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import Review from "../models/review.js";
import { CustomRequest } from "../middlewares/auth.js";

export const getProducts: RequestHandler = async (req, res) => {
  try {
    const productsCollection = db.collection("products");
    const products = (await productsCollection.find().toArray()) as Product[];
    res.status(200).json({ message: "Products Fetched", products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProduct: RequestHandler = async (req, res) => {
  const id = req.params.id;
  let reviews: Review[] = [];
  try {
    const productsCollection = db.collection("products");
    const query = { _id: new ObjectId(id) };
    const product = (await productsCollection.findOne(query)) as Product;
    if (!product) return res.status(404).json({ message: "Product Not Found" });

    if (product.reviews && product.reviews.length > 0) {
      const reviewsCollection = db.collection("reviews");
      const queryReviews = product.reviews.length
        ? { _id: { $in: product.reviews.map((id) => new ObjectId(id)) } }
        : {};
      reviews = (await reviewsCollection
        .find(queryReviews, { projection: { user: 0 } })
        .toArray()) as Review[];
    }

    res.status(200).json({ message: "Product Fetched", product, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createProduct: RequestHandler = async (req: CustomRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const title = (req.body as { title: string }).title;
  const description = (req.body as { description: string }).description;
  const price = (req.body as { price: number }).price;

  const newErrors: {
    title?: string;
    description?: string;
    price?: string;
  } = {};

  if (!title || title === "") newErrors.title = "Cannot be blank!";
  if (typeof title !== "string") newErrors.title = "Must be a string!";
  if (title && title.length > 100)
    newErrors.title = "Cannot be more than 100 characters!";
  if (!description || description === "") newErrors.description = "Cannot be blank!";
  if (typeof description !== "string") newErrors.description = "Must be a string!";
  if (description && description.length > 500)
    newErrors.description = "Cannot be more than 500 characters!";
  if (!price || price === 0) newErrors.price = "Cannot be blank or 0!";
  if (typeof price !== "number") newErrors.price = "Must be a number!";
  if (price && price < 0) newErrors.price = "Cannot be less than 0!";

  if (Object.keys(newErrors).length > 0) {
    return res.status(400).send(newErrors);
  }

  try {
    const userCollection = db.collection("users");
    const userQuery = { _id: new ObjectId(userId) };
    const user = (await userCollection.findOne(userQuery)) as User;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productsCollection = db.collection("products");
    const productResult = await productsCollection.insertOne({
      title,
      description,
      price,
      user: new ObjectId(userId),
    });
    res.status(201).json({
      message: "Product Created",
      product: {
        id: productResult.insertedId,
        title: title,
        description: description,
        price: price,
        user: userId,
      },
      productResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProduct: RequestHandler = async (req: CustomRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const id = req.params.id;
  const title = (req.body as { title: string }).title;
  const description = (req.body as { description: string }).description;
  const price = (req.body as { price: number }).price;

  const newErrors: {
    title?: string;
    description?: string;
    price?: string;
  } = {};

  if (!title || title === "") newErrors.title = "Cannot be blank!";
  if (typeof title !== "string") newErrors.title = "Must be a string!";
  if (title && title.length > 100)
    newErrors.title = "Cannot be more than 100 characters!";
  if (!description || description === "") newErrors.description = "Cannot be blank!";
  if (typeof description !== "string") newErrors.description = "Must be a string!";
  if (description && description.length > 500)
    newErrors.description = "Cannot be more than 500 characters!";
  if (!price || price === 0) newErrors.price = "Cannot be blank or 0!";
  if (typeof price !== "number") newErrors.price = "Must be a number!";
  if (price && price < 0) newErrors.price = "Cannot be less than 0!";

  if (Object.keys(newErrors).length > 0) {
    return res.status(400).send(newErrors);
  }

  try {
    const userCollection = db.collection("users");
    const userQuery = { _id: new ObjectId(userId) };
    const user = (await userCollection.findOne(userQuery)) as User;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productsCollection = db.collection("products");
    const query = { _id: new ObjectId(id) };

    const product = (await productsCollection.findOne(query)) as Product;
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    if (user._id.toString() !== product.user.toString())
      return res.status(401).json({ message: "Unauthorized" });

    const productResult = await productsCollection.updateOne(query, {
      $set: { title, description, price },
    });
    res.status(200).json({
      message: "Product Updated",
      product: {
        id: id,
        title,
        description,
        price,
        reviews: product.reviews,
        user: product.user,
      },
      productResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteProduct: RequestHandler = async (req: CustomRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const id = req.params.id;
  try {
    const userCollection = db.collection("users");
    const userQuery = { _id: new ObjectId(userId) };
    const user = (await userCollection.findOne(userQuery)) as User;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productsCollection = db.collection("products");
    const reviewsCollection = db.collection("reviews");
    const query = { _id: new ObjectId(id) };

    const product = (await productsCollection.findOne(query)) as Product;
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    if (user._id.toString() !== product.user.toString())
      return res.status(401).json({ message: "Unauthorized" });

    if (product.reviews && product.reviews.length > 0) {
      const reviewIds = product.reviews.map(
        (reviewId: ObjectId) => new ObjectId(reviewId)
      );
      await reviewsCollection.deleteMany({ _id: { $in: reviewIds } });
    }

    const productResult = await productsCollection.deleteOne(query);

    res.status(200).json({ message: "Product Deleted", productResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
