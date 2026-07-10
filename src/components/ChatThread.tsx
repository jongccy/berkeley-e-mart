"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage } from "@/app/actions/chat";
import { useMessaging } from "@/components/messaging/MessagingProvider";
import { formatRelativeTime } from "@/lib/format";
import type { Message } from "@/types/database";

type Props = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  messagingDisabled?: boolean;
  messagingDisabledMessage?: string;
};

export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
  messagingDisabled = false,
  messagingDisabledMessage = "You can't message this user.",
}: Props) {
  const { registerThreadHandler, setActiveConversationId } = useMessaging();
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  useEffect(() => {
    return registerThreadHandler(conversationId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
  }, [conversationId, registerThreadHandler]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (messagingDisabled) return;

    const text = body.trim();
    if (!text || sending) return;

    setSending(true);
    setError("");

    const result = await sendMessage(conversationId, text);
    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === result.message!.id)) return prev;
        return [...prev, result.message!];
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
        {messages.length === 0 && (
          <p className="text-center text-sm text-zinc-500">
            No messages yet. Say hello below.
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      {error && (
        <p className="border-t border-zinc-200 px-3 pt-2 text-sm text-red-600 dark:border-zinc-800 dark:text-red-400">
          {error}
        </p>
      )}
      {messagingDisabled ? (
        <p className="border-t border-zinc-200 px-3 py-3 text-sm text-zinc-500 dark:border-zinc-800">
          {messagingDisabledMessage}
        </p>
      ) : (
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
      )}
    </div>
  );
}
