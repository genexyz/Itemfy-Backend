import { ClientSession, Db, MongoClient } from "mongodb";
import { db_URL, db_Name } from "./config.js";

const client = new MongoClient(db_URL);

await client.connect();

const db = client.db(db_Name);

export default db;

// export async function runTransaction(operation: (arg0: ClientSession, arg1: Db) => any) {
//   const session = client.startSession();
//   let result;

//   try {
//     await session.withTransaction(async () => {
//       result = await operation(session, db);
//     });
//   } finally {
//     session.endSession();
//   }

//   return result;
// }
