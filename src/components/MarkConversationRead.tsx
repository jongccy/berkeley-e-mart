"use client";

import { useEffect } from "react";
import { markConversationReadAction } from "@/app/actions/inbox";
import { useMessaging } from "@/components/messaging/MessagingProvider";

type Props = {
  conversationId: string;
};

export function MarkConversationRead({ conversationId }: Props) {
  const { refreshUnreadCount } = useMessaging();

  useEffect(() => {
    void markConversationReadAction(conversationId).then(() => {
      void refreshUnreadCount();
    });
  }, [conversationId, refreshUnreadCount]);

  return null;
}
