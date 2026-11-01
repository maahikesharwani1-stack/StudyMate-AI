import { useState, useRef } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from "html2pdf.js";

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [time, setTime] = useState("25:00");
const [topic, setTopic] = useState("");
const [generatedNotes, setGeneratedNotes] = useState("");
const [isGenerating, setIsGenerating] = useState(false);
const [notesError, setNotesError] = useState("");
const notesRef = useRef(null);
  const menu = [
    { name: "Dashboard", icon: "⌂" },
    { name: "AI Assistant", icon: "✦" },
    { name: "Study Notes", icon: "▤" },
    { name: "Generate Quiz", icon: "☷" },
    { name: "My Subjects", icon: "▣" },
    { name: "Study Timer", icon: "◷" },
  ];

  const subjects = ["Data Structures", "Java Programming", "DBMS", "Software Engineering"];
  
const handleGenerateNotes = async () => {
  if (!topic.trim()) {
    setNotesError("Please enter a topic first.");
    return;
  }

  setIsGenerating(true);
  setNotesError("");
  setGeneratedNotes("");

  try {
    const apiUrl = import.meta.env.DEV
      ? "http://localhost:3001/api/generate-notes"
      : "/api/generate-notes";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topic: topic,
        level: "beginner"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate notes");
    }

    setGeneratedNotes(data.text);
  } catch (error) {
    setNotesError(error.message);
  } finally {
    setIsGenerating(false);
  }
};

const handleAskAI = async (event) => {
  event.preventDefault();

  const trimmedQuestion = question.trim();
  if (!trimmedQuestion || isChatLoading) return;

  const updatedMessages = [
    ...chatMessages,
    { role: "user", content: trimmedQuestion }
  ];

  setChatMessages(updatedMessages);
  setQuestion("");
  setChatError("");
  setIsChatLoading(true);

  try {
    const apiUrl = import.meta.env.DEV
      ? "http://localhost:3001/api/ask-ai"
      : "/api/ask-ai";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: updatedMessages })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to get an AI response.");
    }

    setChatMessages((current) => [
      ...current,
      { role: "assistant", content: data.text }
    ]);
  } catch (error) {
    setChatError(error.message || "Something went wrong. Please try again.");
  } finally {
    setIsChatLoading(false);
  }
};

const handleDownloadPDF = () => {
  if (!notesRef.current) return;

  const options = {
    margin: 10,
    filename: "StudyMate-AI-Study-Notes.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      backgroundColor: "#ffffff"
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    }
  };

  html2pdf().set(options).from(notesRef.current).save();
};
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <div>
            <h2>StudyMate AI</h2>
            <small>LEARN SMARTER</small>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>

        {menu.map((item) => (
          <button
            key={item.name}
            className={`nav-item ${activeTab === item.name ? "active" : ""}`}
            onClick={() => setActiveTab(item.name)}
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">S</div>
            <div>
              <strong>Student</strong>
              <small>Personal Workspace</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / </span>
            <strong>{activeTab}</strong>
          </div>
          <div className="top-right">
            <span className="online">● Online</span>
            <div className="avatar">S</div>
          </div>
        </header>

        <div className="content">
          {activeTab === "Dashboard" && (
            <>
              <section className="welcome">
                <div>
                  <span className="tag">YOUR PERSONAL LEARNING SPACE</span>
                  <h1>Welcome back, Student! 👋</h1>
                  <p>Ready to learn something new today?</p>
                </div>
                <div className="welcome-icon">🎓</div>
              </section>

              <h2 className="section-title">Your Study Overview</h2>

              <div className="stats">
                <div className="stat-card">
                  <span>📚</span>
                  <p>Total Subjects</p>
                  <h2>04</h2>
                </div>
                <div className="stat-card">
                  <span>📝</span>
                  <p>Saved Notes</p>
                  <h2>{notes.length}</h2>
                </div>
                <div className="stat-card">
                  <span>🎯</span>
                  <p>Study Goal</p>
                  <h2>Daily</h2>
                </div>
              </div>

              <h2 className="section-title">Continue Learning</h2>

              <div className="subject-grid">
                {subjects.map((subject, i) => (
                  <div className="subject-card" key={subject}>
                    <div className="subject-icon">
                      {["💻", "☕", "🗄️", "⚙️"][i]}
                    </div>
                    <h3>{subject}</h3>
                    <p>Continue your learning journey</p>
                    <button onClick={() => setActiveTab("My Subjects")}>
                      Open Subject →
                    </button>
                  </div>
                ))}
              </div>

              <div className="ai-banner">
                <div>
                  <span>✦ AI POWERED LEARNING</span>
                  <h2>Your AI Study Companion</h2>
                  <p>Ask questions, understand concepts and improve your skills.</p>
                  <button onClick={() => setActiveTab("AI Assistant")}>
                    Ask AI Assistant →
                  </button>
                </div>
                <div className="ai-art">🤖</div>
              </div>
            </>
          )}

          {activeTab === "AI Assistant" && (
            <section className="panel assistant-panel">
              <span className="tag">✦ YOUR PERSONAL AI TUTOR</span>
              <h1>AI Assistant</h1>
              <p>Ask a question about your BCA subjects and get a simple explanation.</p>

              <div className="chat-box">
                <div className="chat-thread" aria-live="polite">
                  {chatMessages.length === 0 && (
                    <>
                      <div className="bot-message">
                        ✨ Hello! I'm your StudyMate AI tutor. Ask me anything you're learning today.
                      </div>
                      <div className="suggestions">
                        {["Explain DBMS keys", "Teach me Java OOP", "What is a data structure?"].map(
                          (q) => (
                            <button key={q} type="button" onClick={() => setQuestion(q)}>
                              {q}
                            </button>
                          )
                        )}
                      </div>
                    </>
                  )}

                  {chatMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`chat-message ${message.role === "user" ? "user-message" : "assistant-message"}`}
                    >
                      {message.role === "assistant" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="chat-message assistant-message typing-message">
                      StudyMate is thinking…
                    </div>
                  )}
                </div>

                {chatError && <p className="chat-error">{chatError}</p>}

                <form onSubmit={handleAskAI} className="chat-input">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask anything about your studies..."
                    aria-label="Your question"
                    disabled={isChatLoading}
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !question.trim()}
                    aria-label="Send question"
                  >
                    {isChatLoading ? "…" : "➤"}
                  </button>
                </form>
                <small className="muted">
                  Powered by Gemini AI. Ask follow-up questions to continue the conversation.
                </small>
              </div>
            </section>
          )}

          {activeTab === "Study Notes" && (
            <section className="panel">
              <span className="tag">YOUR PERSONAL LIBRARY</span>
              <h1>Study Notes 📝</h1>
              <p>Create and organise your study notes.</p>
              <input
  type="text"
  value={topic}
  onChange={(e) => setTopic(e.target.value)}
  placeholder="Enter topic (e.g. DBMS - Primary Key)"
/>

<button
  className="primary-btn"
  onClick={handleGenerateNotes}
  disabled={isGenerating}
>
  {isGenerating ? "Generating..." : "Generate Notes"}
</button>

{notesError && <p>{notesError}</p>}

{generatedNotes && (
  <>
  <div className="generated-notes" ref={notesRef}>
    <div className="pdf-heading">
  <h1>StudyMate AI</h1>
  <p>Your Personal Learning Companion</p>
  <h3>Topic: {topic}</h3>
</div>
    <h2>AI Generated Notes</h2>
    <div className="markdown-content">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {generatedNotes}
  </ReactMarkdown>
</div>

  </div>
  <button
  className="primary-btn"
  onClick={handleDownloadPDF}
>
  Download PDF
</button>
</>
)}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your study notes here..."
              />
              <button
                className="primary-btn"
                onClick={() => {
                  if (note.trim()) {
                    setNotes([...notes, note]);
                    setNote("");
                  }
                }}
              >
                + Save Note
              </button>
              <h2 className="section-title">Saved Notes</h2>
              {notes.map((n, i) => (
                <div className="saved-note" key={i}>
                  {n}
                </div>
              ))}
            </section>
          )}

          {activeTab === "Generate Quiz" && (
            <section className="panel">
              <span className="tag">TEST YOUR KNOWLEDGE</span>
              <h1>Generate Quiz 🧠</h1>
              <p>Prepare yourself with practice questions.</p>
              <div className="feature-card">
                <h2>Quiz Generator</h2>
                <p>Select a subject to prepare your quiz.</p>
                {subjects.map((s) => (
                  <button
                    className="choice-btn"
                    key={s}
                    onClick={() =>
                      alert("Quiz for " + s + " will be added in the next stage.")
                    }
                  >
                    {s} →
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === "My Subjects" && (
            <section className="panel">
              <span className="tag">YOUR LEARNING MATERIAL</span>
              <h1>My Subjects 📚</h1>
              <p>Explore your subjects and learning resources.</p>
              <div className="subject-grid">
                {subjects.map((s, i) => (
                  <div className="subject-card" key={s}>
                    <div className="subject-icon">📖</div>
                    <h3>{s}</h3>
                    <p>Learning resources and practice</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "Study Timer" && (
            <section className="panel timer-panel">
              <span className="tag">FOCUS ON YOUR GOALS</span>
              <h1>Study Timer ⏱️</h1>
              <p>Make every study minute count.</p>
              <div className="timer">{time}</div>
              <button
                className="primary-btn"
                onClick={() => setTime(time === "25:00" ? "00:00" : "25:00")}
              >
                Reset Timer
              </button>
              <p className="muted">Pomodoro timer – 25 minute study session</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
