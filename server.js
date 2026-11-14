
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { rateLimit } = require("express-rate-limit");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const chatLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.use("/api/chat", chatLimit);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Sanskar-AI server is running!");
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "AI service is not configured."
      });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions:
        "You are Sanskar-AI, a helpful, friendly and safe AI assistant. Reply in the user's language.",
      input: message
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    console.error("AI error:", error.message);

    res.status(500).json({
      error: "Sorry, Sanskar-AI could not respond. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Sanskar-AI running on port ${PORT}`);
});
