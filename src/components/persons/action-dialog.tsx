"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Scan } from "lucide-react";
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
import { SelectDropdown } from "@/components/select-dropdown";
import { Person, PersonTypeEnum } from "@/types";
import { personFormSchema, type PersonForm } from "@/schemas";

type ScanStatus = "idle" | "scanning" | "success" | "error";

export function PersonsActionDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
  isDuplicateUuid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Person;
  onSuccess?: () => void;
  isDuplicateUuid?: (uuid: string) => boolean;
}) {
  const isEdit = !!currentRow;

  // ─── Scan state ────────────────────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string | null>(null);

  // ─── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<PersonForm>({
    resolver: zodResolver(personFormSchema),
    defaultValues: isEdit
      ? {
          firstName: currentRow.first_name,
          lastName: currentRow.last_name,
          rfidUuid: currentRow.rfid_uuid,
          type: currentRow.type,
          photo: currentRow.photo ?? undefined,
          isEdit,
        }
      : {
          firstName: "",
          lastName: "",
          rfidUuid: "",
          type: "",
          photo: "",
          isEdit,
        },
  });

  // ─── Scan handlers ─────────────────────────────────────────────────────────
  const startScanning = useCallback(() => {
    setIsScanning(true);
    setScanStatus("scanning");
    setScanError(null);
    setLastScanTimestamp(new Date().toISOString());
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setScanStatus("idle");
  }, []);

  // Poll /api/scan every 500 ms while scanning
  useEffect(() => {
    if (!isScanning || !open) return;

    const poll = setInterval(async () => {
      try {
        const url = lastScanTimestamp
          ? `/api/scan?since=${encodeURIComponent(lastScanTimestamp)}`
          : "/api/scan";
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok && data.success && data.rfid_uuid) {
          if (isDuplicateUuid?.(data.rfid_uuid)) {
            setScanStatus("error");
            setScanError(`UUID ${data.rfid_uuid} already exists. Please use a different badge.`);
            setIsScanning(false);
            setTimeout(() => { setScanStatus("idle"); setScanError(null); }, 3000);
            return;
          }

          form.setValue("rfidUuid", data.rfid_uuid, { shouldValidate: true });
          setScanStatus("success");
          setLastScanTimestamp(data.timestamp);
          setIsScanning(false);
          setTimeout(() => setScanStatus("idle"), 2000);
        }
      } catch {
        setScanStatus("error");
        setIsScanning(false);
        setTimeout(() => setScanStatus("idle"), 2000);
      }
    }, 500);

    return () => clearInterval(poll);
  }, [isScanning, open, lastScanTimestamp, isDuplicateUuid, form]);

  // Stop scanning when dialog closes
  useEffect(() => {
    if (!open && isScanning) stopScanning();
  }, [open, isScanning, stopScanning]);

  // ─── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: PersonForm) => {
    const url = isEdit ? `/api/persons/${currentRow.id}` : "/api/persons";
    const method = isEdit ? "PUT" : "POST";

    const body = {
      rfid_uuid: values.rfidUuid,
      type: values.type,
      last_name: values.lastName,
      first_name: values.firstName,
      photo: values.photo || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Operation failed");

      form.reset();
      onOpenChange(false);
      onSuccess?.();
      toast.success(isEdit ? "Person updated successfully." : "Person created successfully.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save person.");
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "Edit Person" : "Add New Person"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the person here. " : "Create new person here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="person-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 px-0.5"
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              {/* RFID UUID with scan button */}
              <FormField
                control={form.control}
                name="rfidUuid"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      RFID UUID
                    </FormLabel>
                    <div className="col-span-4 flex gap-2">
                      <FormControl>
                        <Input
                          placeholder={
                            isScanning
                              ? "Scanning… please scan the badge"
                              : "Enter UUID or scan badge"
                          }
                          disabled={isScanning}
                          className="flex-1"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={isScanning ? stopScanning : startScanning}
                        title={isScanning ? "Stop scanning" : "Start scanning badge"}
                        className={`size-9 shrink-0 transition-colors ${
                          isScanning
                            ? "border-destructive text-destructive hover:bg-destructive/10"
                            : scanStatus === "success"
                              ? "border-green-500 text-green-600 hover:bg-green-50"
                              : scanStatus === "error"
                                ? "border-destructive text-destructive"
                                : "border-primary text-primary hover:bg-primary/10"
                        }`}
                      >
                        <Scan
                          size={16}
                          className={isScanning ? "animate-pulse" : ""}
                        />
                      </Button>
                    </div>
                    {isScanning && (
                      <p className="col-span-4 col-start-3 text-xs text-primary flex items-center gap-1">
                        <span className="animate-pulse">●</span>
                        Listening for badge scan…
                      </p>
                    )}
                    {scanStatus === "success" && !isScanning && (
                      <p className="col-span-4 col-start-3 text-xs text-green-600">
                        ✓ Badge scanned successfully!
                      </p>
                    )}
                    {scanStatus === "error" && !isScanning && (
                      <p className="col-span-4 col-start-3 text-xs text-destructive">
                        ✗ {scanError ?? "Scan failed or duplicate UUID detected"}
                      </p>
                    )}
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Type</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select a type"
                      className="col-span-4"
                      items={Object.values(PersonTypeEnum).map((type) => ({
                        label: type.charAt(0).toUpperCase() + type.slice(1),
                        value: type,
                      }))}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Photo URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/photo.jpg"
                        className="col-span-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            form="person-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
