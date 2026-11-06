import { Dialog, IconButton } from "@radix-ui/themes";
import { X } from "lucide-react";
import { type ReactNode, useRef } from "react";

export function AtlasDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        className="atlas-dialog"
        maxWidth="480px"
        onOpenAutoFocus={() => {
          returnFocus.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <div className="dialog-eyebrow">
          <span>LINIE / LOCAL OPERATIONS</span>
          <Dialog.Close>
            <IconButton variant="ghost" size="1" aria-label="Close dialog">
              <X size={16} />
            </IconButton>
          </Dialog.Close>
        </div>
        <Dialog.Title className="dialog-title">{title}</Dialog.Title>
        <Dialog.Description className="dialog-description">
          {description}
        </Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Root>
  );
}
