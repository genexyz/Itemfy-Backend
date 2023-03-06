import { ObjectId } from "mongodb";

export default class Product {
  constructor(
    public _id: ObjectId,
    public rating: number,
    public product: ObjectId,
    public user: ObjectId,
    public comment?: string
  ) {}
}
