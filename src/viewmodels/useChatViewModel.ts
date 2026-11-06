import { useEffect, useRef, useState } from "react";
import {
  CHAT_LIMIT,
  type ChatContext,
  type ChatMessage,
  createChatReply,
  welcomeMessage,
} from "../models/chat";

export function useChatViewModel(context: ChatContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPrompt = useRef("");

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function sendMessage(prompt = draft) {
    if (timer.current) return false;
    const content = prompt.trim();
    if (!content) return false;
    if (content.length > CHAT_LIMIT) {
      setError(`Keep your message within ${CHAT_LIMIT} characters.`);
      return false;
    }
    const reply = createChatReply(content, context, previousPrompt.current);
    if (
      !/^(why|more|details|tell me more|continue|为什么|继续|更多|详细)[?？.!\s]*$/i.test(
        content,
      )
    )
      previousPrompt.current = content;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content },
    ]);
    setDraft("");
    setError("");
    setPending(true);
    timer.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
      setPending(false);
      timer.current = null;
    }, 450);
    return true;
  }

  function clearConversation() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    previousPrompt.current = "";
    setPending(false);
    setError("");
    setDraft("");
    setMessages([welcomeMessage]);
  }

  return {
    messages,
    draft,
    pending,
    error,
    setDraft,
    sendMessage,
    clearConversation,
  };
}

export type ChatViewModel = ReturnType<typeof useChatViewModel>;
