import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// =====================================
// Fix __dirname for ES Modules
// =====================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================
// Serve public folder
// =====================================
app.use(express.static(path.join(__dirname, "public")));

// =====================================
// Root → index.html
// =====================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================================
// AI CHAT Endpoint → OpenAI
// =====================================
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Ты хоррор-рассказчик в стиле Telegram." },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.log("OpenAI RAW:", data);
      return res.status(500).json({
        error: "OpenAI не вернул ответ",
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

// =====================================
// Render PORT
// =====================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Horror-Studio running with OpenAI GPT-4o-mini");
});
