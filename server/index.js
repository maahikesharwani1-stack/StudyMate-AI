
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini API key is missing. Check your .env file.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

app.post("/api/generate-notes", async (req, res) => {
  try {
    const { topic, level = "beginner" } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: "Please enter a topic."
      });
    }

    const prompt = `
You are an expert college tutor for BCA students.

Create accurate, easy-to-understand and topic-specific
study notes on: ${topic}

Student level: ${level}

Include:
1. Simple definition
2. Detailed explanation in easy language
3. Important points
4. Practical examples
5. Exam-oriented answer
6. Common mistakes
7. Five MCQs with answers
8. Short revision summary

Use clear headings and avoid generic or unrelated content.
Explain technical terms with examples.
`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt
    });

    res.json({
      success: true,
      text: response.text
    });

  } catch (error) {
    console.error("Gemini Error:", error.message);

    res.status(500).json({
      error: "Unable to generate notes. Please try again."
    });
  }
});

app.listen(3001, () => {
  console.log("StudyMate AI backend running on port 3001");
});
