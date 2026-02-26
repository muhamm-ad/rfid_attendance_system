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

const PersonsContext = React.createContext<PersonsContextType | null>(null);

export function PersonsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PersonsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Person | null>(null);

  return (
    <PersonsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PersonsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePersons = () => {
  const personsContext = React.useContext(PersonsContext);

  if (!personsContext) {
    throw new Error("usePersons has to be used within <PersonsContext>");
  }

  return personsContext;
};
