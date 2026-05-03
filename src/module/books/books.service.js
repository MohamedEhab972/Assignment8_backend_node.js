import { dataBaseConnection } from "../../database/connection.js";
import { ObjectId } from "mongodb";

const { client, dbName } = await dataBaseConnection();

export const createBooksCollection = async () => {
  await client.db(dbName).createCollection("books", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "content"],
        properties: {
          title: { bsonType: "string", minLength: 1, description: "required" },
          content: {
            bsonType: "string",
            minLength: 1,
            description: "required",
          },
        },
      },
    },
  });
};

export const createAuthor = async ({ name, nationality }) => {
  const result = await client
    .db(dbName)
    .collection("authors")
    .insertOne({ name, nationality });
  return { insertedId: result.insertedId, name, nationality };
};

export const createCappedLogsCollection = async () => {
  await client
    .db(dbName)
    .createCollection("logs", { capped: true, size: 1048576, max: 100 });
};

export const createBooksTitleIndex = async () => {
  const indexName = await client
    .db(dbName)
    .collection("books")
    .createIndex({ title: 1 }, { unique: true });
  return indexName;
};

export const addBook = async ({ title, author, year, genres, content }) => {
  const result = await client
    .db(dbName)
    .collection("books")
    .insertOne({ title, author, year, genres, content });
  return { insertedId: result.insertedId };
};

export const addBooksbatch = async (books) => {
  const result = await client.db(dbName).collection("books").insertMany(books);
  return result;
};

export const updateBookYearByTitle = async (title, year) => {
  const result = await client
    .db(dbName)
    .collection("books")
    .updateOne({ title }, { $set: { year } });
  return result;
};

export const addLog = async (action) => {
  const book_id = new ObjectId();
  await client.db(dbName).collection("logs").insertOne({ book_id, action });
  return { book_id, action };
};

export const getBookByTitle = async (title) => {
  const book = await client.db(dbName).collection("books").findOne({ title });
  return book;
};

export const getBooksByYearRange = async (fromYear, toYear) => {
  const books = await client
    .db(dbName)
    .collection("books")
    .find({ year: { $gte: fromYear, $lte: toYear } })
    .toArray();
  return books;
};

export const getBooksByGenre = async (genre) => {
  const books = await client
    .db(dbName)
    .collection("books")
    .find({ genres: genre })
    .toArray();
  return books;
};

export const getBooksSkipLimit = async () => {
  const books = await client
    .db(dbName)
    .collection("books")
    .find()
    .sort({ year: -1 })
    .skip(2)
    .limit(3)
    .toArray();
  return books;
};

export const getBooksYearInteger = async () => {
  const books = await client
    .db(dbName)
    .collection("books")
    .find({ year: { $type: "int" } })
    .toArray();
  return books;
};

export const getBooksExcludeGenres = async () => {
  const books = await client
    .db(dbName)
    .collection("books")
    .find({ genres: { $nin: ["Horror", "Science Fiction"] } })
    .toArray();
  return books;
};

export const deleteBookBeforeYear = async (yearNum) => {
  const result = await client
    .db(dbName)
    .collection("books")
    .deleteMany({ year: { $lt: yearNum } });
  return { deletedCount: result.deletedCount };
};

export const aggregateFilterSortByYear = async () => {
  const books = await client
    .db(dbName)
    .collection("books")
    .aggregate([{ $match: { year: { $gt: 2000 } } }, { $sort: { year: -1 } }])
    .toArray();
  return books;
};

export const aggregateProjectFields = async () => {
  const books = await client
    .db(dbName)
    .collection("books")
    .aggregate([
      { $match: { year: { $gt: 2000 } } },
      { $project: { _id: 0, title: 1, author: 1, year: 1 } },
    ])
    .toArray();
  return books;
};

export const aggregateUnwindGenres = async () => {
  const books = await client
    .db(dbName)
    .collection("books")
    .aggregate([{ $unwind: "$genres" }])
    .toArray();
  return books;
};

export const aggregateJoinBooksLogs = async () => {
  const result = await client
    .db(dbName)
    .collection("logs")
    .aggregate([
      {
        $lookup: {
          from: "books",
          localField: "book_id",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $project: {
          _id: 0,
          action: 1,
          book_id: 1,
          "book.title": 1,
          "book.author": 1,
          "book.year": 1,
        },
      },
    ])
    .toArray();
  return result;
};
