// Question 1
db.createCollection("books", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "content"],
      properties: {
        title: { bsonType: "string", minLength: 1, description: "required" },
      },
    },
  },
});

// Question 2
db.authors.insertOne({
  name: "Author1",
  nationality: "British",
});

// Question 3
db.createCollection("logs", { capped: true, size: 1048576, max: 100 });

// Question 4
db.books.createIndex({ title: 1 }, { unique: true });

// Question 5
db.books.insertOne({
  title: "book1",
  author: "Ali",
  year: 1937,
  genres: ["Fantasy", "Adventure"],
});

// Question 6
db.books.insertMany([
  {
    title: "book2",
    author: "Ali",
    year: 1937,
    genres: ["Fantasy", "Adventure"],
  },
  {
    title: "book3",
    author: "Ali",
    year: 1937,
    genres: ["Fantasy", "Adventure"],
  },
  {
    title: "book4",
    author: "Ali",
    year: 1937,
    genres: ["Fantasy", "Adventure"],
  },
]);

// Question 7
db.logs.insertOne({
  book_id: ObjectId("62c6b8b6d2d3d3d3d3d3d3d3"),
  action: "borrowed",
});

// Question 8
db.books.updateOne({ title: "Future" }, { $set: { year: 2022 } });

// Question 9
db.books.findOne({ title: "Brave New World" });

// Question 10
// db.books.find({ $and: [{ year: { $gt: 1990 } }, { year: { $lt: 2010 } }] });
db.books.find({ year: { $gt: 1990, $lt: 2010 } });

// Question 11
db.books.find({ genres: "Science Fiction" });

// Question 12
db.books.find().skip(2).limit(3).sort({ title: -1 });

// Question 13
db.books.find({ year: { $type: 16 } });

// Question 14
db.books.find({ genres: { $nin: ["Horror", "Science Fiction"] } });

// Question 15
db.books.deleteMany({ year: { $lt: 2000 } });

// Question 16
db.books.aggregate([
  { $match: { year: { $gt: 2000 } } },
  { $sort: { year: -1 } },
]);

// Question 17
db.books.aggregate([
  { $match: { year: { $gt: 2000 } } },
  { $project: { title: 1, author: 1, year: 1 } },
]);

// Question 18
db.books.aggregate([{ $unwind: "$genres" }]);

// Question 19
db.logs.aggregate([
  {
    $lookup: {
      from: "books",
      localField: "book_id",
      foreignField: "_id",
      as: "book",
    },
  },
]);
