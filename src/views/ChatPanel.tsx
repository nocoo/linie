import { Button, IconButton, TextArea, Tooltip } from "@radix-ui/themes";
import { ArrowUp, Bot, MessageSquare, RotateCcw, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { CHAT_LIMIT, chatSuggestions } from "../models/chat";
import type { ChatViewModel } from "../viewmodels/useChatViewModel";

export function ChatPanel({
  vm,
  onClose,
}: {
  vm: ChatViewModel;
  onClose: () => void;
}) {
  const input = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);
  useEffect(() => {
    const element = transcript.current;
    if (element && vm.messages.length > 0)
      element.scrollTop = element.scrollHeight;
  }, [vm.messages]);
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !document.querySelector('[role="dialog"]'))
        onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <aside
      className="chat-panel"
      id="operations-chat"
      aria-label="Operations assistant"
    >
      <header className="chat-heading">
        <MessageSquare size={16} />
        <div>
          <h2>Operations companion</h2>
          <span>LOCAL / SIMULATED RESPONSES</span>
        </div>
        <Tooltip content="Start a new conversation">
          <IconButton
            variant="ghost"
            size="1"
            aria-label="Clear conversation"
            onClick={vm.clearConversation}
          >
            <RotateCcw size={14} />
          </IconButton>
        </Tooltip>
        <IconButton
          variant="ghost"
          size="1"
          aria-label="Close chat"
          onClick={onClose}
        >
          <X size={16} />
        </IconButton>
      </header>
      <div className="chat-context">
        <span className="status-dot" />
        Current demo fleet<span>READ ONLY</span>
      </div>
      <div
        className="chat-transcript"
        ref={transcript}
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        aria-relevant="additions"
      >
        {vm.messages.map((message) => (
          <article
            className={`chat-message chat-message-${message.role}`}
            key={message.id}
          >
            <div className="message-author">
              {message.role === "assistant" && <Bot size={13} />}
              <strong>{message.role === "assistant" ? "LINIE" : "YOU"}</strong>
              <span>
                {message.role === "assistant" ? "SIMULATED" : "LOCAL OPERATOR"}
              </span>
            </div>
            <p>{message.content}</p>
          </article>
        ))}
        {vm.pending && (
          <div className="chat-pending" role="status">
            <span className="status-dot" />
            Composing a simulated response…
          </div>
        )}
      </div>
      {vm.messages.length === 1 && (
        <div className="chat-suggestions">
          <span className="sidebar-eyebrow">START WITH A QUESTION</span>
          {chatSuggestions.map((suggestion) => (
            <Button
              variant="outline"
              size="1"
              key={suggestion}
              onClick={() => vm.sendMessage(suggestion)}
            >
              {suggestion}
              <ArrowUp size={12} />
            </Button>
          ))}
        </div>
      )}
      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          vm.sendMessage();
        }}
      >
        <label htmlFor="chat-prompt">MESSAGE / OPERATIONS COMPANION</label>
        <TextArea
          ref={input}
          id="chat-prompt"
          placeholder="Ask about your infrastructure…"
          rows={3}
          maxLength={CHAT_LIMIT}
          value={vm.draft}
          onChange={(event) => vm.setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              vm.sendMessage();
            }
          }}
        />
        {vm.error && (
          <p role="alert" className="chat-error">
            {vm.error}
          </p>
        )}
        <div className="chat-composer-actions">
          <span>Enter to send · Shift + Enter for a new line</span>
          <Tooltip content="Send message">
            <IconButton
              type="submit"
              size="1"
              disabled={vm.pending || !vm.draft.trim()}
              aria-label="Send message"
            >
              <ArrowUp size={16} />
            </IconButton>
          </Tooltip>
        </div>
        <p className="chat-disclaimer">
          No AI service. No commands executed. Session-only history.
        </p>
      </form>
    </aside>
  );
}
