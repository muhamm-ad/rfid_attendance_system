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
  loadLogs,
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
  loadLogs: () => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 p-2 pb-6 items-end">
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
              <UserCircle2 size={16} className="text-(--brand) shrink-0" />
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
      <div className="w-36">
        <Label className={DROP_DOWN_LABEL_CLASSNAME}>
          Status
        </Label>
        <Select
          value={filters.status || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, status: v === "all" ? "" : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-36">
        <Label className={DROP_DOWN_LABEL_CLASSNAME}>
          Action
        </Label>
        <Select
          value={filters.action || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, action: v === "all" ? "" : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="in">Entry (In)</SelectItem>
            <SelectItem value="out">Exit (Out)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-40">
        <Label className="mb-2 block text-sm font-medium theme-text-muted">
          Type
        </Label>
        <Select
          value={filters.type || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, type: v === "all" ? "" : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="visitor">Visitors</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={onResetFilters}
        variant="outline"
        size="sm"
        title="Reset all filters"
      >
        <RotateCcw className="h-4 w-4 text-(--brand)" />
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
    limit: 10,
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
          <span className="text-sm text-gray-600">
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
            <div className="font-medium text-gray-900">
              {row.original.person_name}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "person_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Person ID" />
        ),
        cell: ({ row }) => (
          <span className="text-sm theme-text-muted font-mono">
            {row.getValue("person_id")}
          </span>
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
            <span className="text-sm text-gray-700 capitalize">
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
          <span className="text-sm theme-text-muted font-mono">
            {row.getValue("rfid_uuid")}
          </span>
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
      limit: 10,
    });
    setPersonSearchTerm("");
    setSelectedPersonId(null);
    loadLogs();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Clock size={28} />
            Attendance Logs
          </h2>
          <p className="text-gray-600 mt-1">
            View all access attempts and attendance records
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="gap-0"
            title="View attendance statistics"
            onClick={() => router.push("/dashboard/attendances/statistics")}
          >
            <BarChart3 className="size-4 mr-2" />
            Statistics
          </Button>
          <Button onClick={loadLogs} className="gap-0" title="Refresh logs">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

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
        loadLogs={loadLogs}
        onResetFilters={resetAllFilters}
      />

      {error && (
        <div
          className="mb-4 rounded-lg theme-border border p-4"
          style={{ backgroundColor: "var(--error-bg)" }}
        >
          <p className="text-sm" style={{ color: "var(--error)" }}>
            {error}
          </p>
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
