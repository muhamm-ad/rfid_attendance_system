"use client";

import { LucideIcon, AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/cn-utils";

type MessageType = "error" | "success" | "warning" | "info";

interface FormMessageProps {
  type: MessageType;
  message: string;
  icon?: LucideIcon;
  className?: string;
}

interface MessageConfig {
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  defaultIcon: LucideIcon;
}

const messageConfig: Record<MessageType, MessageConfig> = {
  error: {
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    iconColor: "text-red-600",
    defaultIcon: AlertCircle,
  },
  success: {
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    iconColor: "text-green-600",
    defaultIcon: CheckCircle2,
  },
  warning: {
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    iconColor: "text-yellow-600",
    defaultIcon: AlertTriangle,
  },
  info: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    iconColor: "text-blue-600",
    defaultIcon: Info,
  },
};

export function FormMessage({
  type,
  message,
  icon,
  className,
}: FormMessageProps) {
  const config = messageConfig[type];
  const IconComponent = icon || config.defaultIcon;

  return (
    <div
      className={cn(
        "rounded-md border p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <IconComponent
        className={cn("h-5 w-5 mt-0.5 shrink-0", config.iconColor)}
      />
      <p className={cn("text-sm mt-1", config.textColor)}>{message}</p>
    </div>
  );
}

export default FormMessage;