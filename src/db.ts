import { ClientSession, Db, MongoClient } from "mongodb";
import { db_URL, db_Name } from "./config.js";

export const client = new MongoClient(db_URL);

await client.connect();

const db = client.db(db_Name);

export default db;
