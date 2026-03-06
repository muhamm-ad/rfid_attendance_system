// @/components/person-search-dropdown.tsx
"use client";
import React, { useMemo, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import {
  DROP_DOWN_LABEL_CLASSNAME,
  FOCUS_WITHIN_RING_CLASSNAME,
  OPEN_STATE_RING_CLASSNAME,
} from "@/lib/ui-utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { InputSelect } from "@/components/ui/input-select";
import { SelectOption } from "@/types";
import { Person } from "@/types";
import { cn } from "@/lib/cn-utils";

type PersonOption = SelectOption & { person: Person };

export default function PersonSearchDropdown({
  persons,
  selectedPersonId,
  searchTerm,
  onSearchChange,
  onPersonSelect,
  onClear,
  placeholder = "Search by name, ID or UUID...",
  label,
  onFocus,
}: {
  persons: Person[];
  selectedPersonId: number | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPersonSelect: (personId: number) => void;
  onClear: () => void;
  placeholder?: string;
  label?: React.ReactNode | string;
  onFocus?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const options: PersonOption[] = useMemo(
    () =>
      persons.map((p) => ({
        value: String(p.id),
        label: `${p.first_name} ${p.last_name} (ID: ${p.id}, UUID: ${p.rfid_uuid})`,
        person: p,
      })),
    [persons],
  );

  // Filter options based on searchTerm
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const lower = searchTerm.toLowerCase();
    return options.filter(
      (o) =>
        o.person.first_name.toLowerCase().includes(lower) ||
        o.person.last_name.toLowerCase().includes(lower) ||
        String(o.person.id).includes(lower) ||
        o.person.rfid_uuid?.toLowerCase().includes(lower),
    );
  }, [options, searchTerm]);

  const value = selectedPersonId != null ? String(selectedPersonId) : "";

  const selectedPerson = useMemo(
    () => options.find((o) => o.value === value)?.person ?? null,
    [options, value],
  );

  const handleValueChange = (v: string) => {
    if (v === "") {
      onClear();
    } else {
      onPersonSelect(Number(v));
      // Reset search after selection
      onSearchChange("");
    }
  };

  const handleClear = () => {
    onClear();
    onSearchChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {label && <label className={DROP_DOWN_LABEL_CLASSNAME}>{label}</label>}
      <InputSelect
        options={filteredOptions}
        value={value}
        onValueChange={handleValueChange}
        placeholder={placeholder}
        clearable
        // Pass searchValue to hide the internal CommandInput
        searchValue={searchTerm}
        contentClassName="max-h-60 overflow-y-auto overflow-x-hidden p-0 w-[var(--radix-popover-trigger-width)]"
        onOpenChange={(open) => {
          if (open) {
            onFocus?.();
            // Re-focus input when popover opens
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        renderOption={(option) => {
          const opt = option as PersonOption;
          const p = opt.person;
          if (!p) return <span>{opt.label}</span>;
          return (
            <div className="relative flex w-full min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar
                  src={p.photo ?? undefined}
                  name={`${p.first_name} ${p.last_name}`}
                  className="h-7 w-7 shrink-0 rounded-md"
                  fallbackClassName="rounded-md"
                />
                <span className="truncate font-medium text-foreground">
                  {p.first_name} {p.last_name}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <span className="text-xs font-mono text-muted-foreground">
                  ID: {p.id}
                </span>
                <span className="text-xs font-mono text-muted-foreground/80">
                  UUID: {p.rfid_uuid}
                </span>
              </div>
            </div>
          );
        }}
      >
        {({ isPopoverOpen, setIsPopoverOpen }) => (
          /*
           * Custom trigger: a single input field that doubles as the search bar.
           * When a person is selected it shows their info, otherwise it shows
           * the raw search text the user is typing.
           */
          <button
            type="button"
            className={cn(
              "relative flex h-9 min-h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm",
              "hover:bg-accent hover:text-accent-foreground",
              FOCUS_WITHIN_RING_CLASSNAME,
              isPopoverOpen && OPEN_STATE_RING_CLASSNAME,
            )}
            onClick={() => {
              setIsPopoverOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            {/* Left search icon */}
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />

            {/* If a person is selected and we're not actively searching, show avatar + name */}
            {selectedPerson && !searchTerm ? (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {/* <UserAvatar
                  src={selectedPerson.photo ?? undefined}
                  name={`${selectedPerson.first_name} ${selectedPerson.last_name}`}
                  className="h-5 w-5 shrink-0 rounded-md"
                  fallbackClassName="rounded-md"
                /> */}
                <span className="truncate font-medium text-foreground">
                  {selectedPerson.first_name} {selectedPerson.last_name}
                </span>
              </div>
            ) : (
              /* Single search input — this IS the search bar */
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                placeholder={selectedPerson ? `${selectedPerson.first_name} ${selectedPerson.last_name}` : placeholder}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  // Open dropdown as soon as user starts typing
                  if (!isPopoverOpen) setIsPopoverOpen(true);
                }}
                onFocus={() => {
                  onFocus?.();
                  if (!isPopoverOpen) setIsPopoverOpen(true);
                }}
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none"
              />
            )}

            {/* Right side: clear button or chevron */}
            <div className="ml-auto flex shrink-0 items-center gap-0.5">
              {(selectedPerson || searchTerm) && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleClear()}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                </span>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 opacity-50 transition-transform",
                  isPopoverOpen && "rotate-180",
                )}
              />
            </div>
          </button>
        )}
      </InputSelect>
    </div>
  );
}