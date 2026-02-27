// @/app/dashboard/admin/(settings)/users/page.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Users } from "@/components/users";
import { User } from "@/types";
import type { NavigateFn } from "@/hooks/use-table-url-state";
import Loading from "@/components/ui/loading";

/** Convert URLSearchParams to search record for useTableUrlState */
function searchParamsToRecord(
  searchParams: URLSearchParams
): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  const page = searchParams.get("page");
  if (page) {
    const n = parseInt(page, 10);
    if (!isNaN(n)) record.page = n;
  }

  const filter = searchParams.get("filter");
  if (filter) record.filter = filter;

  const isActive = searchParams.get("is_active");
  if (isActive) {
    record.is_active = isActive.split(",").filter(Boolean);
  }

  const role = searchParams.get("role");
  if (role) {
    record.role = role.split(",").filter(Boolean);
  }

  return record;
}

/** Build URL search string from search record */
function recordToSearchString(record: Record<string, unknown>): string {
  const params = new URLSearchParams();

  if (typeof record.page === "number" && record.page > 1) {
    params.set("page", String(record.page));
  }
  if (typeof record.filter === "string" && record.filter.trim()) {
    params.set("filter", record.filter.trim());
  }
  if (Array.isArray(record.is_active) && record.is_active.length > 0) {
    params.set("is_active", (record.is_active as string[]).join(","));
  }
  if (Array.isArray(record.role) && record.role.length > 0) {
    params.set("role", (record.role as string[]).join(","));
  }

  const s = params.toString();
  return s ? `?${s}` : "";
}

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = useMemo(
    () => searchParamsToRecord(searchParams),
    [searchParams]
  );

  const navigate: NavigateFn = useCallback(
    (opts) => {
      const nextSearch =
        opts.search === true
          ? {}
          : typeof opts.search === "function"
            ? opts.search(search as Record<string, unknown>)
            : opts.search;

      const merged = {
        ...(search as Record<string, unknown>),
        ...(typeof nextSearch === "object" && nextSearch !== null
          ? nextSearch
          : {}),
      };

      const query = recordToSearchString(merged);
      const href = `${pathname}${query}`;
      if (opts.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [pathname, router, search]
  );

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (loading && users.length === 0) {
    return <Loading />;
  }

  return (
    <Users
      data={users}
      search={search}
      navigate={navigate}
      onRefresh={loadUsers}
      error={error}
    />
  );
}
