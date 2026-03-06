import React from "react";
import { UsersContext } from "@/components/providers/users-provider";

// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
  const usersContext = React.useContext(UsersContext);

  if (!usersContext) {
    throw new Error("useUsers has to be used within <UsersProvider>");
  }

  return usersContext;
}
