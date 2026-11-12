"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, loadQuiz, portfolioId } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

export function AIAdvisorChat() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [engine, setEngine] = useState("local-glossary");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Ask me what an expense ratio is, or paste a claim that sounds too clean. I'll keep it plain.",
    },
  ]);

  useEffect(() => {
    const onAsk = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setOpen(true);
      if (detail) setText(detail);
    };
    window.addEventListener("ip-ask", onAsk);
    return () => window.removeEventListener("ip-ask", onAsk);
  }, []);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    const history = messages.slice(-6);
    setMessages((current) => [...current, { role: "user", content: message }]);
    setText("");
    setBusy(true);
    const quiz = loadQuiz();
    const context = quiz
      ? `${quiz.name} values climate ${quiz.climate}/5, energy ${quiz.energy}/5. Portfolio id ${portfolioId() ?? "not saved"}.`
      : null;
    try {
      const data = await api<{ reply: string; engine: string }>("/advisor/chat", {
        method: "POST",
        body: JSON.stringify({ message, history, context }),
      });
      setEngine(data.engine);
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "I can't reach the advisor API. Start the backend on port 8000 and try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
        <div className="card flex h-[min(70vh,440px)] w-[min(92vw,380px)] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#eadfcd] px-4 py-3">
            <div>
              <p className="font-semibold">Advisor</p>
              <p className="text-xs text-[#5d6b63]">{engine === "local-glossary" ? "Local explainer" : "Gemini"}</p>
            </div>
            <button className="text-sm" onClick={() => setOpen(false)} type="button">
              Close
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((item, index) => (
              <p
                key={index}
                className={
                  item.role === "user"
                    ? "ml-8 rounded-2xl bg-ink px-3 py-2 text-[#f6f1e6]"
                    : "mr-6 rounded-2xl bg-[#f3ecdf] px-3 py-2"
                }
              >
                {item.content}
              </p>
            ))}
            {busy && <p className="text-xs text-[#5d6b63]">Thinking…</p>}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-[#eadfcd] p-3">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="What is a green bond?"
              className="w-full rounded-full border border-[#e4d9c6] bg-white px-3 py-2 text-sm outline-none"
            />
            <button className="btn btn-ink px-4 py-2 text-sm" type="submit">
              Send
            </button>
          </form>
        </div>
    </div>
  );
}
