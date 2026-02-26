// "use client";

// import { PersonsPage } from "@/components/persons";

// export default function Page() {
//   return <PersonsPage />;
// }





// @/app/dashboard/(general)/persons/page.tsx

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PersonWithPayments } from "@/types";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Scan,
  MoreHorizontal,
  BarChart3,
  RotateCcw,
  UserCircle2,
  RefreshCw,
} from "lucide-react";
import {
  DataTable,
  type ColumnDef,
  DataTableColumnHeader,
} from "@/components/old-data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PersonSearchDropdown from "@/components/person-search-dropdown";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  FilterSelect,
  DROP_DOWN_LABEL_CLASSNAME,
  RESET_FILTER_BUTTON_CLASSNAME,
  INPUT_CLASSNAME,
  FORM_LABEL_CLASSNAME,
  FormFieldError,
} from "@/lib/ui-utils";
import Loading from "@/components/ui/loading";
import { useRouter } from "next/navigation";

const PERSON_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "student", label: "Students" },
  { value: "teacher", label: "Teachers" },
  { value: "staff", label: "Staff" },
  { value: "visitor", label: "Visitors" },
] as const;

/** Filters section for persons */
function PersonFiltersSection({
  typeFilter,
  setTypeFilter,
  allPersons,
  searchTerm,
  onSearchChange,
  selectedPersonId,
  onPersonSelect,
  onClearSearch,
  loadPersons,
  onResetFilters,
}: {
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  allPersons: PersonWithPayments[];
  searchTerm: string;
  onSearchChange: (v: string) => void;
  selectedPersonId: number | null;
  onPersonSelect: (id: number) => void;
  onClearSearch: () => void;
  loadPersons: () => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="filter-bar flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[280px]">
        <PersonSearchDropdown
          persons={allPersons}
          selectedPersonId={selectedPersonId}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onPersonSelect={onPersonSelect}
          onClear={onClearSearch}
          placeholder="Search by UUID, ID or Name..."
          label={
            <span className="flex items-center gap-2">
              <UserCircle2 size={16} className="page-title-icon shrink-0" />
              Search person
            </span>
          }
          onFocus={() => {
            if (allPersons.length === 0) loadPersons();
          }}
        />
      </div>
      <FilterSelect
        label="Type"
        value={typeFilter}
        onValueChange={setTypeFilter}
        options={PERSON_TYPE_OPTIONS}
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

type FormData = {
  rfid_uuid: string;
  type: "student" | "teacher" | "staff" | "visitor";
  nom: string;
  prenom: string;
  photo_path: string;
};

type FormErrors = {
  rfid_uuid?: string;
  nom?: string;
  prenom?: string;
};

function PersonFormDialog({
  open,
  onOpenChange,
  editingPerson,
  error,
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  isScanning,
  scanStatus,
  setScanStatus,
  startScanning,
  stopScanning,
  photoPreview,
  handlePhotoChange,
  handleSubmit,
  uploadingPhoto,
  resetForm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPerson: PersonWithPayments | null;
  error: string | null;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  formErrors: FormErrors;
  setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  isScanning: boolean;
  scanStatus: "idle" | "scanning" | "success" | "error";
  setScanStatus: (s: "idle" | "scanning" | "success" | "error") => void;
  startScanning: () => void;
  stopScanning: () => void;
  photoPreview: string | null;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  uploadingPhoto: boolean;
  resetForm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            {editingPerson ? (
              <>
                <Edit2 size={18} className="text-primary" />
                Edit Person
              </>
            ) : (
              <>
                <UserCircle2 size={18} className="text-primary" />
                Add New Person
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}

          {/* RFID UUID */}
          <div className="space-y-1.5">
            <label className={FORM_LABEL_CLASSNAME}>
              RFID UUID <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.rfid_uuid}
                onChange={(e) => {
                  setFormData({ ...formData, rfid_uuid: e.target.value });
                  setScanStatus("idle");
                  if (formErrors.rfid_uuid)
                    setFormErrors((prev) => ({
                      ...prev,
                      rfid_uuid: undefined,
                    }));
                }}
                required
                className={`${INPUT_CLASSNAME(!!formErrors.rfid_uuid)} h-10 flex-1`}
                placeholder={
                  isScanning
                    ? "Scanning… please scan the badge"
                    : "Enter UUID or scan badge"
                }
                disabled={isScanning}
              />
              <Button
                type="button"
                onClick={isScanning ? stopScanning : startScanning}
                title={isScanning ? "Stop scanning" : "Start scanning badge"}
                variant="outline"
                className={`h-10 gap-1.5 px-3 shrink-0 transition-colors ${
                  isScanning
                    ? "border-destructive text-destructive hover:bg-destructive/10"
                    : scanStatus === "success"
                      ? "border-green-500 text-green-600 hover:bg-green-50"
                      : scanStatus === "error"
                        ? "border-destructive text-destructive"
                        : "border-primary text-primary hover:bg-primary/10"
                }`}
              >
                <Scan size={16} className={isScanning ? "animate-pulse" : ""} />
                {isScanning ? "Stop" : "Scan"}
              </Button>
            </div>
            {isScanning && (
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="animate-pulse">●</span>
                Listening for badge scan…
              </p>
            )}
            {scanStatus === "success" && !isScanning && (
              <p className="text-xs text-green-600">
                ✓ Badge scanned successfully!
              </p>
            )}
            {scanStatus === "error" && !isScanning && (
              <p className="text-xs text-destructive">
                ✗ Scan failed or duplicate UUID detected
              </p>
            )}
            <FormFieldError message={formErrors.rfid_uuid} />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className={FORM_LABEL_CLASSNAME}>
              Type <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as FormData["type"],
                })
              }
              required
              className={`${INPUT_CLASSNAME(false)} h-10`}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="staff">Staff</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className={FORM_LABEL_CLASSNAME}>
              Last Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => {
                setFormData({ ...formData, nom: e.target.value });
                if (formErrors.nom)
                  setFormErrors((prev) => ({ ...prev, nom: undefined }));
              }}
              required
              className={`${INPUT_CLASSNAME(!!formErrors.nom)} h-10`}
              placeholder="Enter last name"
            />
            <FormFieldError message={formErrors.nom} />
          </div>

          {/* First Name */}
          <div className="space-y-1.5">
            <label className={FORM_LABEL_CLASSNAME}>
              First Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => {
                setFormData({ ...formData, prenom: e.target.value });
                if (formErrors.prenom)
                  setFormErrors((prev) => ({ ...prev, prenom: undefined }));
              }}
              required
              className={`${INPUT_CLASSNAME(!!formErrors.prenom)} h-10`}
              placeholder="Enter first name"
            />
            <FormFieldError message={formErrors.prenom} />
          </div>

          {/* Photo */}
          <div className="space-y-1.5">
            <label className={FORM_LABEL_CLASSNAME}>Photo</label>
            {photoPreview && (
              <div className="mb-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border theme-border"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
              className={`${INPUT_CLASSNAME(false)} h-10 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-muted-foreground cursor-pointer`}
            />
            <p className="text-xs theme-text-muted">
              Accepted: JPEG, PNG, WebP (max 5 MB) — optional
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={uploadingPhoto}
              className="flex-1 h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadingPhoto}
              className="flex-1 h-10 gap-2"
            >
              {uploadingPhoto ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Uploading…
                </>
              ) : editingPerson ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PersonsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [persons, setPersons] = useState<PersonWithPayments[]>([]);
  const [allPersons, setAllPersons] = useState<PersonWithPayments[]>([]); // Store all persons for dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
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
  const [formErrors, setFormErrors] = useState<{
    rfid_uuid?: string;
    nom?: string;
    prenom?: string;
  }>({});

  const loadPersons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = typeFilter
        ? `/api/persons?type=${typeFilter}`
        : "/api/persons";
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
          const url = typeFilter
            ? `/api/persons?type=${typeFilter}`
            : "/api/persons";
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
        const url = typeFilter
          ? `/api/search?q=${encodeURIComponent(searchTerm)}&type=${typeFilter}`
          : `/api/search?q=${encodeURIComponent(searchTerm)}`;
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
        const url = typeFilter
          ? `/api/persons?type=${typeFilter}`
          : "/api/persons";
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
  }

  function clearSearchSelection() {
    setSelectedPersonId(null);
    setSearchTerm("");
    loadPersons();
  }

  async function resetAllFilters() {
    setTypeFilter("");
    setSearchTerm("");
    setSelectedPersonId(null);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/persons");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load persons");
      setPersons(data);
      setAllPersons(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
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
    setFormErrors({});
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

  function validateForm(): boolean {
    const errors: typeof formErrors = {};
    if (!formData.rfid_uuid.trim()) {
      errors.rfid_uuid = "RFID UUID is required.";
    } else if (checkDuplicateUUID(formData.rfid_uuid)) {
      errors.rfid_uuid = "This UUID already exists in the system.";
    }
    if (!formData.nom.trim()) errors.nom = "Last name is required.";
    if (!formData.prenom.trim()) errors.prenom = "First name is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
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
        id: "avatar",
        enableSorting: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="" />
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <UserAvatar
              src={row.original.photo}
              name={`${row.original.first_name} ${row.original.last_name}`}
            />
          </div>
        ),
      },
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
          <span className="text-sm theme-text-muted font-mono">
            {row.getValue("id")}
          </span>
        ),
      },

      {
        accessorKey: "first_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="First Name" />
        ),
        cell: ({ row }) => (
          <span className="cell-person-name">{row.original.first_name}</span>
        ),
      },
      {
        accessorKey: "last_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last Name" />
        ),
        cell: ({ row }) => (
          <span className="cell-person-name">{row.original.last_name}</span>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={`capitalize ${typeColors[row.original.type] ?? "theme-badge-muted"}`}
          >
            {row.original.type}
          </Badge>
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
      {
        id: "payment_status",
        accessorKey: "payment_status",
        enableSorting: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment Status" />
        ),
        cell: ({ row }) => {
          const person = row.original;
          return (
            <div>
              {person.type === "student" ? (
                <div className="flex gap-2 text-xs justify-center">
                  <span
                    className={
                      person.trimester1_paid ? "font-medium" : "font-medium"
                    }
                    style={{
                      color: person.trimester1_paid
                        ? "var(--success)"
                        : "var(--error)",
                    }}
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
                    className="font-medium"
                    style={{
                      color: person.trimester3_paid
                        ? "var(--success)"
                        : "var(--error)",
                    }}
                  >
                    T3: {person.trimester3_paid ? "✓" : "✗"}
                  </span>
                </div>
              ) : (
                <span className="theme-text-muted">N/A</span>
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
          <span className="text-sm theme-text-muted">
            {new Date(row.original.updated_at).toLocaleDateString("en-US", {
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
                {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
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
    [handleDelete],
  );

  return (
    <div className="page-container h-full">
      <header className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            <Users size={28} className="page-title-icon" aria-hidden />
            Person Management
          </h1>
          <p className="page-subtitle">
            Manage students, teachers, staff, and visitors
          </p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="gap-2"
            >
              <Plus size={20} />
              Add Person
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
            title="View person statistics"
            onClick={() => router.push("/dashboard/persons/statistics")}
          >
            <BarChart3 className="size-4" />
            Statistics
          </Button>
          <Button
            onClick={loadPersons}
            className="gap-2"
            title="Refresh persons"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </header>

      <PersonFiltersSection
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        allPersons={allPersons}
        searchTerm={searchTerm}
        onSearchChange={handleSearchInputChange}
        selectedPersonId={selectedPersonId}
        onPersonSelect={handlePersonSelect}
        onClearSearch={clearSearchSelection}
        loadPersons={loadPersons}
        onResetFilters={resetAllFilters}
      />

      {error && (
        <div className="alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Form Dialog */}
      <PersonFormDialog
        open={showForm}
        onOpenChange={(open) => !open && resetForm()}
        editingPerson={editingPerson}
        error={error}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        isScanning={isScanning}
        scanStatus={scanStatus}
        setScanStatus={setScanStatus}
        startScanning={startScanning}
        stopScanning={stopScanning}
        photoPreview={photoPreview}
        handlePhotoChange={handlePhotoChange}
        handleSubmit={handleSubmit}
        uploadingPhoto={uploadingPhoto}
        resetForm={resetForm}
      />

      <div className="relative flex-1 h-full w-full">
        {loading ? (
          <Loading />
        ) : (
          <DataTable<PersonWithPayments, unknown>
            data={persons}
            columns={personColumns}
            emptyMessage="No persons found"
            pageSize={filters.limit}
            onPageSizeChange={(size) =>
              setFilters((f) => ({ ...f, limit: size }))
            }
          />
        )}
      </div>
    </div>
  );
}
