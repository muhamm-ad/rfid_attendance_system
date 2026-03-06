"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound } from "lucide-react";
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
import { jwtExpiresInSchema, type JwtExpiresInForm } from "@/schemas";

export function GenerateJwtDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (token: string) => void;
}) {
  const form = useForm<JwtExpiresInForm>({
    resolver: zodResolver(jwtExpiresInSchema),
    defaultValues: { expiresIn: "30d" },
  });

  const onSubmit = async (values: JwtExpiresInForm) => {
    try {
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ expiresIn: values.expiresIn.trim() }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate JWT.");
        return;
      }
      const token = data.token ?? "";
      form.reset({ expiresIn: "30d" });
      onOpenChange(false);
      onSuccess?.(token);
      toast.success("JWT token generated.");
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) form.reset({ expiresIn: "30d" });
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={20} /> Generate JWT Token
          </DialogTitle>
          <DialogDescription>
            Create a temporary JWT token for mobile apps or external SPAs.
            Specify the validity period (e.g. 30d, 7d, 24h).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="generate-jwt-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="expiresIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validity period</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 30d, 7d, 24h"
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
            form="generate-jwt-form"
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
