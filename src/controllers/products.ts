import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import db from "../db.js";
import Product from "../models/product.js";

export const getProducts: RequestHandler = async (req, res) => {
  console.log("test");
  try {
    const collection = db.collection("products");
    const products = (await collection.find().toArray()) as Product[];
    res.status(200).json({ message: "Products Fetched", products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProduct: RequestHandler = async (req, res) => {
  const id = req.params.id;
  try {
    const collection = db.collection("products");
    const query = { _id: new ObjectId(id) };
    const product = (await collection.findOne(query)) as Product;
    res.status(200).json({ message: "Product Fetched", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createProduct: RequestHandler = async (req, res) => {
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
    const collection = db.collection("products");
    const newProduct = new Product(title, description, price);
    const productResult = await collection.insertOne(newProduct);
    res.status(201).json({
      message: "Product Created",
      product: {
        id: productResult.insertedId,
        title: title,
        description: description,
        price: price,
      },
      productResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProduct: RequestHandler = async (req, res) => {
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
    const collection = db.collection("products");
    const query = { _id: new ObjectId(id) };

    const product = (await collection.findOne(query)) as Product;
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    const productResult = await collection.updateOne(query, {
      $set: { title, description, price },
    });
    res.status(200).json({
      message: "Product Updated",
      product: { id: id, title, description, price, reviews: product.reviews },
      productResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteProduct: RequestHandler = async (req, res) => {
  const id = req.params.id;
  try {
    const productsCollection = db.collection("products");
    const reviewsCollection = db.collection("reviews");
    const query = { _id: new ObjectId(id) };

    const product = (await productsCollection.findOne(query)) as Product;
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

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
