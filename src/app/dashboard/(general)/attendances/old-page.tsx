// @/app/dashboard/(general)/attendances/page.tsx

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AttendanceLog, PersonWithPayments } from "@/types";
import {
  Clock,
  RefreshCw,
  LogIn,
  LogOut,
  BarChart3,
  RotateCcw,
  UserCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type ColumnDef,
  DataTableColumnHeader,
  DEFAULT_TABLE_HEADER_CLASSNAME,
} from "@/components/old-data-table";
import PersonSearchDropdown from "@/components/person-search-dropdown";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  FilterSelect,
  RESET_FILTER_BUTTON_CLASSNAME,
  typeColors,
} from "@/lib/ui-utils";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import DateTimePicker from "@/components/date-time-picker";

const DEFAULT_LOG_LIMIT = 25;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
] as const;

const ACTION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "in", label: "Entry (In)" },
  { value: "out", label: "Exit (Out)" },
] as const;

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "student", label: "Students" },
  { value: "teacher", label: "Teachers" },
  { value: "cashier", label: "Cashier" },
  { value: "visitor", label: "Visitors" },
] as const;


/** Filters section for attendance logs */
function LogsFiltersSection({
  filters,
  setFilters,
  persons,
  personSearchTerm,
  setPersonSearchTerm,
  selectedPersonId,
  onPersonSelect,
  onClearPerson,
  loadPersons,
  onResetFilters,
}: {
  filters: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    status: string;
    action: string;
    type: string;
    limit: number;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      startDate: string;
      startTime: string;
      endDate: string;
      endTime: string;
      status: string;
      action: string;
      type: string;
      limit: number;
    }>
  >;
  persons: PersonWithPayments[];
  personSearchTerm: string;
  setPersonSearchTerm: (v: string) => void;
  selectedPersonId: number | null;
  onPersonSelect: (id: number) => void;
  onClearPerson: () => void;
  loadPersons: () => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="filter-bar flex flex-wrap gap-4 items-end">
      <div className="flex-1">
        <PersonSearchDropdown
          persons={persons}
          selectedPersonId={selectedPersonId}
          searchTerm={personSearchTerm}
          onSearchChange={setPersonSearchTerm}
          onPersonSelect={onPersonSelect}
          onClear={onClearPerson}
          placeholder="Search by name, ID or UUID..."
          label={
            <span className="flex items-center gap-2">
              <UserCircle2 size={16} className="page-title-icon shrink-0" />
              Search person
            </span>
          }
          onFocus={() => {
            if (persons.length === 0) loadPersons();
          }}
        />
      </div>
      <div className="w-50">
        <DateTimePicker
          id="start-date"
          label="Start date"
          dateValue={filters.startDate}
          timeValue={filters.startTime}
          onDateChange={(v) => setFilters((f) => ({ ...f, startDate: v }))}
          onTimeChange={(v) => setFilters((f) => ({ ...f, startTime: v }))}
        />
      </div>
      <div className="w-50">
        <DateTimePicker
          id="end-date"
          label="End date"
          dateValue={filters.endDate}
          timeValue={filters.endTime}
          onDateChange={(v) => setFilters((f) => ({ ...f, endDate: v }))}
          onTimeChange={(v) => setFilters((f) => ({ ...f, endTime: v }))}
        />
      </div>
      <FilterSelect
        label="Status"
        value={filters.status}
        onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        options={STATUS_OPTIONS}
      />
      <FilterSelect
        label="Action"
        value={filters.action}
        onValueChange={(v) => setFilters((f) => ({ ...f, action: v }))}
        options={ACTION_OPTIONS}
      />
      <FilterSelect
        label="Type"
        value={filters.type}
        onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}
        options={TYPE_OPTIONS}
        widthClass="w-40"
      />
      <Button
        onClick={onResetFilters}
        title="Reset all filters"
        className={RESET_FILTER_BUTTON_CLASSNAME}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function AttendancesPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    status: "",
    action: "",
    type: "",
    limit: DEFAULT_LOG_LIMIT,
  });
  const [persons, setPersons] = useState<PersonWithPayments[]>([]);
  const [personSearchTerm, setPersonSearchTerm] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  useEffect(() => {
    loadPersons();
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.startDate && filters.startTime) {
        params.append("startDate", `${filters.startDate}T${filters.startTime}`);
      } else if (filters.startDate) {
        params.append("startDate", filters.startDate);
      } else if (filters.startTime) {
        params.append("startTime", filters.startTime);
      }
      if (filters.endDate && filters.endTime) {
        params.append("endDate", `${filters.endDate}T${filters.endTime}`);
      } else if (filters.endDate) {
        params.append("endDate", filters.endDate);
      } else if (filters.endTime) {
        params.append("endTime", filters.endTime);
      }
      if (filters.status) params.append("status", filters.status);
      if (filters.action) params.append("action", filters.action);
      if (selectedPersonId) {
        params.append("personId", selectedPersonId.toString());
      }
      params.append("limit", filters.limit.toString());

      const res = await fetch(`/api/attendance?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load logs");
      setLogs(data as AttendanceLog[]);
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [
    filters.startDate,
    filters.startTime,
    filters.endDate,
    filters.endTime,
    filters.status,
    filters.action,
    filters.type,
    filters.limit,
    selectedPersonId,
  ]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  async function loadPersons() {
    try {
      const res = await fetch("/api/persons");
      const data = await res.json();
      if (res.ok) {
        setPersons(data);
      }
    } catch (e) {
      console.error("Failed to load persons", e);
    }
  }

  const actionIcons = useMemo(
    () => ({
      in: <LogIn size={16} className="text-blue-600" />,
      out: <LogOut size={16} className="text-purple-600" />,
    }),
    [],
  );

  const logColumns = useMemo<ColumnDef<AttendanceLog>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Timestamp" />
        ),
        cell: ({ row }) => (
          <span className="cell-timestamp">
            {new Date(row.original.timestamp).toLocaleString("en-US")}
          </span>
        ),
        sortingFn: (rowA, rowB) =>
          new Date(rowA.original.timestamp).getTime() -
          new Date(rowB.original.timestamp).getTime(),
      },
      {
        id: "person",
        accessorFn: (row) => row.person_name,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Person"
            className={DEFAULT_TABLE_HEADER_CLASSNAME}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3 justify-start pl-6">
            <UserAvatar
              src={row.original.photo}
              name={row.original.person_name}
            />
            <span className="cell-person-name">{row.original.person_name}</span>
          </div>
        ),
      },
      {
        accessorKey: "person_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Person ID" />
        ),
        cell: ({ row }) => (
          <span className="cell-muted-mono">{row.getValue("person_id")}</span>
        ),
      },
      {
        accessorKey: "person_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
          const type = row.original.person_type as keyof typeof typeColors;
          return (
            <Badge variant="outline" className={`${typeColors[type] ?? "theme-badge-muted"}`}>
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "action",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Action" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-center">
            {actionIcons[row.original.action]}
            <span className="cell-timestamp capitalize">
              {row.original.action}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={`capitalize ${
              row.original.status === "success"
                ? "theme-badge-success"
                : "theme-badge-error"
            }`}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "rfid_uuid",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="RFID UUID" />
        ),
        cell: ({ row }) => (
          <span className="cell-muted-mono">{row.getValue("rfid_uuid")}</span>
        ),
      },
    ],
    [actionIcons],
  );

  async function handlePersonSelect(personId: number) {
    const person = persons.find((p) => p.id === personId);
    if (person) {
      setPersonSearchTerm(`${person.first_name} ${person.last_name}`);
    }
    setSelectedPersonId(personId);
    await loadLogs();
  }

  async function clearPersonSelection() {
    setSelectedPersonId(null);
    setPersonSearchTerm("");
    await loadLogs();
  }

  function resetAllFilters() {
    setFilters({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      status: "",
      action: "",
      type: "",
      limit: DEFAULT_LOG_LIMIT,
    });
    setPersonSearchTerm("");
    setSelectedPersonId(null);
    loadLogs();
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            <Clock size={28} className="page-title-icon" aria-hidden />
            Attendance Logs
          </h1>
          <p className="page-subtitle">
            View all access attempts and attendance records
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="outline"
            className="gap-2"
            title="View attendance statistics"
            onClick={() => router.push("/dashboard/attendances/statistics")}
          >
            <BarChart3 className="size-4" />
            Statistics
          </Button>
          <Button onClick={loadLogs} className="gap-2" title="Refresh logs">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </header>

      <LogsFiltersSection
        filters={filters}
        setFilters={setFilters}
        persons={persons}
        personSearchTerm={personSearchTerm}
        setPersonSearchTerm={setPersonSearchTerm}
        selectedPersonId={selectedPersonId}
        onPersonSelect={handlePersonSelect}
        onClearPerson={clearPersonSelection}
        loadPersons={loadPersons}
        onResetFilters={resetAllFilters}
      />

      {error && (
        <div className="alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="relative flex-1 h-full w-full">
        {loading ? (
          <Loading />
        ) : (
          <DataTable<AttendanceLog, unknown>
            data={logs}
            columns={logColumns}
            emptyMessage="No records found"
            pageSize={filters.limit}
            initialSorting={[{ id: "timestamp", desc: true }]}
            onPageSizeChange={(size) =>
              setFilters((f) => ({ ...f, limit: size }))
            }
          />
        )}
      </div>
    </div>
  );
}
