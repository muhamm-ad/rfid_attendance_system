// @/components/shared/person-search-dropdown.tsx

"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X } from "lucide-react";
import { filterPersons } from "@/lib/ui-utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { PersonWithPayments } from "@/types";

interface PersonSearchDropdownProps {
  persons: PersonWithPayments[];
  selectedPersonId: number | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPersonSelect: (personId: number) => void;
  onClear: () => void;
  placeholder?: string;
  label?: React.ReactNode;
  onFocus?: () => void;
}

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
}: PersonSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [positionAbove, setPositionAbove] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside - including the fixed dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        dropdownListRef.current &&
        !dropdownListRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Function to calculate and update dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (!isOpen || !inputRef.current) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    const dropdownHeight = 240; // max-h-60 = 240px
    const inputWidth = inputRect.width;

    // Position above if there's not enough space below
    // Prefer above if space below is less than dropdown height
    const shouldPositionAbove =
      spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight;
    setPositionAbove(shouldPositionAbove);

    // Calculate position for dropdown
    const left = inputRect.left;
    const top = shouldPositionAbove
      ? inputRect.top - dropdownHeight - 4 // 4px for mb-1
      : inputRect.bottom + 4; // 4px for mt-1

    // Ensure dropdown stays within viewport
    const adjustedLeft = Math.max(
      8,
      Math.min(left, viewportWidth - inputWidth - 8),
    );
    const adjustedTop = shouldPositionAbove
      ? Math.max(8, top)
      : Math.min(top, viewportHeight - dropdownHeight - 8);

    setDropdownStyle({
      position: "fixed",
      left: `${adjustedLeft}px`,
      top: `${adjustedTop}px`,
      width: `${inputWidth}px`,
      zIndex: 9999,
    });
  }, [isOpen]);

  // Calculate position and scroll into view when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        updateDropdownPosition();

        // Scroll input into view to ensure dropdown is visible
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 50);
      });
    }
  }, [isOpen, updateDropdownPosition]);

  // Update position on scroll and resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      updateDropdownPosition();
    };

    const handleResize = () => {
      updateDropdownPosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, updateDropdownPosition]);

  const filteredPersons = filterPersons(persons, searchTerm);

  const handleInputChange = (value: string) => {
    onSearchChange(value);
    setIsOpen(true);
    if (value === "") {
      onClear();
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    onFocus?.();
  };

  const handlePersonSelect = (personId: number) => {
    onPersonSelect(personId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium theme-text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {selectedPersonId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown List - Rendered via Portal to avoid overflow issues */}
      {isOpen &&
        mounted &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={dropdownListRef}
            style={dropdownStyle}
            className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredPersons.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No persons found
              </div>
            ) : (
              <ul className="py-1">
                {filteredPersons.slice(0, 20).map((person) => (
                  <li
                    key={person.id}
                    onClick={() => handlePersonSelect(person.id)}
                    className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                      selectedPersonId === person.id ? "bg-indigo-100" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={person.photo}
                          name={`${person.first_name} ${person.last_name}`}
                          size="sm"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {person.first_name} {person.last_name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 font-mono">
                          ID: {person.id}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {person.rfid_uuid}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
