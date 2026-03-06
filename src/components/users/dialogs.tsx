import { UsersActionDialog } from "@/components/users/action-dialog";
import { UsersDeleteDialog } from "@/components/users/delete-dialog";
import { UsersInviteDialog } from "@/components/users/invite-dialog";
import { useUsers } from "@/hooks/use-users";

export function UsersDialogs({ onSuccess }: { onSuccess?: () => void }) {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers();

  const closeWithDelay = (setter: () => void) => {
    setter();
    setTimeout(() => setCurrentRow(null), 500);
  };

  return (
    <>
      <UsersActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
        onSuccess={onSuccess}
      />

      <UsersInviteDialog
        key="user-invite"
        open={open === "invite"}
        onOpenChange={() => setOpen("invite")}
        onSuccess={onSuccess}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={() => closeWithDelay(() => setOpen("edit"))}
            currentRow={currentRow}
            onSuccess={onSuccess}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
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
