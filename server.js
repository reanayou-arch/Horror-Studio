import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages, characters, story } = req.body;

    const systemPrompt = `
Ты пишешь хоррор-историю в формате Telegram-чата.

Персонажи:
${characters.map(c => `- ${c.name}: ${c.personality}`).join("\n")}

Отвечай строго JSON:

{
 "character": "Имя персонажа",
 "message": "реплика"
}
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
    const reply = data.choices[0].message.content;

    res.json({ reply });

  } catch (err) {
    res.status(500).json({ error: "AI Server Error" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
