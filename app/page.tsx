"use client";

import { useState } from "react";
import { Message, Conversation } from "@/lib/types";
import { ChatList } from "@/components/chat-list";
import { ChatInput } from "@/components/chat-input";
import { Sidebar } from "@/components/sidebar";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  const createNewConversation = (): Conversation => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newConversation;
  };

  const handleNewChat = () => {
    const newConversation = createNewConversation();
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const handleSendMessage = async (content: string) => {
    let conversation = currentConversation;

    if (!conversation) {
      conversation = createNewConversation();
      setConversations([conversation, ...conversations]);
      setCurrentConversationId(conversation.id);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...conversation.messages, userMessage];

    setConversations((prevConversations) =>
      prevConversations.map((c) =>
        c.id === conversation!.id
          ? {
              ...c,
              messages: updatedMessages,
              title: c.messages.length === 0 ? content.slice(0, 50) : c.title,
              updatedAt: new Date(),
            }
          : c
      )
    );

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setConversations((prevConversations) =>
        prevConversations.map((c) =>
          c.id === conversation!.id
            ? {
                ...c,
                messages: [...updatedMessages, assistantMessage],
                updatedAt: new Date(),
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setConversations((prevConversations) =>
        prevConversations.map((c) =>
          c.id === conversation!.id
            ? {
                ...c,
                messages: [...updatedMessages, errorMessage],
                updatedAt: new Date(),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      <div className="flex flex-col flex-1">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="flex h-14 items-center px-4">
            <h1 className="text-lg font-semibold">
              {currentConversation?.title || "Modern Chatbot"}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col">
          <ChatList messages={currentConversation?.messages || []} />
          {isLoading && (
            <div className="flex items-center justify-center py-4 border-t border-border/40">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Thinking...
              </span>
            </div>
          )}
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </main>
      </div>
    </div>
  );
}
