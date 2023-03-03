import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import db from "../db.js";
import Review from "../models/review.js";

export const getReviews: RequestHandler = async (req, res) => {
  try {
    const collection = db.collection("reviews");
    const reviews = (await collection.find().toArray()) as Review[];
    res.status(200).json({ message: "Reviews Fetched", reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getReview: RequestHandler = async (req, res) => {
  const id = req.params.id;
  try {
    const collection = db.collection("reviews");
    const query = { _id: new ObjectId(id) };
    const review = (await collection.findOne(query)) as Review;
    res.status(200).json({ message: "Reviews Fetched", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createReview: RequestHandler = async (req, res) => {
  const rating = (req.body as { rating: number }).rating;
  const comment = (req.body as { comment: string }).comment;
  const productId = (req.body as { productId: string }).productId;

  const newErrors: {
    rating?: string;
    comment?: string;
    productId?: string;
  } = {};

  if (!rating || rating === 0) newErrors.rating = "Cannot be blank or 0!";
  if (typeof rating !== "number") newErrors.rating = "Must be a number!";
  if (rating && rating < 0) newErrors.rating = "Cannot be less than 0!";
  if (rating && rating > 5) newErrors.rating = "Cannot be more than 5!";
  if (!comment || comment === "") newErrors.comment = "Cannot be blank!";
  if (typeof comment !== "string") newErrors.comment = "Must be a string!";
  if (comment && comment.length > 500)
    newErrors.comment = "Cannot be more than 500 characters!";
  if (!productId || productId === "") newErrors.productId = "Cannot be blank!";
  if (typeof productId !== "string") newErrors.productId = "Must be a string!";
  if (productId && !ObjectId.isValid(productId))
    newErrors.productId = "Must be a valid ObjectID!";

  if (Object.keys(newErrors).length > 0) {
    return res.status(400).send(newErrors);
  }

  try {
    const reviewsCollection = db.collection("reviews");
    const productsCollection = db.collection("products");
    const newReview = new Review(rating, comment, new ObjectId(productId));

    const reviewResult = await reviewsCollection.insertOne(newReview);
    const reviewId = reviewResult.insertedId;

    const productQuery = { _id: new ObjectId(productId) };
    const product = await productsCollection.findOne(productQuery);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }
    let productUpdate = {};
    if (product && !product.reviews) {
      productUpdate = {
        $set: {
          reviews: [reviewId],
        },
      };
    } else if (product && product.reviews.length > 0) {
      productUpdate = {
        $push: {
          reviews: reviewId,
        },
      };
    }

    const productResult = await productsCollection.updateOne(productQuery, productUpdate);

    res.status(201).json({
      message: "Review Created",
      review: { _id: reviewId, rating, comment, product: productId },
      reviewResult,
      productResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateReview: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const rating = (req.body as { rating: number }).rating;
  const comment = (req.body as { comment: string }).comment;

  const newErrors: {
    rating?: string;
    comment?: string;
  } = {};

  if (!rating || rating === 0) newErrors.rating = "Cannot be blank or 0!";
  if (typeof rating !== "number") newErrors.rating = "Must be a number!";
  if (rating && rating < 0) newErrors.rating = "Cannot be less than 0!";
  if (rating && rating > 5) newErrors.rating = "Cannot be more than 5!";
  if (!comment || comment === "") newErrors.comment = "Cannot be blank!";
  if (typeof comment !== "string") newErrors.comment = "Must be a string!";
  if (comment && comment.length > 500)
    newErrors.comment = "Cannot be more than 500 characters!";

  if (Object.keys(newErrors).length > 0) {
    return res.status(400).send(newErrors);
  }

  try {
    const collection = db.collection("reviews");
    const query = { _id: new ObjectId(id) };

    const review = (await collection.findOne(query)) as Review;
    if (!review) {
      return res.status(404).json({ message: "Review Not Found" });
    }

    const reviewResult = await collection.updateOne(query, {
      $set: { rating, comment },
    });
    res.status(200).json({
      message: "Review Updated",
      review: { _id: id, rating, comment, product: review.product },
      reviewResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteReview: RequestHandler = async (req, res) => {
  const id = req.params.id;
  try {
    const productsCollection = db.collection("products");
    const reviewsCollection = db.collection("reviews");
    const query = { _id: new ObjectId(id) };

    const review = (await reviewsCollection.findOne(query)) as Review;
    if (!review) {
      return res.status(404).json({ message: "Review Not Found" });
    }

    const productQuery = { _id: new ObjectId(review.product) };
    const product = await productsCollection.findOne(productQuery);
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    const reviewIndex = product.reviews.indexOf(review._id);
    if (reviewIndex !== -1) {
      product.reviews.splice(reviewIndex, 1);
    }

    const productResult = await productsCollection.updateOne(productQuery, {
      $set: product,
    });
    const reviewResult = await reviewsCollection.deleteOne(query);

    res.status(200).json({ message: "Review Deleted", reviewResult, productResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
