import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import { dataBaseConnection } from "./database/connection.js";
import bookRouter from "./module/books/books.controller.js";

export const bootstrap = async () => {
  const app = express();
  app.use(express.json());
  app.use(bookRouter);
  app.listen(3000, () => console.log("Server is running on port 3000"));
};
