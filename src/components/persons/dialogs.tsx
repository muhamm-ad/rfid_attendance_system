import { PersonsActionDialog } from "@/components/persons/action-dialog";
import { PersonsDeleteDialog } from "@/components/persons/delete-dialog";
import { usePersons } from "@/hooks/use-persons";

export function PersonsDialogs({ onSuccess }: { onSuccess?: () => void }) {
  const { open, setOpen, currentRow, setCurrentRow } = usePersons();

  const closeWithDelay = (setter: () => void) => {
    setter();
    setTimeout(() => setCurrentRow(null), 500);
  };

  return (
    <>
      <PersonsActionDialog
        key="person-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
        onSuccess={onSuccess}
      />

      {currentRow && (
        <>
          <PersonsActionDialog
            key={`person-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={() => closeWithDelay(() => setOpen("edit"))}
            currentRow={currentRow}
            onSuccess={onSuccess}
          />

          <PersonsDeleteDialog
            key={`person-delete-${currentRow.id}`}
            open={open === "delete"}
            onOpenChange={() => closeWithDelay(() => setOpen("delete"))}
            currentRow={currentRow}
            onSuccess={onSuccess}
          />
        </>
      )}
    </>
  );
}
