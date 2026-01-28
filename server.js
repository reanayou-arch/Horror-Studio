import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   ✅ Главная страница Render
================================= */
app.get("/", (req, res) => {
  res.send("Horror-Studio Server работает!");
});

/* ===============================
   ✅ CHAT ENDPOINT
   play.html отправляет сюда сообщения
================================= */
app.post("/chat", async (req, res) => {
  try {
    const { message, story } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Нет сообщения" });
    }

    // ✅ Ключ берётся из Render Environment Variables
    const GROQ_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_KEY) {
      return res.status(500).json({
        error: "❌ GROQ_API_KEY не найден в переменных окружения Render"
      });
    }

    // ✅ Формируем системный промпт из истории
    let systemPrompt = "Ты — персонаж хоррор-истории в формате Telegram-чата.";

    if (story?.description) {
      systemPrompt += "\nОписание: " + story.description;
    }

    if (story?.setup?.past) {
      systemPrompt += "\nПрошлое: " + story.setup.past;
    }

    if (story?.setup?.startSituation) {
      systemPrompt += "\nНачальная ситуация: " + story.setup.startSituation;
    }

    // ✅ Запрос к Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.9
      })
    });

    const data = await response.json();

    if (!data.choices) {
      console.log("Ошибка Groq:", data);
      return res.status(500).json({ error: "Groq не вернул ответ" });
    }

    const reply = data.choices[0].message.content;

    res.json({ reply });

  } catch (err) {
    console.error("Ошибка сервера:", err);
    res.status(500).json({ error: "Ошибка AI соединения..." });
  }
});

/* ===============================
   ✅ Запуск сервера
================================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Horror-Studio server running on port", PORT);
});
