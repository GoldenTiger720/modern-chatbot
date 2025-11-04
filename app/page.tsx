"use client";

import { useState } from "react";
import { Message, Conversation } from "@/lib/types";
import { ChatList } from "@/components/chat-list";
import { ChatInput } from "@/components/chat-input";
import { Sidebar, ChatRole } from "@/components/sidebar";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [currentRole, setCurrentRole] = useState<ChatRole>("geral");
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

    const getRoleSystemMessage = () => {
      switch (currentRole) {
        case "geral":
          return "Você é um assistente geral útil e prestativo.";
        case "tutor":
          return "Você é um tutor de texto especializado. Ajude os usuários a melhorar sua escrita, gramática e estilo. Forneça feedback construtivo e sugestões de melhoria.";
        case "analisador":
          return "Você é um analisador de documentos especializado. Ajude os usuários a analisar, resumir e extrair informações importantes de documentos.";
        default:
          return "Você é um assistente útil.";
      }
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: getRoleSystemMessage() },
            ...updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
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

  const handleRoleChange = (role: ChatRole) => {
    setCurrentRole(role);
    setCurrentConversationId(null);
  };

  const handleDeleteAll = () => {
    setConversations([]);
    setCurrentConversationId(null);
  };

  const getRoleTitle = () => {
    switch (currentRole) {
      case "geral":
        return "Geral";
      case "tutor":
        return "Tutor de Texto";
      case "analisador":
        return "Analisador de Documentos";
      default:
        return "Chatbot Moderno";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onDeleteAll={handleDeleteAll}
      />
      <div className="flex flex-col flex-1">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="flex h-14 items-center px-4">
            <h1 className="text-lg font-semibold">
              {getRoleTitle()}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col">
          <ChatList messages={currentConversation?.messages || []} />
          {isLoading && (
            <div className="flex items-center justify-center py-4 border-t border-border/40">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Pensando...
              </span>
            </div>
          )}
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </main>
      </div>
    </div>
  );
}
