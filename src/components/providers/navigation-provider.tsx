"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Loading from "@/components/ui/loading";

type NavigationContextValue = {
  isNavigatingAway: boolean;
  setNavigatingAway: (value: boolean) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    return {
      isNavigatingAway: false,
      setNavigatingAway: () => {},
    };
  }
  return ctx;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigatingAway, setNavigatingAwayState] = useState(false);
  const setNavigatingAway = useCallback((value: boolean) => {
    setNavigatingAwayState(value);
  }, []);

  useEffect(() => {
    if (pathname === "/login" || pathname?.startsWith("/login")) {
      setNavigatingAwayState(false);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider
      value={{ isNavigatingAway, setNavigatingAway }}
    >
      {isNavigatingAway ? <Loading label="Signing out..." /> : children}
    </NavigationContext.Provider>
  );
}
