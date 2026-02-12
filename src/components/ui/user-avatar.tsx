// @/components/ui/user-avatar.tsx

"use client";

import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/ui-utils";
import { cn } from "@/lib/cn-utils";

export interface UserAvatarProps {
  /** Image URL. When empty or invalid, fallback (initials or icon) is shown. */
  src?: string | null;
  /** Display name, used for alt text and initials. */
  name: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  /** Extra class for the fallback (e.g. rounded-lg for nav). */
  fallbackClassName?: string;
}

export function UserAvatar({
  src,
  name,
  size = "default",
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const hasImage = typeof src === "string" && src.trim() !== "";
  const initials = getInitials(name);

  return (
    <Avatar size={size} className={cn(className)}>
      {hasImage && (
        <AvatarImage src={src} alt={name} className="object-cover" />
      )}
      <AvatarFallback
        className={cn("bg-muted text-muted-foreground", fallbackClassName)}
      >
        {initials ? (
          <span className="text-inherit">{initials}</span>
        ) : (
          <User className="size-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
