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
    const incomingMessages = Array.isArray(body.messages) ? body.messages : [];
    const messages = incomingMessages
      .filter(
        (message) =>
          message &&
          ["user", "assistant"].includes(message.role) &&
          typeof message.content === "string" &&
          message.content.trim()
      )
      .slice(-12)
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, 5000),
      }));

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      return Response.json(
        { error: "Please enter a question first." },
        { status: 400 }
      );
    }

    const conversation = messages
      .map((message) =>
        message.role === "user"
          ? `Student: ${message.content}`
          : `StudyMate AI: ${message.content}`
      )
      .join("\n\n");

    const prompt = `
You are StudyMate AI, a friendly and accurate personal tutor for BCA students.

Teaching style:
- Explain concepts in very simple, beginner-friendly language.
- Use clear examples and practical analogies.
- Keep answers organised with Markdown headings and bullet points when useful.
- For programming questions, include correct code and explain it step by step.
- For exam questions, include a concise exam-ready answer where useful.
- If a question is outside study topics, answer politely and briefly.
- Never invent facts. Clearly say when you are unsure.

Conversation so far:
${conversation}

Now answer the student's latest question. Continue naturally from the conversation.
`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });

    return Response.json({
      success: true,
      text: response.text ?? "I couldn't prepare an answer. Please try again.",
    });
  } catch (error) {
    console.error("Gemini chat error:", error?.message ?? error);
    return Response.json(
      { error: "Unable to get an AI response right now. Please try again." },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/ask-ai",
  method: "POST",
};
