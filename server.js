// Horror-Studio — server.js V3.0.0
// Render + Groq API backend

const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Render раздаёт всё из папки public
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// ✅ Главные страницы проекта
// ===============================

// Главное меню
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Панель автора
app.get("/author", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "author.html"));
});

// Чат-игра
app.get("/play", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "play.html"));
});

// ===============================
// ✅ Groq AI API (чат)
// ===============================

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Нет messages[]" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: messages,
        }),
      }
    );

    const data = await response.json();

    if (!data.choices) {
      return res.status(500).json({
        error: "Groq не вернул choices",
        full: data,
      });
    }

    res.json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    console.error("Ошибка /chat:", err);
    res.status(500).json({ error: "Ошибка AI соединения" });
  }
});

// ===============================
// ✅ Render PORT
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Horror-Studio server running on port", PORT);
});
