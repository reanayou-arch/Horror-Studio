const express = require("express");
const path = require("path");
const cors = require("cors");

// node-fetch для Render
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Раздаём public
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// ✅ OpenAI GPT-4o-mini чат
// ===============================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Нет сообщения" });
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY не задан в Render Environment Variables",
      });
    }

    // Запрос к OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Ты — персонаж хоррор-истории в стиле Telegram-чата. Отвечай атмосферно, короткими репликами.",
            },
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
        error: "OpenAI не вернул ответ",
        raw: data,
      });
    }

    res.json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    console.error("OpenAI ERROR:", err);
    res.status(500).json({ error: "Ошибка AI соединения" });
  }
});

// ===============================
// ✅ Render PORT
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Horror-Studio running with OpenAI GPT-4o-mini");
});
