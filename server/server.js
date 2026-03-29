const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware


app.use(cors({
  origin: "*"
}))
app.use(express.json());

// 🔥 Replace with YOUR real MongoDB connection string
const MONGO_URI = "mongodb+srv://rohitfista_db_user:Rohitrk0705@focusforge-cluster.e2nljye.mongodb.net/?appName=focusforge-cluster";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected 🔥");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error:", err.message);
  });

// Import User Model
const User = require("./models/user");

// Test route
app.get("/", (req, res) => {
  res.send("FocusForge Backend + MongoDB Connected 🚀");
});

// 🔥 SIGNUP ROUTE (Email Based)
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: "User created successfully 💖" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 LOGIN ROUTE (Email Based)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json({ message: "Login successful 🚀" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// 🔥 SAVE NOTES
app.post("/save-notes", async (req, res) => {
  try {
    const { email, notes } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { notes },
      { new: true }
    );

    res.json({ message: "Notes saved successfully 💾" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 🔥 GET NOTES
app.post("/login-notes", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    res.json({ notes: user.notes });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});