"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Attendances } from "@/components/attendances";
import { AttendanceLog } from "@/types";
import type { NavigateFn } from "@/hooks/use-table-url-state";
import Loading from "@/components/ui/loading";

/** Convert URLSearchParams to a search record for useTableUrlState */
function searchParamsToRecord(
  searchParams: URLSearchParams,
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
  if (type) record.type = type.split(",").filter(Boolean);

  const status = searchParams.get("status");
  if (status) record.status = status.split(",").filter(Boolean);

  const action = searchParams.get("action");
  if (action) record.action = action.split(",").filter(Boolean);

  const startDate = searchParams.get("startDate");
  if (startDate) record.startDate = startDate;

  const endDate = searchParams.get("endDate");
  if (endDate) record.endDate = endDate;

  return record;
}

/** Build a URL query string from the search record */
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
  if (Array.isArray(record.status) && record.status.length > 0) {
    params.set("status", (record.status as string[]).join(","));
  }
  if (Array.isArray(record.action) && record.action.length > 0) {
    params.set("action", (record.action as string[]).join(","));
  }
  if (typeof record.startDate === "string" && record.startDate) {
    params.set("startDate", record.startDate);
  }
  if (typeof record.endDate === "string" && record.endDate) {
    params.set("endDate", record.endDate);
  }

  const s = params.toString();
  return s ? `?${s}` : "";
}

export default function AttendancesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = useMemo(
    () => searchParamsToRecord(searchParams),
    [searchParams],
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
    [pathname, router, search],
  );

  const statusArr = (search.status as string[]) ?? [];
  const actionArr = (search.action as string[]) ?? [];
  const startDate = (search.startDate as string) ?? "";
  const endDate = (search.endDate as string) ?? "";

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");

      // API accepts a single status / action value — send only when exactly one is selected
      if (statusArr.length === 1) params.set("status", statusArr[0]);
      if (actionArr.length === 1) params.set("action", actionArr[0]);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/attendance?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load logs");
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [statusArr.join(","), actionArr.join(","), startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (loading && logs.length === 0) {
    return <Loading />;
  }

  return (
    <Attendances
      data={logs}
      search={search}
      navigate={navigate}
      onRefresh={loadLogs}
      error={error}
    />
  );
}
