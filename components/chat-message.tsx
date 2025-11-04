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
    <div
      className={cn(
        "group w-full border-b border-border/40 py-8 px-4 transition-colors",
        isUser ? "bg-background" : "bg-muted/30"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-gradient-to-br from-emerald-500 to-cyan-600 text-white"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          <p className="text-sm leading-7 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
