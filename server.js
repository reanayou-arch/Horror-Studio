import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

/* ===== PATH FIX ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===== STATIC SITE ===== */
app.use(express.static(path.join(__dirname, "public")));

/* ===== MAIN PAGE ===== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "author.html"));
});

/* ===== AI CHAT ENDPOINT ===== */
app.post("/chat", async (req, res) => {
  try {
    const { messages, characters } = req.body;

    const systemPrompt = `
Ты — Horror-Studio AI.
Отвечай строго JSON:

{
 "character": "Имя",
 "message": "Текст"
}

Персонажи:
${characters.map(c => `- ${c.name}: ${c.personality}`).join("\n")}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      }
    );

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: "AI Server Error" });
  }
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Horror-Studio running on port", PORT)
);
