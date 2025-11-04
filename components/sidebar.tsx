"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Pencil, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatRole = "geral" | "tutor" | "analisador";

interface SidebarProps {
  currentRole: ChatRole;
  onRoleChange: (role: ChatRole) => void;
  onDeleteAll?: () => void;
}

export function Sidebar({ currentRole, onRoleChange, onDeleteAll }: SidebarProps) {
  const menuItems = [
    {
      id: "geral" as ChatRole,
      label: "Geral",
      icon: MessageSquare,
    },
    {
      id: "tutor" as ChatRole,
      label: "Tutor de Texto",
      icon: Pencil,
    },
    {
      id: "analisador" as ChatRole,
      label: "Analisador de Documentos",
      icon: FileText,
    },
  ];

  return (
    <div className="flex flex-col h-full w-64 border-r border-border bg-muted/20">
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRole === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onRoleChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-300 hover:bg-muted/50"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <Button
          onClick={onDeleteAll}
          variant="destructive"
          className="w-full justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Excluir Tudo
        </Button>
      </div>
    </div>
  );
}
