"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/format";
import type { Message } from "@/types/database";

type Props = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
};

export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;

    setSending(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        body: text,
      })
      .select()
      .single();

    setSending(false);
    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data as Message];
      });
    }
    setBody("");
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  isOwn
                    ? "bg-[#003262] text-white"
                    : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                <p>{msg.body}</p>
                <p
                  className={`mt-1 text-xs ${isOwn ? "text-blue-200" : "text-zinc-500"}`}
                >
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-[#003262] px-4 py-2 text-sm text-white hover:bg-[#002244] disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
