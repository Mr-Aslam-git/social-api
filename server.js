const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());

// path to our data file
const dataFile = path.join(__dirname, "data", "posts.json");

// helper: read posts safely
function readPosts() {
  try {
    const data = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading posts file:", err);
    return [];
  }
}

// helper: write posts safely
function writePosts(posts) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(posts, null, 2));
  } catch (err) {
    console.error("Error writing posts file:", err);
  }
}

// POST /api/posts  — create new post
app.post("/api/posts", (req, res) => {
  const { content, author, tags } = req.body;

  // validation
  if (!content || content.length < 1 || content.length > 280) {
    return res.status(400).json({ error: "Content must be 1–280 characters" });
  }
  if (!author) {
    return res.status(400).json({ error: "Author is required" });
  }

  let safeTags = Array.isArray(tags) ? tags.slice(0, 5) : [];

  const newPost = {
    postId: Date.now().toString(),
    content,
    author,
    tags: safeTags,
    createdAt: new Date().toISOString(),
    likes: 0,
    status: "published",
  };

  const posts = readPosts();
  // newest first
  posts.unshift(newPost);
  writePosts(posts);

  res.status(201).json(newPost);
});

// GET /api/posts — fetch all posts
app.get("/api/posts", (req, res) => {
  const posts = readPosts();

  // sort by createdAt desc just in case
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(posts);
});

// root
app.get("/", (req, res) => {
  res.send("Social API is running 🚀");
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
