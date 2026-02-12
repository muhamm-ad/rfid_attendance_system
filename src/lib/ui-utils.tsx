// @/lib/ui-utils.tsx

import React from "react";

export const DROP_DOWN_LABEL_CLASSNAME = "ml-1 mb-1.5 block text-sm font-medium";
















// Common CSS classes (theme-aligned)
export const inputClasses =
  "w-full px-3 py-2 border theme-border rounded-lg bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 focus:border-[var(--brand)] transition-colors";

export const selectClasses =
  "w-full px-3 py-2 border theme-border rounded-lg bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 focus:border-[var(--brand)] transition-colors";

export const buttonPrimaryClasses =
  "flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 transition-opacity";

export const buttonSecondaryClasses =
  "flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors";

// Badge components
export const Badge: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
    {children}
  </span>
);

export const BadgeGray: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Badge className="theme-badge-muted capitalize">{children}</Badge>;

export const BadgeBlue: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Badge className="bg-blue-50 text-blue-700">{children}</Badge>;

// Status colors (aligned with theme)
export const statusColors = {
  success: "theme-badge-success",
  failed: "theme-badge-error",
};

// Type colors (aligned with theme)
export const typeColors = {
  student: "theme-badge-brand",
  teacher: "bg-[#f3e8ff] text-[#7c3aed]",
  staff: "theme-badge-success",
  visitor: "bg-[#fff7ed] text-[#ea580c]",
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
