import { ObjectId } from "mongodb";

export default class Product {
  constructor(
    public _id: ObjectId,
    public rating: number,
    public comment: string,
    public product: ObjectId,
    public user: ObjectId
  ) {}
}
