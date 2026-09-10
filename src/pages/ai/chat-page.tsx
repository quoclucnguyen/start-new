"use client";

import * as React from "react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { SpinLoading } from "antd-mobile";
import {
  AlertTriangle,
  Bot,
  ChefHat,
  Clock,
  Flame,
  Send,
  X,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

// ============================================================================
// Tool result shapes (mirror of app/api/ai/chat/route.page.ts tool outputs)
// ============================================================================

interface ExpiringFoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string | null;
  storage: string | null;
  expirationDate: string;
  daysUntilExpiry: number;
}

interface ExpiringItemsToolResult {
  days: number;
  items: ExpiringFoodItem[];
}

interface SuggestedRecipe {
  recipeId: string;
  title: string;
  description: string | null;
  cookTimeMinutes: number;
  difficulty: string;
  matchPercentage: number;
  matchedIngredients: string[];
  missingIngredients: string[];
}

interface SuggestRecipesToolResult {
  totalRecipes: number;
  totalInventoryItems: number;
  recipes: SuggestedRecipe[];
}

type ChatTools = {
  getExpiringItems: {
    input: { days?: number };
    output: ExpiringItemsToolResult;
  };
  suggestRecipes: {
    input: { maxResults?: number };
    output: SuggestRecipesToolResult;
  };
};

type ChatMessage = UIMessage<never, never, ChatTools>;

// ============================================================================
// Transport
// ============================================================================

const chatTransport = new DefaultChatTransport<ChatMessage>({
  api: "/api/ai/chat",
  headers: async (): Promise<Record<string, string>> => {
    const {
      data: { session },
    } = await getSupabaseClient().auth.getSession();
    if (!session?.access_token) return {};
    return { Authorization: `Bearer ${session.access_token}` };
  },
});

const SUGGESTED_PROMPTS = [
  "Thực phẩm nào sắp hết hạn trong 7 ngày tới?",
  "Gợi ý cho mình vài món nấu từ nguyên liệu hiện có",
  "Có gì trong tủ bếp để nấu bữa tối nhanh gọn?",
];

// ============================================================================
// Tool result cards
// ============================================================================

function getDaysLabel(daysUntilExpiry: number): string {
  if (daysUntilExpiry < 0) return `Quá hạn ${Math.abs(daysUntilExpiry)} ngày`;
  if (daysUntilExpiry === 0) return "Hết hạn hôm nay";
  if (daysUntilExpiry === 1) return "Còn 1 ngày";
  return `Còn ${daysUntilExpiry} ngày`;
}

function getDaysBadgeClass(daysUntilExpiry: number): string {
  if (daysUntilExpiry <= 1) return "bg-destructive/10 text-destructive";
  if (daysUntilExpiry <= 3) return "bg-orange-500/10 text-orange-600";
  return "bg-amber-500/10 text-amber-600";
}

function ExpiringItemsCard({ result }: { result: ExpiringItemsToolResult }) {
  if (result.items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
        Không có thực phẩm nào sắp hết hạn trong {result.days} ngày tới. 👍
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Clock className="size-3.5" />
        Sắp hết hạn trong {result.days} ngày ({result.items.length} món)
      </p>
      <ul className="space-y-1.5">
        {result.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} {item.unit}
                {item.storage ? ` · ${item.storage}` : ""}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                getDaysBadgeClass(item.daysUntilExpiry),
              )}
            >
              {getDaysLabel(item.daysUntilExpiry)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SuggestRecipesCard({ result }: { result: SuggestRecipesToolResult }) {
  if (result.recipes.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
        Chưa có công thức nào khớp với nguyên liệu hiện có (kho:{" "}
        {result.totalInventoryItems} món, công thức: {result.totalRecipes}).
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {result.recipes.map((recipe) => (
        <div
          key={recipe.recipeId}
          className="rounded-2xl border border-border bg-background p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-5">{recipe.title}</p>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              <Flame className="size-3" />
              {recipe.matchPercentage}%
            </span>
          </div>
          {recipe.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {recipe.description}
            </p>
          ) : null}
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            {recipe.cookTimeMinutes} phút ·{" "}
            {recipe.difficulty === "easy"
              ? "Dễ"
              : recipe.difficulty === "hard"
                ? "Khó"
                : "Trung bình"}
          </p>
          {recipe.missingIngredients.length > 0 ? (
            <p className="mt-1.5 text-[11px] leading-4 text-orange-600">
              Còn thiếu: {recipe.missingIngredients.join(", ")}
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] leading-4 text-primary">
              Đủ nguyên liệu trong kho!
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ToolPendingCard({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
      <SpinLoading style={{ "--size": "16px" }} />
      {label}
    </div>
  );
}

function ToolErrorCard({ errorText }: { errorText: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>Không lấy được dữ liệu: {errorText}</span>
    </div>
  );
}

// ============================================================================
// Message rendering
// ============================================================================

function MessageParts({ message }: { message: ChatMessage }) {
  return (
    <>
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          if (!part.text) return null;
          return (
            <div
              key={index}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6",
                message.role === "user"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md bg-muted",
              )}
            >
              <p className="whitespace-pre-wrap">{part.text}</p>
            </div>
          );
        }

        if (part.type === "tool-getExpiringItems") {
          if (part.state === "output-available") {
            return <ExpiringItemsCard key={index} result={part.output} />;
          }
          if (part.state === "output-error") {
            return <ToolErrorCard key={index} errorText={part.errorText} />;
          }
          return (
            <ToolPendingCard
              key={index}
              label="Đang xem thực phẩm sắp hết hạn…"
            />
          );
        }

        if (part.type === "tool-suggestRecipes") {
          if (part.state === "output-available") {
            return <SuggestRecipesCard key={index} result={part.output} />;
          }
          if (part.state === "output-error") {
            return <ToolErrorCard key={index} errorText={part.errorText} />;
          }
          return (
            <ToolPendingCard key={index} label="Đang tìm món phù hợp…" />
          );
        }

        return null;
      })}
    </>
  );
}

// ============================================================================
// Page
// ============================================================================

interface ChatPageProps {
  className?: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ className }) => {
  const { messages, sendMessage, stop, status, error, clearError } =
    useChat<ChatMessage>({ transport: chatTransport });
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const isBusy = status === "submitted" || status === "streaming";

  React.useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    void sendMessage({ text });
    setInput("");
  };

  const handlePromptClick = (prompt: string) => {
    if (isBusy) return;
    void sendMessage({ text: prompt });
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-background", className)}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bot className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-5">Trợ lý AI</h1>
          <p className="text-xs text-muted-foreground">
            {isBusy
              ? "Đang trả lời…"
              : "Hỏi đáp về thực phẩm và món ăn từ kho của bạn"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <ChefHat className="size-8" />
            </div>
            <div>
              <p className="text-base font-bold">Mình có thể giúp gì cho bạn?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hỏi về thực phẩm sắp hết hạn hoặc gợi ý món ăn từ nguyên liệu
                đang có.
              </p>
            </div>
            <div className="flex w-full max-w-xs flex-col gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className="rounded-2xl border border-border bg-background px-4 py-2.5 text-left text-sm text-foreground active:bg-muted"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-2",
                message.role === "user" ? "items-end" : "items-start",
              )}
            >
              <MessageParts message={message} />
            </div>
          ))
        )}

        {status === "submitted" && (
          <div className="flex items-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
              <SpinLoading style={{ "--size": "16px" }} />
              <span className="text-sm text-muted-foreground">
                Trợ lý đang suy nghĩ…
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error ? (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">{error.message}</span>
          <button
            type="button"
            onClick={() => clearError()}
            className="shrink-0 rounded-full p-1 active:bg-destructive/10"
            aria-label="Đóng"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border bg-background px-3 py-3 pb-safe"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Nhập câu hỏi về thực phẩm…"
          className="min-w-0 flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={() => stop()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground active:bg-border"
            aria-label="Dừng"
          >
            <X className="size-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            aria-label="Gửi"
          >
            <Send className="size-4.5" />
          </button>
        )}
      </form>
    </div>
  );
};

export { ChatPage };
