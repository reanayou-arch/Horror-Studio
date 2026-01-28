import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_KEY = process.env.GROQ_API_KEY;

// ✅ Главный маршрут
app.post("/chat", async (req, res) => {
  try {
    const { messages, characters } = req.body;

    // Формируем системный промпт
    const systemPrompt = `
Ты — Horror-Studio AI.
Ты ведёшь сюжет строго как персонажи истории.

Персонажи:
${characters.map(c => `- ${c.name}: ${c.personality}`).join("\n")}

Отвечай только JSON:
{
 "character": "Имя",
 "message": "Текст"
}
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    res.json({ reply: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Render порт
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
