import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { Person } from "@/types";

type PersonsDialogType = "add" | "edit" | "delete";

type PersonsContextType = {
  open: PersonsDialogType | null;
  setOpen: (str: PersonsDialogType | null) => void;
  currentRow: Person | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Person | null>>;
};

export const PersonsContext =
  React.createContext<PersonsContextType | null>(null);

export function PersonsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PersonsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Person | null>(null);

  return (
    <PersonsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </PersonsContext.Provider>
  );
}
