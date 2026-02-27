"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiKeyNameSchema, type ApiKeyNameForm } from "@/schemas";

export function GenerateApiKeyDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (apiKey: string) => void;
}) {
  const form = useForm<ApiKeyNameForm>({
    resolver: zodResolver(apiKeyNameSchema),
    defaultValues: { name: "API Key" },
  });

  const onSubmit = async (values: ApiKeyNameForm) => {
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: values.name.trim() }),
      });
      const data = (await res.json()) as { apiKey?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create API key.");
        return;
      }
      const key = data.apiKey ?? "";
      form.reset({ name: "API Key" });
      onOpenChange(false);
      onSuccess?.(key);
      toast.success("API key created. Copy it now — it won't be shown again.");
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) form.reset({ name: "API Key" });
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <Key size={20} /> Generate API Key
          </DialogTitle>
          <DialogDescription>
            Create a new API key for scripts, CLI, or automation. Give it a name
            to identify it later. The key will be shown only once.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="generate-api-key-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Production CLI"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="submit"
            form="generate-api-key-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
