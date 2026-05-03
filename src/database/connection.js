import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";

export const dataBaseConnection = async () => {
  // connection
  const client = new MongoClient(uri);
  await client.connect();
  console.log("connected successfully to server");
  const dbName = "shcool";

  return { client, dbName };
};
