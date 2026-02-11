// @/components/dashboard-person.tsx

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { PersonWithPayments } from "@/types";
import { Users, Plus, Edit2, Trash2, X, Scan, MoreHorizontal } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
  DataTableColumnHeader,
} from "./shared/data-table";
import PersonSearchDropdown from "./shared/person-search-dropdown";
import PersonAvatar from "./shared/person-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  typeColors,
  BadgeGray,
  inputClasses,
  selectClasses,
  buttonPrimaryClasses,
  buttonSecondaryClasses,
} from "@/lib/ui-utils";
// import { useClickOutside } from "@/hooks/useClickOutside";
// import Image from "next/image";

export default function PersonManagement() {
  const [persons, setPersons] = useState<PersonWithPayments[]>([]);
  const [allPersons, setAllPersons] = useState<PersonWithPayments[]>([]); // Store all persons for dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [filters, setFilters] = useState({
    limit: 10,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PersonWithPayments | null>(
    null,
  );
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    rfid_uuid: "",
    type: "student" as "student" | "teacher" | "staff" | "visitor",
    nom: "",
    prenom: "",
    photo_path: "",
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<
    "idle" | "scanning" | "success" | "error"
  >("idle");
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string | null>(
    null,
  );

  const loadPersons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        typeFilter === "all"
          ? "/api/persons"
          : `/api/persons?type=${typeFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load persons");

      setPersons(data);
      setAllPersons(data); // Store all persons for dropdown
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  // Auto-search when typing (debounced) or when filters change
  useEffect(() => {
    if (searchTerm.length >= 2 && !selectedPersonId) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (searchTerm.length === 0 && !selectedPersonId) {
      loadPersons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedPersonId]);

  async function handleSearch() {
    if (searchTerm.length < 2 && !selectedPersonId) {
      loadPersons();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data: PersonWithPayments[] = [];
      if (selectedPersonId) {
        // If a person is selected, filter locally from all persons
        if (allPersons.length > 0) {
          data = allPersons.filter(
            (p: PersonWithPayments) => p.id === selectedPersonId,
          );
        } else {
          // If allPersons is not loaded, load it first
          const url =
            typeFilter === "all"
              ? "/api/persons"
              : `/api/persons?type=${typeFilter}`;
          const res = await fetch(url);
          const fetchedData = await res.json();
          if (!res.ok)
            throw new Error(fetchedData?.error || "Failed to load persons");
          setAllPersons(fetchedData);
          data = fetchedData.filter(
            (p: PersonWithPayments) => p.id === selectedPersonId,
          );
        }
      } else {
        const url =
          typeFilter === "all"
            ? `/api/search?q=${encodeURIComponent(searchTerm)}`
            : `/api/search?q=${encodeURIComponent(
                searchTerm,
              )}&type=${typeFilter}`;
        const res = await fetch(url);
        const fetchedData = await res.json();
        if (!res.ok) throw new Error(fetchedData?.error || "Search failed");
        data = fetchedData;
      }

      setPersons(data);
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function handlePersonSelect(personId: number) {
    const person = allPersons.find((p) => p.id === personId);
    if (person) {
      setSearchTerm(`${person.first_name} ${person.last_name}`);
    }
    setSelectedPersonId(personId);

    // Automatically search/filter for the selected person immediately
    setLoading(true);
    setError(null);
    try {
      if (allPersons.length > 0) {
        const filtered = allPersons.filter(
          (p: PersonWithPayments) => p.id === personId,
        );
        setPersons(filtered);
      } else {
        // If allPersons is not loaded, load it first
        const url =
          typeFilter === "all"
            ? "/api/persons"
            : `/api/persons?type=${typeFilter}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load persons");
        setAllPersons(data);
        const filtered = data.filter(
          (p: PersonWithPayments) => p.id === personId,
        );
        setPersons(filtered);
      }
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchInputChange(value: string) {
    setSearchTerm(value);
    if (value === "") {
      setSelectedPersonId(null);
      loadPersons();
    }
  }

  function clearSearchSelection() {
    setSelectedPersonId(null);
    setSearchTerm("");
    loadPersons();
  }

  function resetForm() {
    setFormData({
      rfid_uuid: "",
      type: "student",
      nom: "",
      prenom: "",
      photo_path: "",
    });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setEditingPerson(null);
    setShowForm(false);
    setIsScanning(false);
    setScanStatus("idle");
    setLastScanTimestamp(null);
  }

  // Check if UUID already exists
  const checkDuplicateUUID = useCallback(
    (uuid: string): boolean => {
      if (!uuid) return false;
      return allPersons.some(
        (p) =>
          p.rfid_uuid.toLowerCase() === uuid.toLowerCase() &&
          (!editingPerson || p.id !== editingPerson.id),
      );
    },
    [allPersons, editingPerson],
  );

  // Start scanning - poll for new scans
  const startScanning = useCallback(() => {
    setIsScanning(true);
    setScanStatus("scanning");
    setLastScanTimestamp(new Date().toISOString());
  }, []);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setScanStatus("idle");
  }, []);

  // Poll for latest scan
  useEffect(() => {
    if (!isScanning || !showForm) return;

    const pollInterval = setInterval(async () => {
      try {
        const url = lastScanTimestamp
          ? `/api/scan?since=${encodeURIComponent(lastScanTimestamp)}`
          : "/api/scan";
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok && data.success && data.rfid_uuid) {
          // Check for duplicate UUID
          if (checkDuplicateUUID(data.rfid_uuid)) {
            setScanStatus("error");
            setError(
              `UUID ${data.rfid_uuid} already exists. Please use a different badge.`,
            );
            setTimeout(() => {
              setScanStatus("idle");
              setError(null);
            }, 3000);
            setIsScanning(false);
            return;
          }

          // Update form with scanned UUID
          setFormData((prev) => ({ ...prev, rfid_uuid: data.rfid_uuid }));
          setScanStatus("success");
          setLastScanTimestamp(data.timestamp);
          setIsScanning(false);

          // Reset success status after 2 seconds
          setTimeout(() => {
            setScanStatus("idle");
          }, 2000);
        }
      } catch (e: any) {
        console.error("Error polling for scan:", e);
        setScanStatus("error");
        setTimeout(() => {
          setScanStatus("idle");
        }, 2000);
      }
    }, 500); // Poll every 500ms

    return () => clearInterval(pollInterval);
  }, [isScanning, lastScanTimestamp, checkDuplicateUUID, showForm]);

  // Stop scanning when form is closed
  useEffect(() => {
    if (!showForm && isScanning) {
      setIsScanning(false);
      setScanStatus("idle");
    }
  }, [showForm, isScanning]);

  async function handlePhotoUpload(file: File): Promise<string> {
    const uploadFormData = new FormData();
    uploadFormData.append("photo", file);

    const res = await fetch("/api/upload-photo", {
      method: "POST",
      body: uploadFormData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Photo upload failed");

    return data.photo_path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUploadingPhoto(true);

    try {
      let photoPath = formData.photo_path;

      // Upload photo if a new file is selected
      if (selectedPhoto) {
        photoPath = await handlePhotoUpload(selectedPhoto);
      }

      const url = editingPerson
        ? `/api/persons/${editingPerson.id}`
        : "/api/persons";
      const method = editingPerson ? "PUT" : "POST";

      const requestBody = {
        rfid_uuid: formData.rfid_uuid,
        type: formData.type,
        last_name: formData.nom,
        first_name: formData.prenom,
        photo: photoPath || formData.photo_path || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Operation failed");

      resetForm();
      await loadPersons();
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setUploadingPhoto(false);
    }
  }

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this person?")) return;
      setError(null);
      try {
        const res = await fetch(`/api/persons/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Delete failed");
        await loadPersons();
      } catch (e: any) {
        setError(e.message || "Unexpected error");
      }
    },
    [loadPersons],
  );

  function startEdit(person: PersonWithPayments) {
    setEditingPerson(person);
    setFormData({
      rfid_uuid: person.rfid_uuid,
      type: person.type,
      nom: person.last_name ?? "",
      prenom: person.first_name ?? "",
      photo_path: person.photo ?? "",
    });
    setSelectedPhoto(null);
    setPhotoPreview(person.photo ?? null);
    setShowForm(true);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const personColumns = useMemo<ColumnDef<PersonWithPayments>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600 font-mono">{row.getValue("id")}</span>
        ),
      },
      {
        id: "name",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          const person = row.original;
          return (
            <div className="flex items-center gap-3 justify-center">
              <PersonAvatar
                photoPath={person.photo}
                name={`${person.first_name} ${person.last_name}`}
                size="md"
              />
              <div className="font-medium text-gray-900">
                {person.first_name} {person.last_name}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
              typeColors[row.original.type]
            }`}
          >
            {row.original.type}
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
      {
        id: "payment_status",
        accessorKey: "payment_status",
        enableSorting: false,
        header: "Payment Status",
        cell: ({ row }) => {
          const person = row.original;
          return (
            <div>
              {person.type === "student" ? (
                <div className="flex gap-2 text-xs justify-center">
                  <span
                    className={
                      person.trimester1_paid
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    T1: {person.trimester1_paid ? "✓" : "✗"}
                  </span>
                  <span
                    className={
                      person.trimester2_paid
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    T2: {person.trimester2_paid ? "✓" : "✗"}
                  </span>
                  <span
                    className={
                      person.trimester3_paid
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    T3: {person.trimester3_paid ? "✓" : "✗"}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "updated_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last Modified" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {new Date(row.original.updated_at).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const person = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => startEdit(person)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(person.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleDelete]
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={28} />
            Person Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage students, teachers, staff, and visitors
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className={buttonPrimaryClasses}
        >
          <Plus size={20} />
          Add Person
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1 min-w-0">
            <PersonSearchDropdown
              persons={allPersons}
              selectedPersonId={selectedPersonId}
              searchTerm={searchTerm}
              onSearchChange={handleSearchInputChange}
              onPersonSelect={handlePersonSelect}
              onClear={clearSearchSelection}
              placeholder="Search by UUID, ID or Name..."
              onFocus={() => {
                if (allPersons.length === 0) {
                  loadPersons();
                }
              }}
            />
          </div>
          <div className="w-48 flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={selectClasses}
            >
              <option value="all">All Types</option>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingPerson ? "Edit Person" : "Add New Person"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFID UUID *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.rfid_uuid}
                    onChange={(e) => {
                      setFormData({ ...formData, rfid_uuid: e.target.value });
                      setScanStatus("idle");
                    }}
                    required
                    className={`${inputClasses} flex-1`}
                    placeholder={
                      isScanning
                        ? "Scanning... Please scan the badge"
                        : "Enter UUID or scan badge"
                    }
                    disabled={isScanning}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isScanning) {
                        stopScanning();
                      } else {
                        startScanning();
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      isScanning
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : scanStatus === "success"
                          ? "bg-green-500 text-white"
                          : scanStatus === "error"
                            ? "bg-red-500 text-white"
                            : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    }`}
                    title={
                      isScanning ? "Stop scanning" : "Start scanning badge"
                    }
                  >
                    <Scan
                      size={18}
                      className={isScanning ? "animate-pulse" : ""}
                    />
                    {isScanning ? "Stop" : "Scan"}
                  </button>
                </div>
                {isScanning && (
                  <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                    <span className="animate-pulse">●</span>
                    Listening for badge scan...
                  </p>
                )}
                {scanStatus === "success" && !isScanning && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Badge scanned successfully!
                  </p>
                )}
                {scanStatus === "error" && !isScanning && (
                  <p className="text-xs text-red-600 mt-1">
                    ✗ Scan failed or duplicate UUID detected
                  </p>
                )}
                {formData.rfid_uuid &&
                  checkDuplicateUUID(formData.rfid_uuid) && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠ This UUID already exists in the system
                    </p>
                  )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as
                        | "student"
                        | "teacher"
                        | "staff"
                        | "visitor",
                    })
                  }
                  required
                  className={selectClasses}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name (Nom) *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name (Prenom) *
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo
                </label>
                {photoPreview && (
                  <div className="mb-2">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className={inputClasses}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formats acceptés: JPEG, PNG, WebP (max 5MB) - Optionnel
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className={`${buttonPrimaryClasses} flex-1 disabled:opacity-50`}
                >
                  {uploadingPhoto
                    ? "Uploading..."
                    : editingPerson
                      ? "Update"
                      : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={uploadingPhoto}
                  className={`${buttonSecondaryClasses} flex-1`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable<PersonWithPayments, unknown>
        data={persons}
        columns={personColumns}
        emptyMessage="No persons found"
        pageSize={filters.limit}
      />

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
