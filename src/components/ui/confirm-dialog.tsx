"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "outline-destructive";
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "outline-destructive",
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage confirm dialog state
 * Returns [confirmDialog, openDialog] tuple
 *
 * Usage:
 * const [deleteDialog, confirmDelete] = useConfirmDialog({
 *   title: "Delete item",
 *   description: "Are you sure?",
 *   onConfirm: () => handleDelete(),
 * });
 *
 * return (
 *   <>
 *     {deleteDialog}
 *     <button onClick={confirmDelete}>Delete</button>
 *   </>
 * );
 */
export function useConfirmDialog(
  props: Omit<ConfirmDialogProps, "open" | "onOpenChange">
) {
  const [open, setOpen] = useState(false);

  const dialog = (
    <ConfirmDialog {...props} open={open} onOpenChange={setOpen} />
  );

  const openDialog = () => setOpen(true);

  return [dialog, openDialog] as const;
}
