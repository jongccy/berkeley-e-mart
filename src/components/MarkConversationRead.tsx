"use client";

import { useEffect } from "react";
import { markConversationReadAction } from "@/app/actions/inbox";

type Props = {
  conversationId: string;
};

export function MarkConversationRead({ conversationId }: Props) {
  useEffect(() => {
    void markConversationReadAction(conversationId);
  }, [conversationId]);

  return null;
}
