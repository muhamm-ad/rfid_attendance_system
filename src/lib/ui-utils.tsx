// @/lib/ui-utils.tsx

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "./cn-utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Label & focus constants ───────────────────────────────────────────────────

/** Single label style for filter dropdowns (Status, Action, Type, etc.) */
export const DROP_DOWN_LABEL_CLASSNAME =
  "mb-1.5 block text-sm font-medium theme-text-muted";

/** Label inside a form field (spacing handled by parent space-y). */
export const FORM_LABEL_CLASSNAME = "block text-sm font-medium theme-text-muted";

/** Focus ring applied on interactive controls (buttons, triggers, inputs). */
export const FOCUS_RING_CLASSNAME =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** SelectTrigger base class: focus ring + border. */
export const FILTER_SELECT_TRIGGER_CLASSNAME = cn(
  FOCUS_RING_CLASSNAME,
  "border-input",
);

/** Reset-filter button class: shrink + focus ring. */
export const RESET_FILTER_BUTTON_CLASSNAME = cn(
  "shrink-0",
  FOCUS_RING_CLASSNAME,
);

/**
 * Focus ring for *container* elements with nested interactive children
 * (e.g. a combobox trigger whose inner <input> receives focus).
 * Uses focus-within so the ring appears on the wrapper, not the child.
 */
export const FOCUS_WITHIN_RING_CLASSNAME =
  "focus-within:outline-none focus-within:ring-1 focus-within:ring-ring";

/** Ring applied when a popover / dropdown trigger is in its open state. */
export const OPEN_STATE_RING_CLASSNAME = "ring-1 ring-ring";

// ─── Conditional class helpers ────────────────────────────────────────────────

export const ERROR_CLASSNAME = (hasError: boolean) =>
  cn(hasError && "border-destructive focus-visible:ring-destructive");

export const DISABLED_CLASSNAME = (disabled: boolean) =>
  cn(disabled && "opacity-50 cursor-not-allowed");

export const MUTED_CLASSNAME = (muted: boolean) =>
  cn(muted && "text-muted-foreground");

export const FOCUSED_CLASSNAME = (focused: boolean) =>
  cn(focused && FOCUS_RING_CLASSNAME);

/** SelectTrigger class with optional disabled / error states. */
export const SELECT_TRIGGER_CLASSNAME = (
  disabled: boolean,
  hasError: boolean,
) =>
  cn(
    FILTER_SELECT_TRIGGER_CLASSNAME,
    DISABLED_CLASSNAME(disabled),
    ERROR_CLASSNAME(hasError),
  );

/** DateTimePicker trigger button class. */
export const DATE_PICKER_TRIGGER_CLASSNAME = (
  dateValue: string,
  disabled: boolean,
  hasError: boolean,
) =>
  cn(
    "w-full justify-between font-normal border-input",
    MUTED_CLASSNAME(!dateValue),
    DISABLED_CLASSNAME(disabled),
    ERROR_CLASSNAME(hasError),
  );

/** Base class for native form inputs and selects (text, file, select…). */
export const INPUT_CLASSNAME = (hasError: boolean) =>
  cn(
    "w-full px-3 py-2 border theme-border rounded-lg bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 focus:border-[var(--brand)] transition-colors",
    ERROR_CLASSNAME(hasError),
  );

/** Inline error message displayed beneath a form field. */
export function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

// ─── Shared FilterSelect component ────────────────────────────────────────────

export type FilterOption = { value: string; label: string };

/**
 * Reusable labelled Select for filter bars.
 * Treats the empty string as "all" internally.
 */
export function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  widthClass = "w-36",
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: readonly FilterOption[];
  widthClass?: string;
}) {
  const current = value || "all";
  return (
    <div className={widthClass}>
      <Label className={DROP_DOWN_LABEL_CLASSNAME}>{label}</Label>
      <Select
        value={current}
        onValueChange={(v) => onValueChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className={FILTER_SELECT_TRIGGER_CLASSNAME}>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ value: optVal, label: optLabel }) => (
            <SelectItem key={optVal} value={optVal}>
              {optLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


export const typeColors = {
  student: "bg-[#ede9fe]",   // light purple for good black contrast
  teacher: "bg-[#f3e8ff]",   // very light lavender
  staff: "bg-[#dcfce7]",     // light green
  visitor: "bg-[#fff7ed]",   // light orange-cream
};

// Helper to format level
export function formatLevel(level: string | null | undefined): string {
  if (!level) return "-";
  return level.replace("_", " ");
}

// Helper to get initials from a name (e.g. "John Doe" -> "JD")
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return trimmed.slice(0, 2).toUpperCase();
}

type PersonLike =
  | { first_name: string; last_name: string; id: number; rfid_uuid: string }
  | { nom: string; prenom: string; id: number; rfid_uuid: string };

function getSearchName(person: PersonLike): { first: string; last: string } {
  if ("first_name" in person && "last_name" in person) {
    return { first: person.first_name, last: person.last_name };
  }
  return { first: person.prenom, last: person.nom };
}

// Helper to filter persons (case-insensitive). Supports both first_name/last_name and nom/prenom.
export function filterPersons<T extends PersonLike>(
  persons: T[],
  searchTerm: string,
): T[] {
  if (!searchTerm) return persons;
  const search = searchTerm.toLowerCase().trim();
  return persons.filter((person) => {
    const { first, last } = getSearchName(person);
    const firstLower = first.toLowerCase();
    const lastLower = last.toLowerCase();
    const fullName = `${firstLower} ${lastLower}`;
    const fullNameReverse = `${lastLower} ${firstLower}`;

    return (
      firstLower.includes(search) ||
      lastLower.includes(search) ||
      fullName.includes(search) ||
      fullNameReverse.includes(search) ||
      person.id.toString().includes(search) ||
      person.rfid_uuid.toLowerCase().includes(search)
    );
  });
}
