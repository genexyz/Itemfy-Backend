import { ObjectId } from "mongodb";

export default class Product {
  constructor(
    public _id: ObjectId,
    public title: string,
    public description: string,
    public price: number,
    public user: ObjectId,
    public reviews?: ObjectId[]
  ) {}
}
