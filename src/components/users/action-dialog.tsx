"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { SelectDropdown } from "@/components/select-dropdown";
import { User, UserRoleEnum } from "@/types";
import { userFormSchema, type UserForm } from "@/schemas";

export function UsersActionDialog({
  currentRow,
  onSuccess,
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: User;
  onSuccess?: () => void;
}) {
  const isEdit = !!currentRow;
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const form = useForm<UserForm>({
    resolver: zodResolver(userFormSchema),
    defaultValues: isEdit
      ? {
          firstName: currentRow.first_name ?? undefined,
          lastName: currentRow.last_name ?? undefined,
          email: currentRow.email,
          role: currentRow.role,
          isActive: currentRow.is_active,
          image: currentRow.image ?? undefined,
          password: "",
          confirmPassword: "",
          isEdit,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          role: "",
          password: "",
          confirmPassword: "",
          isActive: true,
          image: "",
          isEdit,
        },
  });

  const onSubmit = async (values: UserForm) => {
    const url = isEdit ? `/api/users/${currentRow.id}` : "/api/users";
    const method = isEdit ? "PUT" : "POST";

    const body: Record<string, unknown> = {
      email: values.email,
      role: values.role,
      first_name: values.firstName || null,
      last_name: values.lastName || null,
      is_active: values.isActive,
    };

    // Only send password if provided (required for create, optional for edit)
    if (values.password) body.password = values.password;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Operation failed");

      form.reset();
      onOpenChange(false);
      onSuccess?.();
      toast.success(isEdit ? "User updated successfully." : "User created successfully.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save user.");
    }
  };

  const isPasswordTouched = !!form.formState.dirtyFields.password;

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        setShowPasswordFields(false);
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the user here. " : "Create new user here. "}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 px-0.5"
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        className="col-span-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Role</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select a role"
                      className="col-span-4"
                      items={Object.values(UserRoleEnum).map((role) => ({
                        label: role,
                        value: role,
                      }))}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              {isEdit && (
                <div className="grid grid-cols-6 items-center gap-x-4">
                  <span className="col-span-2 text-end text-sm font-medium">
                    Password
                  </span>
                  <label className="col-span-4 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={showPasswordFields}
                      onCheckedChange={(checked) => {
                        setShowPasswordFields(!!checked);
                        if (!checked) {
                          form.setValue("password", "");
                          form.setValue("confirmPassword", "");
                          form.clearErrors(["password", "confirmPassword"]);
                        }
                      }}
                    />
                    Change password
                  </label>
                </div>
              )}
              {(!isEdit || showPasswordFields) && (
                <>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="e.g., S3cur3P@ssw0rd"
                            className="col-span-4"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            disabled={!isPasswordTouched}
                            placeholder="e.g., S3cur3P@ssw0rd"
                            className="col-span-4"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            form="user-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
