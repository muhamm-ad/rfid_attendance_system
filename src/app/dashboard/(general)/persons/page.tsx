"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Persons } from "@/components/persons";
import { PersonWithPayments } from "@/types";
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

  const type = searchParams.get("type");
  if (type) {
    record.type = type.split(",").filter(Boolean);
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
  if (Array.isArray(record.type) && record.type.length > 0) {
    params.set("type", (record.type as string[]).join(","));
  }

  const s = params.toString();
  return s ? `?${s}` : "";
}

export default function PersonsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [persons, setPersons] = useState<PersonWithPayments[]>([]);
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

  const filterStr = (search.filter as string)?.trim() ?? "";
  const typeArr = (search.type as string[]) ?? [];

  const fetchPersons = useCallback(async () => {
    if (filterStr.length >= 2) {
      const typeParam = typeArr.length === 1 ? typeArr[0] : undefined;
      const url = typeParam
        ? `/api/search?q=${encodeURIComponent(filterStr)}&type=${encodeURIComponent(typeParam)}`
        : `/api/search?q=${encodeURIComponent(filterStr)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Search failed");
      setPersons(Array.isArray(data) ? data : []);
    } else {
      const typeParam = typeArr.length === 1 ? typeArr[0] : undefined;
      const url = typeParam
        ? `/api/persons?type=${encodeURIComponent(typeParam)}`
        : "/api/persons";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load persons");
      let list = Array.isArray(data) ? data : [];
      if (typeArr.length > 1) {
        list = list.filter((p: PersonWithPayments) =>
          typeArr.includes(p.type)
        );
      }
      setPersons(list);
    }
  }, [filterStr, typeArr.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPersons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchPersons();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
      setPersons([]);
    } finally {
      setLoading(false);
    }
  }, [fetchPersons]);

  const handleRefresh = useCallback(async () => {
    setError(null);
    try {
      await fetchPersons();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    }
  }, [fetchPersons]);

  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  if (loading && persons.length === 0) {
    return <Loading />;
  }

  return (
    <Persons
      data={persons}
      search={search}
      navigate={navigate}
      onRefresh={handleRefresh}
      error={error}
    />
  );
}
