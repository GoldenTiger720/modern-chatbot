"use client";

import { useState } from "react";
import { Message, Conversation } from "@/lib/types";
import { ChatList } from "@/components/chat-list";
import { ChatInput } from "@/components/chat-input";
import { Sidebar, ChatRole } from "@/components/sidebar";
import { ThinkingAnimation } from "@/components/thinking-animation";

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

  const handleSendMessage = async (content: string, files?: File[]) => {
    let conversation = currentConversation;

    if (!conversation) {
      conversation = createNewConversation();
      setConversations([conversation, ...conversations]);
      setCurrentConversationId(conversation.id);
    }

    let messageContent = content;

    // If files are attached, add file information to the message
    if (files && files.length > 0) {
      const fileNames = files.map(f => f.name).join(", ");
      messageContent = content
        ? `${content}\n\n[Documentos anexados: ${fileNames}]`
        : `[Documentos anexados: ${fileNames}]`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
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
      let baseMessage = "";
      switch (currentRole) {
        case "geral":
          baseMessage = "Você é um assistente geral útil e prestativo.";
          break;
        case "tutor":
          baseMessage = "Você é um tutor de texto especializado. Ajude os usuários a melhorar sua escrita, gramática e estilo. Forneça feedback construtivo e sugestões de melhoria.";
          break;
        case "analisador":
          baseMessage = "Você é um analisador de documentos especializado. Ajude os usuários a analisar, resumir e extrair informações importantes de documentos.";
          break;
        default:
          baseMessage = "Você é um assistente útil.";
      }

      if (files && files.length > 0) {
        const fileInfo = files.map(f => `${f.name} (${(f.size / 1024).toFixed(2)} KB)`).join(", ");
        baseMessage += ` O usuário anexou os seguintes documentos: ${fileInfo}. Por favor, analise e responda às perguntas sobre esses documentos.`;
      }

      return baseMessage;
    };

    try {
      let response;

      // If files are attached, use FormData
      if (files && files.length > 0) {
        const formData = new FormData();

        // Add messages as JSON string
        formData.append(
          "messages",
          JSON.stringify([
            { role: "system", content: getRoleSystemMessage() },
            ...updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ])
        );

        // Add files
        files.forEach((file) => {
          formData.append("files", file);
        });

        response = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });
      } else {
        // Regular JSON request
        response = await fetch("/api/chat", {
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
      }

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
          <div className="flex-1 overflow-hidden">
            <ChatList messages={currentConversation?.messages || []} />
            {isLoading && <ThinkingAnimation />}
          </div>
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            showAttachment={currentRole === "analisador"}
          />
        </main>
      </div>
    </div>
  );
}
