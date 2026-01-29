// @/lib/ui-utils.tsx

import React from "react";

// Common CSS classes
export const inputClasses =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";

export const selectClasses =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";

export const buttonPrimaryClasses =
  "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors";

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
}) => (
  <Badge className="bg-gray-100 text-gray-800 capitalize">{children}</Badge>
);

export const BadgeBlue: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Badge className="bg-blue-50 text-blue-700">{children}</Badge>;

// Status colors
export const statusColors = {
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

// Type colors
export const typeColors = {
  student: "bg-blue-100 text-blue-800",
  teacher: "bg-purple-100 text-purple-800",
  staff: "bg-green-100 text-green-800",
  visitor: "bg-orange-100 text-orange-800",
};

// Helper to format level
export function formatLevel(level: string | null | undefined): string {
  if (!level) return "-";
  return level.replace("_", " ");
}

// Helper to filter persons (case-insensitive)
export function filterPersons<
  T extends { nom: string; prenom: string; id: number; rfid_uuid: string },
>(persons: T[], searchTerm: string): T[] {
  if (!searchTerm) return persons;
  const search = searchTerm.toLowerCase().trim();
  return persons.filter((person) => {
    const nomLower = person.nom.toLowerCase();
    const prenomLower = person.prenom.toLowerCase();
    const fullName = `${prenomLower} ${nomLower}`;
    const fullNameReverse = `${nomLower} ${prenomLower}`;

    return (
      nomLower.includes(search) ||
      prenomLower.includes(search) ||
      fullName.includes(search) ||
      fullNameReverse.includes(search) ||
      person.id.toString().includes(search) ||
      person.rfid_uuid.toLowerCase().includes(search)
    );
  });
}
