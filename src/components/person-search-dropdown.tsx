// @/components/ui/person-search-dropdown.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Search, X, ChevronDownIcon } from "lucide-react";
import { DROP_DOWN_LABEL_CLASSNAME, filterPersons } from "@/lib/ui-utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn-utils";
import { Person } from "@/types";

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
  const [open, setOpen] = useState(false);

  const filteredPersons = filterPersons(persons, searchTerm);
  const selectedPerson = persons.find((p) => p.id === selectedPersonId);

  useEffect(() => {
    if (open) {
      onFocus?.();
      if (selectedPerson) {
        onSearchChange(
          `${selectedPerson.first_name} ${selectedPerson.last_name}`,
        );
      }
    }
  }, [open, onFocus, selectedPerson, onSearchChange]);

  const handleValueChange = (value: string) => {
    if (value === "") {
      onClear();
    } else {
      onPersonSelect(Number(value));
    }
    setOpen(false);
  };

  const displayValue = open
    ? searchTerm
    : selectedPerson
      ? `${selectedPerson.first_name} ${selectedPerson.last_name}`
      : "";

  return (
    <div className="relative">
      {label && <label className={DROP_DOWN_LABEL_CLASSNAME}>{label}</label>}
      <div className="relative flex h-9 w-full items-center">
        <Search
          className="absolute left-3 top-1/2 z-20 size-4 -translate-y-1/2 shrink-0 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Select
          open={open}
          onOpenChange={setOpen}
          value={selectedPersonId != null ? String(selectedPersonId) : ""}
          onValueChange={handleValueChange}
        >
          {/* Invisible trigger for positioning only; real input is below */}
          <SelectTrigger
            className="absolute inset-0 h-full w-full opacity-0 pointer-events-none cursor-text"
            aria-hidden
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent
            className="max-h-60 overflow-y-auto overflow-x-hidden p-0 w-(--radix-select-trigger-width)"
            position="popper"
            sideOffset={4}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {filteredPersons.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No persons found
              </div>
            ) : (
              filteredPersons.slice(0, 50).map((person) => (
                <SelectItem
                  key={person.id}
                  value={String(person.id)}
                  className="p-2 px-10 w-full"
                >
                  <div className="relative flex items-center justify-between gap-3 w-full min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <UserAvatar
                        src={person.photo ?? undefined}
                        name={`${person.first_name} ${person.last_name}`}
                        className="h-7 w-7 shrink-0 rounded-md"
                        fallbackClassName="rounded-md"
                      />
                      <span className="truncate font-medium text-foreground">
                        {person.first_name} {person.last_name}
                      </span>
                    </div>
                    <div className="flex gap-5 items-center shrink-0">
                      <span className="text-xs text-muted-foreground font-mono">
                        ID: {person.id}
                      </span>
                      <span className="text-xs text-muted-foreground/80 font-mono">
                        UUID: {person.rfid_uuid}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Input
          type="text"
          value={displayValue}
          onChange={(e) => {
            const v = e.target.value;
            onSearchChange(v);
            setOpen(true);
            if (v === "") onClear();
          }}
          onFocus={() => {
            setOpen(true);
            onFocus?.();
          }}
          placeholder={placeholder}
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            "relative z-10 pl-10 pr-10",
            !selectedPerson && !open && "text-muted-foreground",
          )}
          readOnly={!open && selectedPerson != null}
        />
        <ChevronDownIcon
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 z-20 size-4 -translate-y-1/2 shrink-0 opacity-50 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
        {selectedPersonId != null && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-9 top-1/2 z-20 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Clear selection"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
