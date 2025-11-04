'use client';

import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className="w-full py-4 px-6">
      <div
        className={cn(
          "flex gap-3",
          isUser ? "flex-row-reverse justify-start" : "flex-row justify-start"
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-gradient-to-br from-emerald-500 to-cyan-600 text-white"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div
          className={cn(
            "space-y-2 overflow-hidden rounded-2xl px-4 py-3 max-w-[70%]",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50"
          )}
        >
          <p className="text-sm leading-6 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
