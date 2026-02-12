// @/components/date-time-picker.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn-utils";
import { DROP_DOWN_LABEL_CLASSNAME } from "@/lib/ui-utils";

/** Date + time picker in a popover (shadcn-style) */
export default function DateTimePicker({
  label,
  dateValue,
  timeValue = "00:00",
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
  const [contentWidth, setContentWidth] = useState<number | undefined>(undefined);
  const triggerRef = useRef<HTMLDivElement>(null);
  const date = dateValue ? new Date(dateValue + "T00:00:00") : undefined;

  useEffect(() => {
    if (open && triggerRef.current) {
      setContentWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <div ref={triggerRef} className="relative w-full">
      {label && <label className={DROP_DOWN_LABEL_CLASSNAME}>{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            className={cn(
              "w-full justify-between font-normal",
              !dateValue && "text-muted-foreground",
            )}
          >
            {dateValue ? format(date!, "PPP") : "Select date"}
            <ChevronDownIcon className="h-4 w-4 text-(--brand) opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-4"
          align="start"
          style={contentWidth != null ? { width: contentWidth } : undefined}
        >
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${id}-date`}>Date</Label>
              <Input
                type="date"
                id={`${id}-date`}
                value={dateValue}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-time`}>Time</Label>
              <Input
                type="time"
                id={`${id}-time`}
                step="1"
                value={timeValue}
                onChange={(e) => onTimeChange?.(e.target.value)}
                className={cn(
                  "bg-background w-full appearance-none",
                  "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
                )}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
