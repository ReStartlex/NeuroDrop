"use client";

import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { OrderMessage } from "@/lib/db/schema";

type Props = {
  orderId: string;
  initialMessages: OrderMessage[];
  currentUserId: string;
  asAdmin?: boolean;
};

const POLL_MS = 3000;

export function OrderChat({ orderId, initialMessages, currentUserId, asAdmin }: Props) {
  const [messages, setMessages] = useState<OrderMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(initialMessages[initialMessages.length - 1]?.id ?? null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let aborted = false;

    async function poll() {
      try {
        const res = await fetch(`/api/orders/${orderId}/messages`, {
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        if (!res.ok) return;
        const json = (await res.json()) as { ok: true; data: { messages: OrderMessage[] } };
        if (aborted) return;
        const fetched = json.data.messages;
        if (fetched.length > 0) {
          const last = fetched[fetched.length - 1];
          if (last && last.id !== lastIdRef.current) {
            lastIdRef.current = last.id;
          }
        }
        setMessages(fetched);
      } catch {
        // Silently swallow — next tick will retry
      }
    }

    const handle = setInterval(poll, POLL_MS);
    return () => {
      aborted = true;
      clearInterval(handle);
    };
  }, [orderId]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        toast.error(json?.error?.message ?? "Не удалось отправить");
        return;
      }
      setDraft("");
      const json = (await res.json()) as { data: { message: OrderMessage } };
      setMessages((prev) => [...prev, json.data.message]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Сетевая ошибка");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40">
      <div
        ref={scrollRef}
        className="flex max-h-[420px] min-h-[260px] flex-col gap-3 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="m-auto text-center text-sm text-[var(--color-fg-subtle)]">
            Здесь появятся сообщения от менеджера.
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isMine={m.senderUserId === currentUserId}
              asAdmin={asAdmin ?? false}
            />
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex items-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]/60 p-3"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder={asAdmin ? "Ответить покупателю…" : "Написать менеджеру…"}
          rows={1}
          className="min-h-9 max-h-32 flex-1 resize-none rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)]/80 px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus-visible:border-[var(--color-accent)] focus-visible:outline-none"
        />
        <Button type="submit" size="md" disabled={sending || draft.trim().length === 0}>
          <Send className="size-4" />
          <span className="hidden sm:inline">Отправить</span>
        </Button>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  isMine,
  asAdmin,
}: {
  message: OrderMessage;
  isMine: boolean;
  asAdmin: boolean;
}) {
  if (message.senderRole === "system") {
    return (
      <div className="mx-auto flex max-w-md items-start gap-2 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 py-2 text-xs text-[var(--color-fg-muted)]">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[var(--color-accent)]" />
        <span>{message.text}</span>
      </div>
    );
  }

  const ownSide = (isMine && !asAdmin) || (asAdmin && message.senderRole === "admin");
  const isAdminMessage = message.senderRole === "admin";

  return (
    <div className={cn("flex flex-col gap-1", ownSide ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-[var(--radius-md)] px-3 py-2 text-sm",
          ownSide
            ? "bg-[var(--color-accent)]/15 text-[var(--color-fg)]"
            : isAdminMessage
              ? "border border-[var(--color-accent-indigo)]/40 bg-[var(--color-accent-indigo)]/5 text-[var(--color-fg)]"
              : "border border-[var(--color-border)] bg-[var(--color-surface)]/80 text-[var(--color-fg)]",
        )}
      >
        <span className="whitespace-pre-wrap break-words">{message.text}</span>
      </div>
      <span className="font-mono text-[10px] text-[var(--color-fg-subtle)]">
        {isAdminMessage ? "Менеджер · " : ""}
        {new Date(message.createdAt).toLocaleString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        })}
      </span>
    </div>
  );
}
