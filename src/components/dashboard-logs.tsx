// @/components/dashboard-logs.tsx

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AttendanceLog, PersonWithPayments } from "@/types";
import { Clock, RefreshCw, LogIn, LogOut, UserCircle2 } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
  DataTableColumnHeader,
  DEFAULT_TABLE_HEADER_CLASSNAME,
} from "./shared/data-table";
import PersonSearchDropdown from "./shared/person-search-dropdown";
import PersonAvatar from "./shared/person-avatar";
import {
  statusColors,
  BadgeGray,
  inputClasses,
  selectClasses,
} from "@/lib/ui-utils";
import Loading from "./loading";

export default function LogsTable() {
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
            <PersonAvatar
              photoPath={row.original.photo}
              name={row.original.person_name}
              size="md"
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
          <span className="text-sm text-gray-600 font-mono">
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
          <span className="text-sm text-gray-600 font-mono">
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
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
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-3 items-end overflow-x-auto pb-2">
          <div className="flex-1 min-w-[300px] shrink-0">
            <PersonSearchDropdown
              persons={persons}
              selectedPersonId={selectedPersonId}
              searchTerm={personSearchTerm}
              onSearchChange={setPersonSearchTerm}
              onPersonSelect={handlePersonSelect}
              onClear={clearPersonSelection}
              placeholder="Search by name, ID or UUID..."
              label={
                <span className="flex items-center gap-2">
                  <UserCircle2 size={16} />
                  Recherche personne
                </span>
              }
              onFocus={() => {
                if (persons.length === 0) {
                  loadPersons();
                }
              }}
            />
          </div>
          <div className="w-40 shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className={inputClasses}
            />
          </div>
          <div className="w-40 shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className={inputClasses}
            />
          </div>
          <div className="w-32 shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className={selectClasses}
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="w-32 shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) =>
                setFilters({ ...filters, action: e.target.value })
              }
              className={selectClasses}
            >
              <option value="">All Actions</option>
              <option value="in">Entry (In)</option>
              <option value="out">Exit (Out)</option>
            </select>
          </div>
          <div className="w-48 shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className={selectClasses}
            >
              <option value="">All Types</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="staff">Staff</option>
              <option value="visitor">Visitors</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
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
        />
      )}

      <div className="flex justify-end mt-4">
        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
            Limit
          </label>
          <select
            value={filters.limit}
            onChange={(e) =>
              setFilters({ ...filters, limit: parseInt(e.target.value) })
            }
            className={selectClasses}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
        </div>
      </div>
    </div>
  );
}
