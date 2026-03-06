"use client";

import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function ShowApiKeyDialog({
  open,
  onOpenChange,
  apiKey,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string | null;
  onClose?: () => void;
}) {
  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard.");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose?.();
    onOpenChange(next);
  };

  if (!apiKey) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <Key size={20} /> Your API Key
          </DialogTitle>
          <DialogDescription>
            Copy this key now. It will not be shown again. Store it securely.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg bg-muted p-4">
          <p className="font-mono text-sm break-all select-all">{apiKey}</p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-2 p-0 h-auto text-primary"
            onClick={handleCopy}
          >
            Copy to clipboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
