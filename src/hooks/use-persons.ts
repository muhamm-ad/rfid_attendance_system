import React from "react";
import { PersonsContext } from "@/components/providers/persons-provider";

// eslint-disable-next-line react-refresh/only-export-components
export function usePersons() {
  const personsContext = React.useContext(PersonsContext);

  if (!personsContext) {
    throw new Error("usePersons has to be used within <PersonsProvider>");
  }

  return personsContext;
}
