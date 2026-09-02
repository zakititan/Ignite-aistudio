import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bot,
  MessageSquare,
  Sparkles,
  X,
  Send,
  RotateCcw,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { getReadiness } from "@/lib/readiness";
import { getNextBestStep } from "@/lib/navigation-data";
import {
  STARTER_QUESTIONS,
  getBotResponse,
  type ChatMessage,
  type ChatbotContext,
} from "@/lib/chatbot-kb";
import { cn } from "@/lib/utils";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const { state } = useStore();
  const readiness = useMemo(
    () => getReadiness(state.tasks, state.business, state.ownership, state.customerJourneyTest),
    [state.tasks, state.business, state.ownership, state.customerJourneyTest],
  );
  const nextStep = useMemo(() => getNextBestStep(state), [state]);

  // Context for tailored answers
  const chatbotContext: ChatbotContext = useMemo(
    () => ({
      businessName: state.business.name || undefined,
      domain: state.business.domain || undefined,
      completionPercent: readiness.requiredCompletionPercent,
      blockersCount: readiness.blockers.length,
      nextStepTitle: nextStep.name,
      nextStepRoute: nextStep.route,
    }),
    [state.business.name, state.business.domain, readiness, nextStep],
  );

  // Initial welcome message
  const initialMessage: ChatMessage = useMemo(
    () => ({
      id: "welcome-1",
      sender: "bot",
      text: state.business.name
        ? `Hi! I'm your launch assistant for **${state.business.name}**. I can answer basic questions about connecting domains, DNS records, business email, website platforms, or preparing to launch.`
        : "Hi! I'm your launch assistant. I can answer basic questions about getting your business online, connecting domains, DNS records, business email, or pre-launch checks.",
      timestamp: new Date(),
      suggestedQuestions: STARTER_QUESTIONS.slice(0, 4),
    }),
    [state.business.name],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll on new messages or typing
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend ?? inputValue).trim();
    if (!query || isTyping) return;

    setHasInteracted(true);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");

    // Simulate AI thinking and response
    setIsTyping(true);
    const delay = Math.min(800, Math.max(400, query.length * 15));

    setTimeout(() => {
      const response = getBotResponse(query, chatbotContext);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        timestamp: new Date(),
        actions: response.actions,
        suggestedQuestions: response.suggestedQuestions,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleResetChat = () => {
    setMessages([initialMessage]);
    setIsTyping(false);
    setInputValue("");
  };

  return (
    <>
      {/* Floating launcher trigger button */}
      <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50">
        {!isOpen ? (
          <div className="relative group">
            <button
              type="button"
              id="ai-chatbot-trigger"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2.5 rounded-full bg-primary px-4 py-2.5 text-primary-foreground shadow-lg hover:bg-primary/95 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Open AI Launch Assistant"
            >
              <div className="relative flex items-center justify-center size-6 rounded-full bg-primary-foreground/15 text-primary-foreground">
                <Bot className="size-4 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-primary" />
              </div>
              <span className="text-xs font-semibold tracking-wide">Ask Assistant</span>
            </button>

            {/* Subtle introductory tooltip for first-time notice */}
            {!hasInteracted && (
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block sm:block animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
                <div className="rounded-lg bg-card px-3 py-1.5 text-[11px] font-medium text-card-foreground shadow-md border border-border whitespace-nowrap">
                  Questions about domains, DNS or launch? Ask here!
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Floating Chatbot Window */}
      {isOpen && (
        <aside
          aria-label="AI Launch Assistant"
          className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex flex-col w-[calc(100vw-24px)] sm:w-[390px] h-[520px] max-h-[calc(100vh-100px)] rounded-2xl border border-border/90 bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bot className="size-4.5" />
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">Launch Assistant</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                    AI FAQ
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Answers domain, DNS & launch questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={handleResetChat}
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </Button>
            </div>
          </header>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-1.5 max-w-[88%]",
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-xs"
                      : "bg-muted/70 text-foreground border border-border/60 rounded-bl-xs",
                  )}
                >
                  <div className="whitespace-pre-line space-y-1.5">
                    {msg.text.split("\n\n").map((para, i) => (
                      <p key={i} className="last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Optional Action links from bot response */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.actions.map((act) => (
                      <Button
                        key={act.to}
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] font-medium bg-background hover:bg-accent/70 border-primary/25 text-primary hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link to={act.to as never}>{act.label}</Link>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Suggested follow-up questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {msg.suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        className="rounded-full border border-border/80 bg-background/80 hover:bg-muted px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs bg-muted/60 border border-border/60 px-3.5 py-2.5 max-w-[70px]">
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick starter chips (shown when only initial welcome message is present) */}
          {messages.length === 1 && (
            <div className="px-3 pb-2">
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5 px-1">
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] text-foreground hover:bg-accent hover:border-primary/30 transition-colors text-left shadow-xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer input form */}
          <form
            onSubmit={handleFormSubmit}
            className="flex items-center gap-2 border-t border-border p-2.5 bg-card/60"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about domains, DNS, email, launch..."
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1.5 focus:ring-primary"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isTyping}
              className="size-8 rounded-xl shrink-0"
              aria-label="Send question"
            >
              <Send className="size-3.5" />
            </Button>
          </form>
        </aside>
      )}
    </>
  );
}
