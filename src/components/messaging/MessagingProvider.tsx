"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { resolvePublicName } from "@/lib/profile-display";
import { MessageToastStack, type MessageToastItem } from "./MessageToastStack";
import type { Message } from "@/types/database";

type InboxMessageHandler = (message: Message) => void;
type ThreadMessageHandler = (message: Message) => void;

type MessagingContextValue = {
  unreadCount: number;
  setActiveConversationId: (conversationId: string | null) => void;
  registerInboxHandler: (handler: InboxMessageHandler) => () => void;
  registerThreadHandler: (
    conversationId: string,
    handler: ThreadMessageHandler
  ) => () => void;
  refreshUnreadCount: () => Promise<void>;
};

const MessagingContext = createContext<MessagingContextValue | null>(null);

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within MessagingProvider");
  }
  return context;
}

export function useMessagingOptional() {
  return useContext(MessagingContext);
}

type Props = {
  userId: string;
  initialUnreadCount: number;
  children: React.ReactNode;
};

export function MessagingProvider({
  userId,
  initialUnreadCount,
  children,
}: Props) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [toasts, setToasts] = useState<MessageToastItem[]>([]);
  const activeConversationIdRef = useRef<string | null>(null);
  const inboxHandlersRef = useRef(new Set<InboxMessageHandler>());
  const threadHandlersRef = useRef(new Map<string, Set<ThreadMessageHandler>>());

  const refreshUnreadCount = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_unread_inbox_count");
    if (!error && typeof data === "number") {
      setUnreadCount(data);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<MessageToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }].slice(-3));

      window.setTimeout(() => {
        dismissToast(id);
      }, 5000);
    },
    [dismissToast]
  );

  const registerInboxHandler = useCallback((handler: InboxMessageHandler) => {
    inboxHandlersRef.current.add(handler);
    return () => {
      inboxHandlersRef.current.delete(handler);
    };
  }, []);

  const registerThreadHandler = useCallback(
    (conversationId: string, handler: ThreadMessageHandler) => {
      const handlers =
        threadHandlersRef.current.get(conversationId) ?? new Set();
      handlers.add(handler);
      threadHandlersRef.current.set(conversationId, handlers);

      return () => {
        const current = threadHandlersRef.current.get(conversationId);
        if (!current) return;
        current.delete(handler);
        if (current.size === 0) {
          threadHandlersRef.current.delete(conversationId);
        }
      };
    },
    []
  );

  const setActiveConversationId = useCallback((conversationId: string | null) => {
    activeConversationIdRef.current = conversationId;
  }, []);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function handleIncomingMessage(message: Message) {
      if (message.sender_id === userId) return;

      const threadHandlers = threadHandlersRef.current.get(
        message.conversation_id
      );
      threadHandlers?.forEach((handler) => handler(message));
      inboxHandlersRef.current.forEach((handler) => handler(message));

      const isViewingThread =
        activeConversationIdRef.current === message.conversation_id;

      if (!isViewingThread) {
        void refreshUnreadCount();

        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "display_name, show_real_name, marketplace_alias, is_verified_berkeley"
          )
          .eq("id", message.sender_id)
          .maybeSingle();

        pushToast({
          conversationId: message.conversation_id,
          senderName: resolvePublicName(profile),
          body: message.body,
        });
      }
    }

    async function subscribe() {
      // Realtime uses a separate WebSocket auth context. Wait for the session
      // and set it explicitly so RLS policies that use auth.uid() work in prod.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }

      if (channel) {
        await supabase.removeChannel(channel);
        channel = null;
      }

      channel = supabase
        .channel(`user-messages:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            void handleIncomingMessage(payload.new as Message);
          }
        )
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Messaging realtime subscribe failed:", status, err);
          }
        });
    }

    void subscribe();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        if (session?.access_token) {
          void supabase.realtime.setAuth(session.access_token);
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [userId, pushToast, refreshUnreadCount]);

  return (
    <MessagingContext.Provider
      value={{
        unreadCount,
        setActiveConversationId,
        registerInboxHandler,
        registerThreadHandler,
        refreshUnreadCount,
      }}
    >
      {children}
      <MessageToastStack toasts={toasts} onDismiss={dismissToast} />
    </MessagingContext.Provider>
  );
}
