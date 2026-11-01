import { GoogleGenAI } from "@google/genai";

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const apiKey = Netlify.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured in Netlify.");
      return Response.json(
        { error: "The AI service is not configured yet. Please contact the site owner." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const level =
      typeof body.level === "string" && body.level.trim()
        ? body.level.trim()
        : "beginner";

    if (!topic) {
      return Response.json({ error: "Please enter a topic." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

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
      contents: prompt,
    });

    return Response.json({
      success: true,
      text: response.text ?? "",
    });
  } catch (error) {
    console.error("Gemini Error:", error?.message ?? error);
    return Response.json(
      { error: "Unable to generate notes. Please try again." },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/generate-notes",
  method: "POST",
};
