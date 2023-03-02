import { ObjectId } from "mongodb";

export default class Product {
  constructor(
    public title: string,
    public description: string,
    public price: number,
    public _id?: ObjectId,
    public reviews?: ObjectId[],
    public user?: ObjectId
  ) {}
}
