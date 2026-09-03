import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bot, X, Send, RotateCcw, Sparkles, ShieldCheck } from "lucide-react";
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

type ChatMode = "local" | "ai";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [aiConsent, setAiConsent] = useState<"unset" | "ai" | "local">(() => {
    try {
      const v = localStorage.getItem("cornerstone_ai_consent");
      if (v === "ai" || v === "local") return v;
      return "unset";
    } catch {
      return "unset";
    }
  });
  const [aiError, setAiError] = useState<string | null>(null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);

  const { state } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const readiness = useMemo(
    () => getReadiness(state.tasks, state.business, state.ownership, state.customerJourneyTest),
    [state.tasks, state.business, state.ownership, state.customerJourneyTest],
  );
  const nextStep = useMemo(() => getNextBestStep(state), [state]);

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
  const [conversation, setConversation] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  // countdown for rate limit
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (!rateLimitedUntil) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [rateLimitedUntil]);

  const isRateLimited = rateLimitedUntil !== null && nowTick < rateLimitedUntil;

  const persistConsent = (value: "ai" | "local") => {
    setAiConsent(value);
    try {
      localStorage.setItem("cornerstone_ai_consent", value);
    } catch {
      /* ignore */
    }
  };

  const buildAiContext = () => {
    const business = state.business as unknown as Record<string, unknown>;
    return {
      currentRoute: pathname,
      pageTitle: typeof document !== "undefined" ? document.title : undefined,
      business: {
        category: state.business.category || undefined,
        model: state.business.customerModel || undefined,
        primaryGoal: state.business.primaryGoal || undefined,
        primaryCustomerAction: (business.primaryCustomerAction as string) || undefined,
        locationProvided: !!state.business.location,
        hasBusinessEmail: (state.business.needsBusinessEmail as string) || undefined,
        websiteStatus: (business.websiteUrlStatus as string) || undefined,
        websiteProvider:
          (business.websiteProvider as string) || state.ownership.websitePlatform || undefined,
        emailProvider: state.ownership.emailProvider || undefined,
        domainStatus: state.business.preferredDomain
          ? "preferred"
          : state.business.ownedDomain
            ? "owned"
            : state.business.domain
              ? "owned"
              : "none",
      },
      readiness: {
        status: readiness.status,
        requiredCompletionPercent: readiness.requiredCompletionPercent,
        blockerTitles: readiness.blockers.slice(0, 5).map((b) => b.title),
      },
      dns: state.dnsPlanning
        ? {
            impactLevel: undefined as unknown as "low" | "medium" | "high" | undefined,
            websiteChangePlanned: state.dnsPlanning.websiteChangeType !== undefined,
            businessEmailAtRisk: state.dnsPlanning.usesBusinessEmail === "yes",
          }
        : undefined,
      customerJourney: state.customerJourneyTest
        ? {
            type: state.customerJourneyTest.journeyType,
            status: state.customerJourneyTest.steps.every((s) => s.status === "passed")
              ? "passed"
              : state.customerJourneyTest.steps.some((s) => s.status === "blocked")
                ? "blocked"
                : state.customerJourneyTest.steps.some((s) => s.status === "needs_improvement")
                  ? "needs_improvement"
                  : "not_tested",
          }
        : undefined,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? inputValue).trim();
    if (!query || isTyping || isRateLimited) return;

    // Safety: block password-like content client-side quickly
    const lower = query.toLowerCase();
    if (
      ["password", "recovery code", "api key", "card number", "cvv"].some((k) => lower.includes(k))
    ) {
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, sender: "user", text: query, timestamp: new Date() },
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "Please do not enter passwords, recovery codes, payment details, or API keys. I'm here to help with domains, DNS, email, and launch steps.",
          timestamp: new Date(),
        },
      ]);
      if (!textToSend) setInputValue("");
      return;
    }

    setHasInteracted(true);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setAiError(null);

    // If local mode or consent unset and user hasn't chosen AI, use local KB
    const useAi = aiConsent === "ai";
    if (!useAi) {
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
        setConversation((prev) =>
          [
            ...prev.slice(-5),
            { role: "user", content: query },
            { role: "assistant", content: response.text },
          ].slice(-6),
        );
        setIsTyping(false);
      }, delay);
      return;
    }

    // AI path
    setIsTyping(true);
    try {
      const context = buildAiContext();
      const body = JSON.stringify({
        message: query,
        conversation: conversation.slice(-6),
        context,
      });
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

      if (!res.ok) {
        const err = data.error as
          { code?: string; message?: string; retryAfterSeconds?: number } | undefined;
        if (res.status === 429) {
          const retry = err?.retryAfterSeconds ?? 60;
          setRateLimitedUntil(Date.now() + retry * 1000);
          setAiError(
            err?.message ??
              "You have reached the assistant limit for now. Please try again shortly, or use the related guide while you wait.",
          );
          // Fallback to local KB
          const fallback = getBotResponse(query, chatbotContext);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: "bot",
              text: `${fallback.text}\n\n*AI temporarily limited — showing local guide.*`,
              timestamp: new Date(),
              actions: fallback.actions,
              suggestedQuestions: fallback.suggestedQuestions,
            },
          ]);
        } else if (err?.code === "AI_DISABLED") {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: "bot",
              text: "AI help is not available in this environment. You can still use Cornerstone's local guides.",
              timestamp: new Date(),
              actions: [{ label: "Open local help →", to: "/help" }],
            },
          ]);
        } else {
          setAiError(
            err?.message ?? "The AI service is temporarily unavailable. Please try again shortly.",
          );
          const fallback = getBotResponse(query, chatbotContext);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: "bot",
              text: fallback.text,
              timestamp: new Date(),
              actions: fallback.actions,
              suggestedQuestions: fallback.suggestedQuestions,
            },
          ]);
        }
        setConversation((prev) => [...prev.slice(-5), { role: "user", content: query }].slice(-6));
        return;
      }

      const aiData = data as {
        answer: string;
        recommendedAction?: { label: string; route: string; reason: string };
        safetyNotice?: string;
        suggestedQuestions?: string[];
      };
      const fullText = aiData.safetyNotice
        ? `${aiData.answer}\n\n*${aiData.safetyNotice}*`
        : aiData.answer;
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: fullText,
        timestamp: new Date(),
        actions: aiData.recommendedAction
          ? [{ label: aiData.recommendedAction.label, to: aiData.recommendedAction.route }]
          : undefined,
        suggestedQuestions: aiData.suggestedQuestions,
      };
      setMessages((prev) => [...prev, botMsg]);
      setConversation((prev) =>
        [
          ...prev.slice(-5),
          { role: "user", content: query },
          { role: "assistant", content: aiData.answer },
        ].slice(-6),
      );
    } catch {
      const fallback = getBotResponse(query, chatbotContext);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: fallback.text,
          timestamp: new Date(),
          actions: fallback.actions,
          suggestedQuestions: fallback.suggestedQuestions,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleResetChat = () => {
    setMessages([initialMessage]);
    setIsTyping(false);
    setInputValue("");
    setConversation([]);
    setAiError(null);
    setRateLimitedUntil(null);
  };

  const retrySeconds = rateLimitedUntil
    ? Math.max(0, Math.ceil((rateLimitedUntil - nowTick) / 1000))
    : 0;

  return (
    <>
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

      {isOpen && (
        <aside
          aria-label="AI Launch Assistant"
          className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex flex-col w-[calc(100vw-24px)] sm:w-[390px] h-[520px] max-h-[calc(100vh-100px)] rounded-2xl border border-border/90 bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
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
                    {aiConsent === "ai" ? "AI + Local" : "Local FAQ"}
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

          {aiConsent === "unset" && (
            <div className="border-b border-border bg-warning-soft/50 px-4 py-3 text-xs">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> AI assistance is optional.
              </p>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                Your question and selected non-sensitive setup context are sent to our AI service to
                create a response. Do not enter passwords, recovery codes, payment details, API
                keys, or private customer information.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={() => persistConsent("ai")}>
                  <Sparkles className="size-3 mr-1" /> Use AI assistance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => persistConsent("local")}
                >
                  Use local guides only
                </Button>
              </div>
            </div>
          )}

          {aiError && (
            <div className="mx-3 mt-3 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-foreground">
              <p className="font-medium">
                Assistant limit reached{retrySeconds > 0 ? ` — retry in ${retrySeconds}s` : ""}
              </p>
              <p className="text-muted-foreground mt-1">{aiError}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setAiError(null)}
                >
                  Continue with local guides
                </Button>
              </div>
            </div>
          )}

          {isRateLimited && (
            <div className="mx-3 mt-3 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs">
              <p className="font-medium">Please wait — retry in {retrySeconds}s</p>
              <p className="text-muted-foreground">
                You can still browse local guides while you wait.
              </p>
            </div>
          )}

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
            {isTyping && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs bg-muted/60 border border-border/60 px-3.5 py-2.5 max-w-[70px]">
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

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
              disabled={isTyping || isRateLimited}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isTyping || isRateLimited}
              className="size-8 rounded-xl shrink-0"
              aria-label="Send question"
            >
              <Send className="size-3.5" />
            </Button>
          </form>

          <div className="border-t border-border/50 px-3 py-1.5 flex items-center justify-between text-[10px] text-muted-foreground bg-muted/20">
            <span>{aiConsent === "ai" ? "AI + local guides" : "Local guides only"}</span>
            <button
              type="button"
              onClick={() => persistConsent(aiConsent === "ai" ? "local" : "ai")}
              className="underline underline-offset-2 hover:text-foreground"
            >
              {aiConsent === "ai" ? "Use local only" : "Enable AI"}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
