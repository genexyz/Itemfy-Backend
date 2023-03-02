import { ObjectId } from "mongodb";

export default class Product {
  constructor(
    public rating: number,
    public comment: string,
    public product: ObjectId,
    public _id?: ObjectId,
    public user?: ObjectId
  ) {}
}
