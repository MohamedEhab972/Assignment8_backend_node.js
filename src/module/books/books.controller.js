import { Router } from "express";
import {
  createBooksCollection,
  createAuthor,
  createCappedLogsCollection,
  createBooksTitleIndex,
  addBook,
  addBooksbatch,
  addLog,
  updateBookYearByTitle,
  getBookByTitle,
  getBooksByYearRange,
  getBooksByGenre,
  getBooksSkipLimit,
  getBooksYearInteger,
  getBooksExcludeGenres,
  deleteBookBeforeYear,
  aggregateFilterSortByYear,
  aggregateProjectFields,
  aggregateUnwindGenres,
  aggregateJoinBooksLogs,
} from "./books.service.js";

const router = Router();

router.post("/collection/books", async (req, res) => {
  try {
    await createBooksCollection();
    res.status(201).json({
      status: "success",
      message: "books collection created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/collection/authors", async (req, res) => {
  const { name, nationality } = req.body;
  if (!name || !nationality) {
    return res
      .status(400)
      .json({ status: "error", message: "name and nationality are required" });
  }
  try {
    const data = await createAuthor({ name, nationality });
    res.status(201).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/collection/logs/capped", async (req, res) => {
  try {
    await createCappedLogsCollection();
    res.status(201).json({
      status: "success",
      message: "logs collection created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/collection/books/index", async (req, res) => {
  try {
    const indexName = await createBooksTitleIndex();
    res.status(201).json({ status: "success", message: indexName });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/books", async (req, res) => {
  const { title, author, year, genres, content } = req.body;
  if (!title || !author || !year || !content) {
    return res.status(400).json({
      status: "error",
      message: "title, author, year and content are required",
    });
  }
  if (!Array.isArray(genres) || genres.length === 0) {
    return res
      .status(400)
      .json({ status: "error", message: "genres must be a non-empty array" });
  }
  if (typeof year !== "number") {
    return res
      .status(400)
      .json({ status: "error", message: "year must be a number" });
  }
  try {
    const data = await addBook({ title, author, year, genres, content });
    res.status(201).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/books/batch", async (req, res) => {
  const { books } = req.body;
  if (!Array.isArray(books) || books.length < 3) {
    return res
      .status(400)
      .json({ status: "error", message: "At least 3 books are required" });
  }
  try {
    const result = await addBooksbatch(books);
    res.status(201).json({
      status: "success",
      data: { insertedCount: result.insertedCount },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.patch("/books/Future", async (req, res) => {
  try {
    const result = await updateBookYearByTitle("Future", 2022);
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "book not found" });
    }
    res.status(200).json({
      status: "success",
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/logs", async (req, res) => {
  const { action } = req.body;
  if (!action) {
    return res
      .status(400)
      .json({ status: "error", message: "action is required" });
  }
  try {
    const data = await addLog(action);
    res.status(201).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/title", async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res
      .status(400)
      .json({ status: "error", message: "title is required" });
  }
  try {
    const book = await getBookByTitle(title);
    if (!book) {
      return res
        .status(404)
        .json({ status: "error", message: "book not found" });
    }
    res.status(200).json({ status: "success", data: book });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/year", async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res
      .status(400)
      .json({ status: "error", message: "from and to are required" });
  }
  const fromYear = Number(from);
  const toYear = Number(to);
  if (isNaN(fromYear) || isNaN(toYear)) {
    return res
      .status(400)
      .json({ status: "error", message: "from and to must be numbers" });
  }
  try {
    const books = await getBooksByYearRange(fromYear, toYear);
    res.status(200).json({ status: "success", data: books });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/genre", async (req, res) => {
  const { genre } = req.query;
  if (!genre) {
    return res
      .status(400)
      .json({ status: "error", message: "genre is required" });
  }
  try {
    const books = await getBooksByGenre(genre);
    res.status(200).json({ status: "success", data: books });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/skip-limit", async (req, res) => {
  try {
    const books = await getBooksSkipLimit();
    res.status(200).json({ status: "success", data: books });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/year-integer", async (req, res) => {
  try {
    const books = await getBooksYearInteger();
    res.status(200).json({ status: "success", data: books });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/exclude-genres", async (req, res) => {
  try {
    const books = await getBooksExcludeGenres();
    res.status(200).json({ status: "success", data: books });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.delete("/books/before-year", async (req, res) => {
  const { year } = req.query;
  if (!year) {
    return res
      .status(400)
      .json({ status: "error", message: "year is required" });
  }
  const yearNum = Number(year);
  if (isNaN(yearNum)) {
    return res
      .status(400)
      .json({ status: "error", message: "year must be a number" });
  }
  try {
    const data = await deleteBookBeforeYear(yearNum);
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/aggregate1", async (req, res) => {
  try {
    const data = await aggregateFilterSortByYear();
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/aggregate2", async (req, res) => {
  try {
    const data = await aggregateProjectFields();
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/aggregate3", async (req, res) => {
  try {
    const data = await aggregateUnwindGenres();
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/books/aggregate4", async (req, res) => {
  try {
    const data = await aggregateJoinBooksLogs();
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
