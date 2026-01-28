import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ раздаём папку public
app.use(express.static("public"));


// ✅ Groq API
app.post("/chat", async (req, res) => {
  try {
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
          messages: req.body.messages,
        }),
      }
    );

    const data = await response.json();

    res.json({
      reply: data.choices[0].message.content,
    });

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "Ошибка AI соединения" });
  }
});


// ✅ Render Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Horror-Studio running on port", PORT);
});
