"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/cn-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { dateTimePickerSchema, type DateTimePickerForm } from "@/schemas";

type DatetimePickerProps = {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  /** When provided, renders in faceted-filter style: persistent title + badge when a date is selected */
  label?: string;
  triggerClassName?: string;
};

export function DatetimePicker({
  value,
  onChange,
  placeholder = "Pick a date & time",
  className,
  icon = <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />,
  label,
  triggerClassName,
}: DatetimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState<string>(() => {
    if (value) {
      const h = value.getHours().toString().padStart(2, "0");
      const m = value.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    }
    return "00:00";
  });

  const form = useForm<DateTimePickerForm>({
    resolver: zodResolver(dateTimePickerSchema),
    defaultValues: { datetime: value ?? undefined },
  });

  // Sync internal form state when the external value prop changes
  useEffect(() => {
    if (value) {
      form.setValue("datetime", value);
      const h = value.getHours().toString().padStart(2, "0");
      const m = value.getMinutes().toString().padStart(2, "0");
      setTime(`${h}:${m}`);
    } else {
      form.reset({ datetime: undefined });
      setTime("00:00");
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyDateTime(
    base: Date,
    timeStr: string,
    fieldOnChange: (d: Date) => void,
  ) {
    const [h, min] = timeStr.split(":").map(Number);
    const combined = new Date(base);
    combined.setHours(h ?? 0, min ?? 0, 0, 0);
    fieldOnChange(combined);
    onChange?.(combined);
  }

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="datetime"
        render={({ field }) => (
          <FormItem className={cn("flex flex-col", className)}>
            <div className={cn(label && "flex items-center gap-1")}>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className={cn(
                        "h-8",
                        isOpen && "bg-accent text-accent-foreground",
                        label
                          ? "border-dashed"
                          : cn(
                              "w-full justify-start font-normal",
                              !field.value && "text-muted-foreground",
                            ),
                        triggerClassName,
                      )}
                    >
                      {label ? (
                        <>
                          {icon}
                          {label}
                          {field.value && (
                            <>
                              <Separator
                                orientation="vertical"
                                className="mx-2 h-4"
                              />
                              <Badge
                                variant="brand"
                                className="rounded-sm px-1 font-normal"
                              >
                                {format(field.value, "PP")} · {time}
                              </Badge>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {icon}
                          {field.value
                            ? `${format(field.value, "PP")} · ${time}`
                            : placeholder}
                        </>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto p-0 flex flex-col"
                  align="start"
                >
                  <div className="flex items-start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={field.value}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          applyDateTime(selectedDate, time, field.onChange);
                          setIsOpen(false);
                        }
                      }}
                      startMonth={new Date(2000, 0)}
                      endMonth={new Date()}
                      disabled={(d) => d > new Date()}
                    />
                    <div className="w-[120px] my-4 mr-2">
                      <ScrollArea className="h-60">
                        <div className="flex flex-col gap-2">
                          {Array.from({ length: 96 }).map((_, i) => {
                            const hour = Math.floor(i / 4)
                              .toString()
                              .padStart(2, "0");
                            const minute = ((i % 4) * 15)
                              .toString()
                              .padStart(2, "0");
                            const timeValue = `${hour}:${minute}`;
                            return (
                              <Button
                                key={i}
                                type="button"
                                className="w-full text-left px-2"
                                variant={
                                  time === timeValue ? "default" : "outline"
                                }
                                onClick={() => {
                                  setTime(timeValue);
                                  if (field.value) {
                                    applyDateTime(
                                      field.value,
                                      timeValue,
                                      field.onChange,
                                    );
                                    setIsOpen(false);
                                  }
                                }}
                              >
                                {timeValue}
                              </Button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  {field.value && (
                    <div className="border-t p-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          field.onChange(undefined);
                          onChange?.(null);
                          setIsOpen(false);
                        }}
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </FormItem>
        )}
      />
    </Form>
  );
}
