// server.js — Horror-Studio Render Backend (V3.0.0)

const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

// ===============================
// ✅ Раздаём папку public
// ===============================
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// ✅ Главная страница (index.html)
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// ✅ Панель автора
// ===============================
app.get("/author.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "author.html"));
});

// ===============================
// ✅ Чат игрока
// ===============================
app.get("/play.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "play.html"));
});

// ===============================
// ✅ Groq AI API endpoint
// ===============================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Нет сообщения" });
    }

    const GROQ_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_KEY) {
      return res.status(500).json({
        error: "❌ GROQ_API_KEY не задан в Render Environment",
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{ role: "user", content: userMessage }],
        }),
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({
        error: "Ошибка AI ответа",
        raw: data,
      });
    }

    res.json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({
      error: "Ошибка AI соединения",
    });
  }
});

// ===============================
// ✅ Render PORT
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Horror-Studio server running on port", PORT);
});
