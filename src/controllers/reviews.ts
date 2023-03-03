import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import db, { client } from "../db.js";
import Review from "../models/review.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import { CustomRequest } from "../middlewares/auth.js";

export const getReviews: RequestHandler = async (req, res) => {
  try {
    const reviewsCollection = db.collection("reviews");

    const reviews = await reviewsCollection
      .aggregate([
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            _id: 1,
            rating: 1,
            comment: 1,
            "product._id": 1,
            "product.title": 1,
            "product.description": 1,
            "product.price": 1,
          },
        },
      ])
      .toArray();

    res.status(200).json({ message: "Reviews Fetched", reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getReview: RequestHandler = async (req, res) => {
  const id = req.params.id;
  try {
    const reviewsCollection = db.collection("reviews");
    const query = { _id: new ObjectId(id) };
    const review = (await reviewsCollection.findOne(query, {
      projection: { user: 0 },
    })) as Review;
    if (!review) return res.status(404).json({ message: "Review Not Found" });

    const productsCollection = db.collection("products");
    const queryProducts = { _id: new ObjectId(review.product) };
    const product = (await productsCollection.findOne(queryProducts)) as Product;

    res.status(200).json({ message: "Review Fetched", review, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createReview: RequestHandler = async (req: CustomRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

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
    const userCollection = db.collection("users");
    const userQuery = { _id: new ObjectId(userId) };
    const user = (await userCollection.findOne(userQuery)) as User;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reviewsCollection = db.collection("reviews");
    const productsCollection = db.collection("products");

    const existingReview = (await reviewsCollection.findOne({
      user: new ObjectId(userId),
      product: new ObjectId(productId),
    })) as Review;
    if (existingReview) {
      return res.status(400).json({ message: "Review for this product already exists!" });
    }

    const reviewResult = await reviewsCollection.insertOne({
      rating,
      comment,
      product: new ObjectId(productId),
      user: new ObjectId(userId),
    });
    const reviewId = reviewResult.insertedId;

    const productQuery = { _id: new ObjectId(productId) };
    const product = (await productsCollection.findOne(productQuery)) as Product;
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
    } else if (product && product.reviews) {
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

export const updateReview: RequestHandler = async (req: CustomRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

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
    const userCollection = db.collection("users");
    const userQuery = { _id: new ObjectId(userId) };
    const user = (await userCollection.findOne(userQuery)) as User;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reviewsCollection = db.collection("reviews");
    const query = { _id: new ObjectId(id) };

    const review = (await reviewsCollection.findOne(query)) as Review;
    if (!review) {
      return res.status(404).json({ message: "Review Not Found" });
    }

    if (user._id.toString() !== review.user.toString())
      return res.status(401).json({ message: "Unauthorized" });

    const reviewResult = await reviewsCollection.updateOne(query, {
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

export const deleteReview: RequestHandler = async (req: CustomRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const id = req.params.id;
  try {
    const session = client.startSession();
    session.startTransaction();

    const userCollection = db.collection("users");
    const userQuery = { _id: new ObjectId(userId) };
    const user = (await userCollection.findOne(userQuery, { session })) as User;
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productsCollection = db.collection("products");
    const reviewsCollection = db.collection("reviews");
    const query = { _id: new ObjectId(id) };

    const review = (await reviewsCollection.findOne(query, { session })) as Review;
    if (!review) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Review Not Found" });
    }

    if (user._id.toString() !== review.user.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productQuery = { _id: new ObjectId(review.product) };
    const product = (await productsCollection.findOne(productQuery, {
      session,
    })) as Product;
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Product Not Found" });
    }
    if (!product.reviews || product.reviews.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Product has no reviews" });
    }

    const reviewIndex = product.reviews.findIndex(
      (r) => r.toString() === review._id.toString()
    );
    if (reviewIndex !== -1) {
      product.reviews.splice(reviewIndex, 1);
    }

    const productResult = await productsCollection.updateOne(
      productQuery,
      {
        $set: product,
      },
      { session }
    );
    const reviewResult = await reviewsCollection.deleteOne(query, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Review Deleted", reviewResult, productResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
