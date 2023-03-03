import { ObjectId } from "mongodb";

export default class User {
  constructor(
    public _id: ObjectId,
    public email: string,
    public password: string,
    public name: string
  ) {}
}
