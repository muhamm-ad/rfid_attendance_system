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
import {
  DataTable,
  type ColumnDef,
  DataTableColumnHeader,
  DEFAULT_TABLE_HEADER_CLASSNAME,
} from "@/components/data-table";
import PersonSearchDropdown from "@/components/person-search-dropdown";
import { UserAvatar } from "@/components/ui/user-avatar";
import { statusColors, BadgeGray, DROP_DOWN_LABEL_CLASSNAME } from "@/lib/ui-utils";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  { value: "staff", label: "Staff" },
  { value: "visitor", label: "Visitors" },
] as const;

type FilterOption = { value: string; label: string };

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  widthClass = "w-36",
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: readonly FilterOption[];
  widthClass?: string;
}) {
  const current = value || "all";
  return (
    <div className={widthClass}>
      <Label className={DROP_DOWN_LABEL_CLASSNAME}>{label}</Label>
      <Select
        value={current}
        onValueChange={(v) => onValueChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ value: optVal, label: optLabel }) => (
            <SelectItem key={optVal} value={optVal}>
              {optLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

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
    endDate: string;
    status: string;
    action: string;
    type: string;
    limit: number;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      startDate: string;
      endDate: string;
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
    <div className="filter-bar">
      <div className="flex-1 min-w-[280px]">
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
          onDateChange={(v) => setFilters((f) => ({ ...f, startDate: v }))}
          onTimeChange={(v) => setFilters((f) => ({ ...f, startDate: v }))}
        />
      </div>
      <div className="w-50">
        <DateTimePicker
          id="end-date"
          label="End date"
          dateValue={filters.endDate}
          onDateChange={(v) => setFilters((f) => ({ ...f, endDate: v }))}
          onTimeChange={(v) => setFilters((f) => ({ ...f, endDate: v }))}
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
        variant="outline"
        size="sm"
        title="Reset all filters"
        className="shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <RotateCcw className="h-4 w-4 text-primary" />
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
    endDate: "",
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
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
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
    filters.endDate,
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
            {new Date(row.original.timestamp).toLocaleString()}
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
        cell: ({ row }) => <BadgeGray>{row.getValue("person_type")}</BadgeGray>,
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
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              statusColors[row.original.status]
            }`}
          >
            {row.original.status}
          </span>
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
      endDate: "",
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
  );
}
