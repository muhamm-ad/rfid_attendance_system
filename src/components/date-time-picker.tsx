// @/components/date-time-picker.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn-utils";
import {
  DROP_DOWN_LABEL_CLASSNAME,
  DATE_PICKER_TRIGGER_CLASSNAME,
  ERROR_CLASSNAME,
  FormFieldError,
} from "@/lib/ui-utils";

// ─── Validation helpers ────────────────────────────────────────────────────────

function validateDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) return "Invalid date.";
  return null;
}

function validateTime(timeStr: string): string | null {
  if (!timeStr) return null;
  // Accepts HH:MM or HH:MM:SS
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.test(timeStr);
  if (!match) return "Invalid time format (expected HH:MM or HH:MM:SS).";
  return null;
}

function validateNotInFuture(dateStr: string, timeStr?: string): string | null {
  if (!dateStr) return null;
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) return null; // already caught by validateDate

  const [hours, minutes, seconds] = (timeStr ?? "00:00:00")
    .split(":")
    .map(Number);
  const combined = new Date(parsed);
  combined.setHours(hours ?? 0, minutes ?? 0, seconds ?? 0, 0);

  if (combined > new Date()) return "Date and time cannot be in the future.";
  return null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/** Date + time picker in a popover with inline validation */
export default function DateTimePicker({
  label,
  dateValue = new Date().toISOString().split("T")[0],
  timeValue = new Date()
    .toISOString()
    .split("T")[1]
    .split(":")
    .slice(0, 2)
    .join(":"),
  onDateChange,
  onTimeChange,
  id,
}: {
  label?: React.ReactNode | string;
  dateValue: string;
  timeValue?: string;
  onDateChange: (value: string) => void;
  onTimeChange?: (value: string) => void;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const [contentWidth, setContentWidth] = useState<number | undefined>(
    undefined,
  );
  const [dateTouched, setDateTouched] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && triggerRef.current) {
      setContentWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  // Compute errors (only shown after the field has been touched)
  const rawDateError = validateDate(dateValue);
  const rawTimeError = timeValue ? validateTime(timeValue) : null;
  // Only check future if date + time are individually valid
  const rawFutureError =
    !rawDateError && !rawTimeError
      ? validateNotInFuture(dateValue, timeValue)
      : null;

  const dateError = dateTouched ? rawDateError : null;
  const timeError = timeTouched ? rawTimeError : null;
  // Show future error on whichever field was touched last (time takes priority)
  const futureError = dateTouched || timeTouched ? rawFutureError : null;

  const hasError = !!(dateError || timeError || futureError);

  const date = dateValue && !rawDateError ? new Date(dateValue) : undefined;

  return (
    <div ref={triggerRef} className="relative w-full">
      {label && <label className={DROP_DOWN_LABEL_CLASSNAME}>{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            className={DATE_PICKER_TRIGGER_CLASSNAME(dateValue, false, hasError)}
          >
            {date && timeValue
              ? `${format(date, "PP")} · ${timeValue}`
              : date
              ? format(date, "PPP")
              : timeValue
              ? timeValue
              : "Select date / time"}
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 opacity-70",
                hasError ? "text-destructive" : "text-(--brand)",
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-4"
          align="start"
          style={contentWidth != null ? { width: contentWidth } : undefined}
        >
          <div className="flex flex-col gap-4">
            {/* ── Date ── */}
            <div className="space-y-1">
              <Label
                htmlFor={`${id}-date`}
                className={cn(dateError && "text-destructive")}
              >
                Date
              </Label>
              <Input
                type="date"
                id={`${id}-date`}
                value={dateValue}
                onChange={(e) => {
                  setDateTouched(true);
                  onDateChange(e.target.value);
                }}
                className={cn("w-full", ERROR_CLASSNAME(!!dateError))}
              />
              <FormFieldError message={dateError ?? undefined} />
            </div>

            {/* ── Time ── */}
            <div className="space-y-1">
              <Label
                htmlFor={`${id}-time`}
                className={cn((timeError || futureError) && "text-destructive")}
              >
                Time
              </Label>
              <Input
                type="time"
                id={`${id}-time`}
                step="1"
                value={timeValue}
                onChange={(e) => {
                  setTimeTouched(true);
                  onTimeChange?.(e.target.value);
                }}
                className={cn(
                  "bg-background w-full appearance-none",
                  "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
                  ERROR_CLASSNAME(!!(timeError || futureError)),
                )}
              />
              <FormFieldError message={timeError ?? futureError ?? undefined} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
