const express = require("express");
const path = require("path");
const cors = require("cors");

// ✅ node-fetch подключаем правильно под Render
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

// ===============================
// ✅ CORS (GitHub Pages → Render)
// ===============================
app.use(
  cors({
    origin: "*",
  })
);

// ===============================
// ✅ Раздаём папку public как сайт
// ===============================
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// ✅ Главная страница
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// ✅ AI Chat Endpoint (Groq)
// ===============================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Нет сообщения" });
    }

    // ✅ Groq API Key из Render ENV
    const GROQ_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_KEY) {
      return res.status(500).json({
        error: "GROQ_API_KEY не задан в Render Environment Variables",
      });
    }

    // ✅ Запрос к Groq API
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
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({
        error: "Groq не вернул ответ",
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
  console.log("✅ Horror-Studio running on port", PORT);
});
